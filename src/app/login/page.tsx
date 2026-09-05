"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  login,
  signup,
  verifyCode,
  resendCode,
  type LoginState,
  type SignupState,
  type VerifyState,
  type ResendState,
} from "./actions";

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? busy : idle}
    </button>
  );
}

function Brand() {
  return (
    <div className="login-brand">
      <span className="mark" aria-hidden />
      <div>
        <div className="wordmark">NODOLAB</div>
        <div className="sub">Field station telemetry</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [pendingEmail, setPendingEmail] = useState("");

  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {});
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {});
  const [verifyState, verifyAction] = useActionState<VerifyState, FormData>(verifyCode, {});
  const [resendState, resendAction] = useActionState<ResendState, FormData>(resendCode, {});

  // When signup succeeds, jump to the verify screen carrying the email.
  useEffect(() => {
    if (signupState.pendingEmail) {
      setPendingEmail(signupState.pendingEmail);
      setMode("verify");
    }
  }, [signupState.pendingEmail]);

  if (mode === "verify") {
    return (
      <main className="login-wrap">
        <form className="login-card" action={verifyAction}>
          <Brand />
          <p className="hint">
            We sent a 6-digit code to <strong>{pendingEmail}</strong>. Enter it
            below to finish setting up your account.
          </p>

          <input type="hidden" name="email" value={pendingEmail} />

          <label className="field">
            <span>Verification code</span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </label>

          {verifyState.error && <p className="error">{verifyState.error}</p>}

          <SubmitButton idle="Verify" busy="Verifying…" />
        </form>

        <form className="login-under" action={resendAction}>
          <input type="hidden" name="email" value={pendingEmail} />
          {resendState.sent && <p className="hint">A new code is on its way.</p>}
          {resendState.error && <p className="error">{resendState.error}</p>}
          <button type="submit" className="link-btn">
            Didn’t get it? Resend code
          </button>
          <button type="button" className="link-btn" onClick={() => setMode("login")}>
            Back to sign in
          </button>
        </form>
      </main>
    );
  }

  if (mode === "signup") {
    return (
      <main className="login-wrap">
        <form className="login-card" action={signupAction}>
          <Brand />

          <label className="field">
            <span>Name</span>
            <input name="name" type="text" autoComplete="name" />
          </label>

          <label className="field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {signupState.error && <p className="error">{signupState.error}</p>}

          <SubmitButton idle="Create account" busy="Sending code…" />

          <button type="button" className="link-btn" onClick={() => setMode("login")}>
            Already have an account? Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="login-wrap">
      <form className="login-card" action={loginAction}>
        <Brand />

        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="username" required />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {loginState.error && <p className="error">{loginState.error}</p>}

        <SubmitButton idle="Sign in" busy="Checking…" />

        <button type="button" className="link-btn" onClick={() => setMode("signup")}>
          Not registered? Sign up
        </button>
      </form>
    </main>
  );
}
