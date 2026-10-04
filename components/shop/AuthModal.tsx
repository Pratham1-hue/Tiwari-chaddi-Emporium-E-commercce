"use client";

import { useState } from "react";
import { useShop } from "@/lib/shop-context";

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register } = useShop();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = mode === "login" ? await login(email, password) : await register(name, email, password);
    setBusy(false);
    if (res.ok) {
      onClose();
      setName("");
      setEmail("");
      setPassword("");
    } else {
      setError(res.message || "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Login or sign up">
      <div className="absolute inset-0 bg-stone-950/50" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-stone-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-stone-900">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            {mode === "login" ? "Log in to track orders, save addresses and check out faster." : "Join in 30 seconds. Track orders and save addresses."}
          </p>
        </div>
        <div className="flex gap-2 px-6 pt-4">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 cursor-pointer rounded-full py-2 text-sm font-semibold ${mode === m ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}
            >
              {m === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-3 px-6 py-5">
          {mode === "register" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-stone-500" />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" required className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-stone-500" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password (min 6 characters)" required minLength={6} className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-stone-500" />
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="w-full cursor-pointer rounded-xl bg-stone-900 py-3 text-sm font-bold text-white hover:bg-stone-700 disabled:opacity-50">
            {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
          </button>
          <p className="rounded-xl bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
            Demo accounts — Admin: <b>admin@chaddi.com / admin123</b> · Customer: <b>customer@demo.com / customer123</b>
            <br />You can also continue as guest at checkout.
          </p>
        </form>
      </div>
    </div>
  );
}
