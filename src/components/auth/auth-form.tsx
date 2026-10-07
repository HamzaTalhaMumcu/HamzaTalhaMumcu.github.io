"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => (
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("error")
  ));
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
        : await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });

      if (result.error) {
        const message = result.error.message.toLowerCase();
        if (message.includes("user already registered")) {
          setError("This email address is already registered. Try logging in instead.");
        } else if (message.includes("email signups are disabled")) {
          setError("Email sign-ups are currently disabled in the Supabase settings.");
        } else if (message.includes("redirect") || message.includes("not allowed")) {
          setError("The sign-up redirect is not allowed. Check your Supabase URL Configuration settings.");
        } else if (message.includes("invalid api key")) {
          setError("The Supabase key is invalid. Check the NEXT_PUBLIC_SUPABASE_ANON_KEY value.");
        } else {
          setError(result.error.message);
        }
      } else if (mode === "signup" && !result.data.session) {
        setError("Sign-up complete. Check your email to activate your account.");
      } else {
        router.push("/dashboard");
      }
    } catch (caughtError) {
      console.error("Authentication request failed:", caughtError);
      setError("A connection error occurred during sign-up. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="space-y-5">
    <label className="block text-sm font-medium text-[#334038]">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none ring-[#e45b35] focus:ring-2" /></label>
    <label className="block text-sm font-medium text-[#334038]">Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none ring-[#e45b35] focus:ring-2" /></label>
    {error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-4 py-3 text-sm text-[#b44325]">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-[#17201b] px-4 py-3 font-semibold text-white hover:bg-[#2b3d32] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
  </form>;
}
