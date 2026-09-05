"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { randomBytes, randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { signSession } from "@/lib/session";
import { setSessionCookie } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import {
  secondsUntilUnlock,
  recordFailure,
  clearFailures,
} from "@/lib/rate-limit";

export type LoginState = { error?: string };
export type SignupState = { error?: string; pendingEmail?: string };
export type VerifyState = { error?: string };
export type ResendState = { error?: string; sent?: boolean };

const CODE_TTL_MS = 15 * 60 * 1000;

function formatWait(seconds: number): string {
  const mins = Math.ceil(seconds / 60);
  return mins <= 1 ? "about a minute" : `about ${mins} minutes`;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function newCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const id = `${await clientIp()}:${email}`;
  const wait = await secondsUntilUnlock(id);
  if (wait !== null) {
    return { error: `Too many attempts. Try again in ${formatWait(wait)}.` };
  }

  const { rows } = await pool.query(
    "SELECT id, email, name, password_hash, verified FROM users WHERE email = $1",
    [email]
  );
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    await recordFailure(id);
    return { error: "Wrong email or password." };
  }

  if (!user.verified) {
    return { error: "Verify your email first — sign up again to get a new code." };
  }

  await clearFailures(id);

  const token = await signSession({
    id: String(user.id),
    email: user.email,
    name: user.name,
  });
  await setSessionCookie(token);
  redirect("/");
}

export async function signup(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const name =
    String(formData.get("name") ?? "").trim() || email.split("@")[0];

  const id = `signup:${await clientIp()}`;
  const wait = await secondsUntilUnlock(id);
  if (wait !== null) {
    return { error: `Too many attempts. Try again in ${formatWait(wait)}.` };
  }

  if (!email || !password) {
    return { error: "Enter your email and a password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const { rows } = await pool.query(
    "SELECT id, verified FROM users WHERE email = $1",
    [email]
  );
  const existing = rows[0];
  if (existing?.verified) {
    return { error: "An account with that email already exists. Sign in instead." };
  }

  const password_hash = await bcrypt.hash(password, 10);
  const code = newCode();
  const code_hash = await bcrypt.hash(code, 10);
  const expires = new Date(Date.now() + CODE_TTL_MS);

  if (existing) {
    // Unverified row from an earlier attempt — overwrite it and resend.
    await pool.query(
      `UPDATE users
         SET name = $1, password_hash = $2,
             verify_code_hash = $3, verify_expires_at = $4
       WHERE id = $5`,
      [name, password_hash, code_hash, expires, existing.id]
    );
  } else {
    await pool.query(
      `INSERT INTO users (email, name, password_hash, verify_code_hash, verify_expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, name, password_hash, code_hash, expires]
    );
  }

  try {
    await sendVerificationEmail(email, code);
  } catch (err) {
    console.error(err);
    return { error: "Couldn't send the verification email. Try again in a moment." };
  }

  // Count sends against the throttle so nobody can spam the mailer.
  await recordFailure(id);
  return { pendingEmail: email };
}

export async function verifyCode(
  _prev: VerifyState,
  formData: FormData
): Promise<VerifyState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !code) {
    return { error: "Enter the code from your email." };
  }

  const id = `verify:${await clientIp()}:${email}`;
  const wait = await secondsUntilUnlock(id);
  if (wait !== null) {
    return { error: `Too many attempts. Try again in ${formatWait(wait)}.` };
  }

  const { rows } = await pool.query(
    `SELECT id, email, name, verified, verify_code_hash, verify_expires_at
       FROM users WHERE email = $1`,
    [email]
  );
  const user = rows[0];

  const expired =
    !user?.verify_expires_at || new Date(user.verify_expires_at) < new Date();
  const bad =
    !user ||
    user.verified ||
    !user.verify_code_hash ||
    expired ||
    !(await bcrypt.compare(code, user.verify_code_hash));

  if (bad) {
    await recordFailure(id);
    return { error: "That code is wrong or has expired." };
  }

  await clearFailures(id);

  // Verified — generate the permanent per-user ingest key, server-side,
  // with real entropy. This is the device secret; it never came from email.
  const ingestKey = randomBytes(32).toString("hex");
  await pool.query(
    `UPDATE users
       SET verified = true, ingest_key = $1,
           verify_code_hash = NULL, verify_expires_at = NULL
     WHERE id = $2`,
    [ingestKey, user.id]
  );

  const token = await signSession({
    id: String(user.id),
    email: user.email,
    name: user.name,
  });
  await setSessionCookie(token);
  redirect("/");
}

export async function resendCode(
  _prev: ResendState,
  formData: FormData
): Promise<ResendState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();

  const id = `signup:${await clientIp()}`;
  const wait = await secondsUntilUnlock(id);
  if (wait !== null) {
    return { error: `Too many attempts. Try again in ${formatWait(wait)}.` };
  }

  const { rows } = await pool.query(
    "SELECT id, verified FROM users WHERE email = $1",
    [email]
  );
  const user = rows[0];

  // Only act for a real unverified row, but always report "sent" so this
  // can't be used to probe which emails have accounts.
  if (user && !user.verified) {
    const code = newCode();
    const code_hash = await bcrypt.hash(code, 10);
    const expires = new Date(Date.now() + CODE_TTL_MS);
    await pool.query(
      "UPDATE users SET verify_code_hash = $1, verify_expires_at = $2 WHERE id = $3",
      [code_hash, expires, user.id]
    );
    try {
      await sendVerificationEmail(email, code);
      await recordFailure(id);
    } catch (err) {
      console.error(err);
      return { error: "Couldn't send the email. Try again shortly." };
    }
  }

  return { sent: true };
}
