import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  firebaseConfigured,
  getFirebaseAuth,
  getFirebaseFirestore,
} from "./config";

export type AdminAuthState =
  | { status: "loading"; user: null; isAdmin: false }
  | { status: "signed-out"; user: null; isAdmin: false }
  | { status: "admin"; user: User; isAdmin: true }
  | {
      status: "unauthorized";
      user: null;
      isAdmin: false;
      attemptedUser: Pick<User, "uid" | "email" | "displayName">;
    }
  | { status: "error"; user: null; isAdmin: false; message: string };

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function isPermissionDenied(error: unknown): boolean {
  const details = error as { code?: string; message?: string };
  return (
    details.code === "permission-denied" ||
    details.code === "firestore/permission-denied" ||
    /insufficient permissions/i.test(details.message ?? "")
  );
}

/**
 * Single-document admin check only: getDoc(admins/{uid}).
 * Never lists the admins collection.
 */
export async function isAuthorizedAdmin(user: User): Promise<boolean> {
  await user.getIdToken();

  const snapshot = await getDoc(
    doc(getFirebaseFirestore(), "admins", user.uid),
  );
  return snapshot.exists();
}

/** Google popup only — admin verification happens in subscribeToAdminAuth. */
export async function signInAdminWithGoogle(): Promise<User> {
  if (!firebaseConfigured) {
    throw new Error("Firebase environment variables are missing.");
  }

  const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
  await result.user.getIdToken(true);
  return result.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(getFirebaseAuth());
  window.dispatchEvent(new Event("okafor-blog-auth"));
}

export function subscribeToAdminAuth(
  callback: (state: AdminAuthState) => void,
): () => void {
  if (!firebaseConfigured) {
    callback({
      status: "error",
      user: null,
      isAdmin: false,
      message: "Firebase environment variables are missing.",
    });
    return () => undefined;
  }

  let cancelled = false;
  let generation = 0;
  /** Skip the signed-out event caused by signOut after unauthorized/error. */
  let ignoreNextSignedOut = false;

  const unsubscribe = onAuthStateChanged(
    getFirebaseAuth(),
    (user) => {
      if (!user) {
        if (ignoreNextSignedOut) {
          ignoreNextSignedOut = false;
          return;
        }
        generation += 1;
        callback({ status: "signed-out", user: null, isAdmin: false });
        window.dispatchEvent(new Event("okafor-blog-auth"));
        return;
      }

      const current = ++generation;
      callback({ status: "loading", user: null, isAdmin: false });

      void (async () => {
        try {
          const allowed = await isAuthorizedAdmin(user);
          if (cancelled || current !== generation) return;

          if (!allowed) {
            const attemptedUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            };
            ignoreNextSignedOut = true;
            await signOut(getFirebaseAuth()).catch(() => undefined);
            if (cancelled) return;
            callback({
              status: "unauthorized",
              user: null,
              isAdmin: false,
              attemptedUser,
            });
            return;
          }

          callback({ status: "admin", user, isAdmin: true });
          window.dispatchEvent(new Event("okafor-blog-auth"));
        } catch (error) {
          if (cancelled || current !== generation) return;

          ignoreNextSignedOut = true;
          await signOut(getFirebaseAuth()).catch(() => undefined);
          if (cancelled) return;

          if (isPermissionDenied(error)) {
            callback({
              status: "error",
              user: null,
              isAdmin: false,
              message:
                `Permission denied on getDoc(admins/${user.uid}). ` +
                "Publish the project's Firestore rules (firestore.rules) in Firebase Console, then try again.",
            });
            return;
          }

          callback({
            status: "error",
            user: null,
            isAdmin: false,
            message:
              error instanceof Error
                ? error.message
                : "Could not verify administrator access.",
          });
        }
      })();
    },
    (error) => {
      callback({
        status: "error",
        user: null,
        isAdmin: false,
        message: error.message,
      });
    },
  );

  return () => {
    cancelled = true;
    unsubscribe();
  };
}
