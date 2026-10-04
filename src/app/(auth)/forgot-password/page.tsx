import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-6 py-12"><div className="w-full max-w-md"><Link href="/" className="text-xl font-bold tracking-tight">PITLO<span className="text-[#e45b35]">.</span></Link><div className="mt-10 rounded-3xl bg-white p-8 shadow-sm"><h1 className="text-3xl font-semibold tracking-tight">Reset your password</h1><p className="mt-2 text-[#647068]">We&apos;ll send a secure reset link to your email.</p><div className="mt-8"><ForgotPasswordForm /></div><p className="mt-6 text-center text-sm text-[#647068]"><Link href="/login" className="font-semibold text-[#e45b35]">Back to login</Link></p></div></div></main>;
}
