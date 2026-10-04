import Link from "next/link";
import { SignOutButton } from "@/components/layout/sign-out-button";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-[#f7f7f5]"><header className="border-b border-[#e4e7e2] bg-white/80"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><Link href="/dashboard" className="text-xl font-bold tracking-tight">PITLO<span className="text-[#e45b35]">.</span></Link><nav className="flex items-center gap-5"><Link href="/dashboard" className="text-sm font-medium text-[#334038] hover:text-[#e45b35]">Projects</Link><Link href="/feedback" className="text-sm font-medium text-[#334038] hover:text-[#e45b35]">Feedback</Link><SignOutButton /></nav></div></header>{children}</div>;
}
