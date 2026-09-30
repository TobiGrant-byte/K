"use client";

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  getAuth,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  firebaseConfigured,
  getFirebaseAuth,
  getFirebaseFirestore,
} from "@/lib/firebase/config";
import type { AdminRecord } from "@/lib/firebase/admin-types";

const ADMINS = "admins";
const ADMIN_USERNAMES = "adminUsernames";
const SECONDARY_APP_NAME = "admin-invite";

export function normalizeAdminUsername(username: string): string {
  return username.trim().toLowerCase();
}

async function setUsernameLookup(input: {
  username: string;
  email: string;
  uid: string;
}): Promise<void> {
  const key = normalizeAdminUsername(input.username);
  if (!key || !input.email) return;
  await setDoc(doc(getFirebaseFirestore(), ADMIN_USERNAMES, key), {
    username: input.username.trim(),
    email: input.email.trim().toLowerCase(),
    uid: input.uid,
  });
}

async function deleteUsernameLookup(username: string): Promise<void> {
  const key = normalizeAdminUsername(username);
  if (!key) return;
  await deleteDoc(doc(getFirebaseFirestore(), ADMIN_USERNAMES, key)).catch(
    () => undefined,
  );
}

/** Resolve login identifier to an email (username lookup or email as-is). */
export async function resolveAdminLoginEmail(
  usernameOrEmail: string,
): Promise<string> {
  const trimmed = usernameOrEmail.trim();
  if (!trimmed) throw new Error("Username or email is required.");
  if (trimmed.includes("@")) return trimmed.toLowerCase();

  const key = normalizeAdminUsername(trimmed);
  const snap = await getDoc(doc(getFirebaseFirestore(), ADMIN_USERNAMES, key));
  if (!snap.exists()) {
    throw new Error("No admin found with that username.");
  }
  const email = String(snap.data()?.email ?? "")
    .trim()
    .toLowerCase();
  if (!email) throw new Error("No admin found with that username.");
  return email;
}

/** Same project config as the main app — separate Auth instance so invites don't swap the signed-in admin. */
function getSecondaryAuth() {
  const primary = getApps()[0];
  if (!primary) {
    throw new Error("Firebase is not initialized.");
  }
  const existing = getApps().find((app) => app.name === SECONDARY_APP_NAME);
  const app: FirebaseApp = existing
    ? existing
    : initializeApp(primary.options, SECONDARY_APP_NAME);
  return getAuth(app);
}

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === "string") return value;
  return null;
}

