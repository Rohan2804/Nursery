"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { sendReset, signIn } from "./actions";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  return (
    <div className="space-y-4">
      {mode === "signin" ? <SignIn next={next} notice={notice} /> : <Reset />}
      <button type="button" onClick={() => setMode(mode === "signin" ? "reset" : "signin")} className="text-sm font-semibold text-moss hover:underline">
        {mode === "signin" ? "Forgot your password?" : "Back to sign in"}
      </button>
    </div>
  );
}

function SignIn({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <h2 className="font-display text-4xl">Sign in</h2>
      {notice && !state && <p className="rounded-xl bg-brass/15 px-4 py-3 text-sm">{notice}</p>}
      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Email</span>
        <input className="input" name="email" type="email" autoComplete="username" required autoFocus />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Password</span>
        <input className="input" name="password" type="password" autoComplete="current-password" required />
      </label>
      <Submit pending={pending}>Sign in</Submit>
    </form>
  );
}

function Reset() {
  const [state, action, pending] = useActionState(sendReset, undefined);
  return (
    <form action={action} className="space-y-4">
      <h2 className="font-display text-4xl">Reset password</h2>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.sent ? (
        <p className="rounded-xl bg-moss/15 px-4 py-3 text-sm">If that email belongs to an admin, a reset link is on its way.</p>
      ) : (
        <>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Email</span>
            <input className="input" name="email" type="email" autoComplete="username" required autoFocus />
          </label>
          <Submit pending={pending}>Send reset link</Submit>
        </>
      )}
    </form>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-950 font-semibold text-cream transition-colors hover:bg-forest-700 disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
      {children}
    </button>
  );
}
