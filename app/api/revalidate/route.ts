import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  errorResponse,
  verifyFirebaseAdmin,
} from "@/lib/firebase/verify-admin-server";
import {
  targetsForRevalidateScope,
  type SiteRevalidateScope,
} from "@/lib/cms/site-revalidate";

const SCOPES = new Set<SiteRevalidateScope>([
  "profile",
  "research",
  "publications",
  "gallery",
  "blog",
  "all",
]);

export async function POST(request: Request) {
  try {
    await verifyFirebaseAdmin(request);
    const body = (await request.json()) as { scope?: unknown };
    const scope =
      typeof body.scope === "string" &&
      SCOPES.has(body.scope as SiteRevalidateScope)
        ? (body.scope as SiteRevalidateScope)
        : "all";

    const targets = targetsForRevalidateScope(scope);
    for (const target of targets) {
      if (target.type) {
        revalidatePath(target.path, target.type);
      } else {
        revalidatePath(target.path);
      }
    }
    // Clear shared layout shell so soft navigations don't keep a stale tree.
    revalidatePath("/", "layout");

    return NextResponse.json({
      ok: true,
      scope,
      paths: targets.map((t) => t.path),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
