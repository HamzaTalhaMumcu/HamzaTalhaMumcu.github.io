import Link from "next/link";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-6 py-12"><div className="w-full max-w-md"><Link href="/" className="text-xl font-bold tracking-tight">PITLO<span className="text-[#e45b35]">.</span></Link><div className="mt-10 rounded-3xl bg-white p-8 shadow-sm"><h1 className="text-3xl font-semibold tracking-tight">Choose a new password</h1><p className="mt-2 text-[#647068]">Set a new password for your PITLO account.</p><div className="mt-8"><UpdatePasswordForm /></div></div></div></main>;
}
