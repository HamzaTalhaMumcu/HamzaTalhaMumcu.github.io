"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return <button onClick={signOut} className="text-sm font-medium text-[#647068] hover:text-[#17201b]">Log out</button>;
}
