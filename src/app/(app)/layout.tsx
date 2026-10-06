import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-[#f7f7f5]"><header className="relative z-50 border-b border-[#e4e7e2] bg-white/80"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><Link href="/dashboard" className="text-xl font-bold tracking-tight">PITLO<span className="text-[#e45b35]">.</span></Link><nav className="hidden items-center gap-5 md:flex"><Link href="/dashboard" className="text-sm font-medium text-[#334038] hover:text-[#e45b35]">Projects</Link><Link href="/profile" className="text-sm font-medium text-[#334038] hover:text-[#e45b35]">Profile</Link><Link href="/support" className="text-sm font-medium text-[#334038] hover:text-[#e45b35]">Support</Link><Link href="/feedback" className="text-sm font-medium text-[#334038] hover:text-[#e45b35]">Feedback</Link><SignOutButton /></nav><MobileNav /></div></header>{children}</div>;
}