function docToRecord(uid: string, data: Record<string, unknown>): AdminRecord {
  return {
    uid,
    username: String(data.username ?? "").trim() || "Admin",
    email: String(data.email ?? "").trim(),
    providers: Array.isArray(data.providers)
      ? data.providers.map(String)
      : [],
    createdAt: timestampToIso(data.createdAt),
    createdBy: String(data.createdBy ?? "seed"),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

function requireCurrentAdmin(): User {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("You must be signed in.");
  return user;
}

/**
 * Backfill sparse allowlist docs (often created empty in Console) for the
 * signed-in admin so Manage Admins shows a useful username/email.
 */
async function ensureCurrentAdminProfile(user: User): Promise<void> {
  const ref = doc(getFirebaseFirestore(), ADMINS, user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as Record<string, unknown>;
  const email = user.email?.trim() || String(data.email ?? "").trim();
  const username =
    String(data.username ?? "").trim() ||
    user.displayName?.trim() ||
    (email ? email.split("@")[0] : "") ||
    "Admin";
  const providers =
    Array.isArray(data.providers) && data.providers.length > 0
      ? data.providers.map(String)
      : user.providerData.map((p) => p.providerId).filter(Boolean);

  const needsBackfill =
    !String(data.username ?? "").trim() ||
    !String(data.email ?? "").trim() ||
    !Array.isArray(data.providers) ||
    data.providers.length === 0;

  if (!needsBackfill) {
    // Keep username→email lookup in sync for login-by-username.
    await setUsernameLookup({
      username,
      email,
      uid: user.uid,
    }).catch(() => undefined);
    return;
  }

  try {
    await setDoc(
      ref,
      {
        username,
        email,
        providers,
        createdBy: data.createdBy ?? "seed",
        createdAt: data.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    await setUsernameLookup({ username, email, uid: user.uid });
  } catch {
    // Non-fatal — listing can still proceed if rules allow list.
  }
}

export async function listAdmins(): Promise<AdminRecord[]> {
  if (!firebaseConfigured) {
    throw new Error("Firebase is not configured.");
  }
  const user = requireCurrentAdmin();
  await ensureCurrentAdminProfile(user);

  const snapshot = await getDocs(collection(getFirebaseFirestore(), ADMINS));
  const records = snapshot.docs.map((item) =>
    docToRecord(item.id, item.data() as Record<string, unknown>),
  );

  // Ensure username logins work for every allowlisted admin.
  await Promise.all(
    records.map((admin) =>
      admin.username && admin.email
        ? setUsernameLookup({
            username: admin.username,
            email: admin.email,
            uid: admin.uid,
          }).catch(() => undefined)
        : Promise.resolve(),
    ),
  );

  records.sort((a, b) => a.email.localeCompare(b.email));
  return records;
}

export async function createAdminAccount(input: {
  username: string;
  email: string;
  password: string;
}): Promise<AdminRecord> {
  if (!firebaseConfigured) {
    throw new Error("Firebase is not configured.");
  }

  const actor = requireCurrentAdmin();
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!username) throw new Error("Username is required.");
  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const usernameKey = normalizeAdminUsername(username);
  const usernameTaken = await getDoc(
    doc(getFirebaseFirestore(), ADMIN_USERNAMES, usernameKey),
  );
  if (usernameTaken.exists()) {
    throw new Error("That username is already taken.");
  }

  const secondary = getSecondaryAuth();
  let uid = "";
  let providers = ["password"];

  try {
    try {
      const credential = await createUserWithEmailAndPassword(
        secondary,
        email,
        password,
      );
      uid = credential.user.uid;
      await updateProfile(credential.user, { displayName: username });
      providers = credential.user.providerData
        .map((p) => p.providerId)
        .filter(Boolean);
      if (providers.length === 0) providers = ["password"];
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        // Likely an orphan from a previous attempt, or an existing password user.
        // Sign in on the secondary app and grant CMS access if the password matches.
        try {
          const existing = await signInWithEmailAndPassword(
            secondary,
            email,
            password,
          );
          uid = existing.user.uid;
          await updateProfile(existing.user, { displayName: username }).catch(
            () => undefined,
          );
          providers = existing.user.providerData
            .map((p) => p.providerId)
            .filter(Boolean);
          if (providers.length === 0) providers = ["password"];
        } catch {
          const methods = await fetchSignInMethodsForEmail(
            getFirebaseAuth(),
            email,
          ).catch(() => [] as string[]);
          if (methods.includes("google.com") && !methods.includes("password")) {
            throw new Error(
              "This email is already used by a Google sign-in. They should use Continue with Google — add their UID under admins in Firebase if needed.",
            );
          }
          throw new Error(
            "This email already exists in Firebase Authentication (check Authentication → Users). Delete that user there if it was a failed test, or use Reset email if they already have a password.",
          );
        }
      } else if (code === "auth/weak-password") {
        throw new Error("Password is too weak.");
      } else if (code === "auth/invalid-email") {
        throw new Error("Email address is invalid.");
      } else {
        throw error instanceof Error
          ? error
          : new Error("Could not create account.");
      }
    }

    const existingAdmin = await getDoc(doc(getFirebaseFirestore(), ADMINS, uid));
    if (existingAdmin.exists()) {
      throw new Error("This account is already an admin.");
    }

    const record = {
      username,
      email,
      providers,
      createdAt: serverTimestamp(),
      createdBy: actor.uid,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(getFirebaseFirestore(), ADMINS, uid), record);
    await setUsernameLookup({ username, email, uid });

    return {
      uid,
      username,
      email,
      providers,
      createdAt: new Date().toISOString(),
      createdBy: actor.uid,
      updatedAt: new Date().toISOString(),
    };
  } finally {
    await signOut(secondary).catch(() => undefined);
  }
}

/** Sends Firebase's password-reset email. User chooses their own new password. */
export async function sendAdminResetEmail(email: string): Promise<void> {
  if (!firebaseConfigured) {
    throw new Error("Firebase is not configured.");
  }
  requireCurrentAdmin();
  const trimmed = email.trim();
  if (!trimmed) throw new Error("This admin has no email address.");
  await sendPasswordResetEmail(getFirebaseAuth(), trimmed);
}

/**
 * Revoke CMS access by removing the allowlist doc only.
 * Does not delete the Firebase Auth user (no Admin SDK).
 */
export async function revokeAdminAccess(uid: string): Promise<void> {
  if (!firebaseConfigured) {
    throw new Error("Firebase is not configured.");
  }
  const actor = requireCurrentAdmin();
  const signedInWithGoogle = actor.providerData.some(
    (p) => p.providerId === "google.com",
  );
  if (!signedInWithGoogle) {
    throw new Error("Only Google admins can remove other admins.");
  }
  if (uid === actor.uid) {
    throw new Error("You cannot remove your own admin access.");
  }

  const snapshot = await getDocs(collection(getFirebaseFirestore(), ADMINS));
  if (snapshot.size <= 1) {
    throw new Error("Cannot remove the last remaining admin.");
  }
  if (!snapshot.docs.some((item) => item.id === uid)) {
    throw new Error("Admin not found.");
  }

  const target = snapshot.docs.find((item) => item.id === uid);
  const username = String(target?.data()?.username ?? "");

  await deleteDoc(doc(getFirebaseFirestore(), ADMINS, uid));
  await deleteUsernameLookup(username);
}

export async function updateAdminUsername(
  uid: string,
  username: string,
): Promise<void> {
  const trimmed = username.trim();
  if (!trimmed) throw new Error("Username cannot be empty.");
  requireCurrentAdmin();

  const ref = doc(getFirebaseFirestore(), ADMINS, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Admin not found.");

  const previous = String(snap.data()?.username ?? "");
  const email = String(snap.data()?.email ?? "").trim().toLowerCase();
  const key = normalizeAdminUsername(trimmed);
  const taken = await getDoc(doc(getFirebaseFirestore(), ADMIN_USERNAMES, key));
  if (taken.exists() && taken.data()?.uid !== uid) {
    throw new Error("That username is already taken.");
  }

  await updateDoc(ref, {
    username: trimmed,
    updatedAt: serverTimestamp(),
  });
  if (normalizeAdminUsername(previous) !== key) {
    await deleteUsernameLookup(previous);
  }
  await setUsernameLookup({ username: trimmed, email, uid });
}

export type AdminSettingsProfile = {
  uid: string;
  username: string;
  email: string;
  providers: string[];
  canChangePassword: boolean;
};

/** Load the signed-in admin’s editable settings profile. */
export async function getOwnAdminSettings(): Promise<AdminSettingsProfile> {
  if (!firebaseConfigured) {
    throw new Error("Firebase is not configured.");
  }
  const user = requireCurrentAdmin();
  await ensureCurrentAdminProfile(user);

  const snap = await getDoc(doc(getFirebaseFirestore(), ADMINS, user.uid));
  const data = (snap.data() ?? {}) as Record<string, unknown>;
  const providersFromAuth = user.providerData
    .map((p) => p.providerId)
    .filter(Boolean);
  const providers =
    providersFromAuth.length > 0
      ? providersFromAuth
      : Array.isArray(data.providers)
        ? data.providers.map(String)
        : [];

  return {
    uid: user.uid,
    username:
      String(data.username ?? "").trim() ||
      user.displayName?.trim() ||
      "Admin",
    email: user.email?.trim() || String(data.email ?? "").trim(),
    providers,
    canChangePassword: providers.includes("password"),
  };
}

/** Current admin updates their own username (Google or password accounts). */
export async function updateOwnUsername(username: string): Promise<void> {
  const user = requireCurrentAdmin();
  const trimmed = username.trim();
  if (!trimmed) throw new Error("Username cannot be empty.");

  await updateAdminUsername(user.uid, trimmed);
  await updateProfile(user, { displayName: trimmed }).catch(() => undefined);
}

/**
 * Current admin changes their password (password provider only).
 * Requires the current password for reauthentication.
 */
export async function updateOwnPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const user = requireCurrentAdmin();
  const email = user.email?.trim();
  if (!email) throw new Error("Your account has no email address.");
  if (!user.providerData.some((p) => p.providerId === "password")) {
    throw new Error(
      "This account signs in with Google only. Password changes are not available.",
    );
  }
  if (!input.currentPassword) {
    throw new Error("Current password is required.");
  }
  if (input.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const credential = EmailAuthProvider.credential(
    email,
    input.currentPassword,
  );
  try {
    await reauthenticateWithCredential(user, credential);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (
      code === "auth/wrong-password" ||
      code === "auth/invalid-credential"
    ) {
      throw new Error("Current password is incorrect.");
    }
    throw error instanceof Error
      ? error
      : new Error("Could not verify current password.");
  }

  await updatePassword(user, input.newPassword);
}
