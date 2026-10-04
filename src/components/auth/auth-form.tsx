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
          setError("Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.");
        } else if (message.includes("email signups are disabled")) {
          setError("E-posta ile kayıt şu anda Supabase ayarlarında devre dışı.");
        } else if (message.includes("redirect") || message.includes("not allowed")) {
          setError("Kayıt yönlendirmesi izinli değil. Supabase URL Configuration ayarlarını kontrol edin.");
        } else if (message.includes("invalid api key")) {
          setError("Supabase anahtarı geçersiz. NEXT_PUBLIC_SUPABASE_ANON_KEY değerini kontrol edin.");
        } else {
          setError(result.error.message);
        }
      } else if (mode === "signup" && !result.data.session) {
        setError("Kayıt tamamlandı. Hesabınızı etkinleştirmek için e-postanızı kontrol edin.");
      } else {
        router.push("/dashboard");
      }
    } catch (caughtError) {
      console.error("Authentication request failed:", caughtError);
      setError("Kayıt sırasında bağlantı hatası oluştu. Lütfen tekrar deneyin.");
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
