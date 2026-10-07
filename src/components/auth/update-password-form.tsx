"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else router.push("/dashboard");
    setLoading(false);
  }

  return <form onSubmit={submit} className="space-y-5"><label className="block text-sm font-medium text-[#334038]">New password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none ring-[#e45b35] focus:ring-2" /></label><label className="block text-sm font-medium text-[#334038]">Confirm password<input required minLength={6} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none ring-[#e45b35] focus:ring-2" /></label>{error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-4 py-3 text-sm text-[#b44325]">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-[#17201b] px-4 py-3 font-semibold text-white hover:bg-[#2b3d32] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Saving..." : "Update password"}</button></form>;
}
