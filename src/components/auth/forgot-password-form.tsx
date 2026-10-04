"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });
    if (resetError) setError(resetError.message);
    else setMessage("Şifre yenileme bağlantısı e-posta adresinize gönderildi.");
    setLoading(false);
  }

  return <form onSubmit={submit} className="space-y-5"><label className="block text-sm font-medium text-[#334038]">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none ring-[#e45b35] focus:ring-2" /></label>{error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-4 py-3 text-sm text-[#b44325]">{error}</p>}{message && <p role="status" className="rounded-xl bg-[#edf7ee] px-4 py-3 text-sm text-[#327044]">{message}</p>}<button disabled={loading} className="w-full rounded-xl bg-[#17201b] px-4 py-3 font-semibold text-white hover:bg-[#2b3d32] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Sending..." : "Send reset link"}</button></form>;
}
