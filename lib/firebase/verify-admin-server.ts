import "server-only";

type VerifiedAdmin = {
  uid: string;
  email: string | null;
};

function bearerToken(request: Request): string {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Response("Authentication required.", { status: 401 });
  }
  return authorization.slice("Bearer ".length).trim();
}

/**
 * Verifies the Firebase ID token through Firebase Auth's REST API, then reads
 * admins/{uid} through Firestore using that same token. Firestore rules remain
 * the source of truth, so no Firebase service-account key is needed here.
 */
export async function verifyFirebaseAdmin(request: Request): Promise<VerifiedAdmin> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Response("Firebase server configuration is incomplete.", {
      status: 500,
    });
  }

  const token = bearerToken(request);
  const authResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
    },
  );

  if (!authResponse.ok) {
    throw new Response("Invalid or expired Firebase session.", { status: 401 });
  }

  const authData = (await authResponse.json()) as {
    users?: Array<{ localId?: string; email?: string }>;
  };
  const user = authData.users?.[0];
  if (!user?.localId) {
    throw new Response("Invalid Firebase user.", { status: 401 });
  }

  const adminDocumentUrl =
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}` +
    `/databases/(default)/documents/admins/${encodeURIComponent(user.localId)}`;
  const adminResponse = await fetch(adminDocumentUrl, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (adminResponse.status === 404 || adminResponse.status === 403) {
    throw new Response("Administrator access required.", { status: 403 });
  }
  if (!adminResponse.ok) {
    throw new Response("Could not verify administrator access.", { status: 502 });
  }

  return { uid: user.localId, email: user.email ?? null };
}

export function errorResponse(error: unknown): Response {
  if (error instanceof Response) return error;
  console.error(error);
  return new Response("Unexpected server error.", { status: 500 });
}
