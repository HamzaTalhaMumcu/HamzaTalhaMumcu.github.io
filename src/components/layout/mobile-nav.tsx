"use client";

import Link from "next/link";
import { useState } from "react";
import { SignOutButton } from "./sign-out-button";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-[#d8ddd7] text-[#334038]"
      >
        <span className="h-0.5 w-5 bg-current" />
        <span className="h-0.5 w-5 bg-current" />
        <span className="h-0.5 w-5 bg-current" />
      </button>
      {open && (
        <nav id="mobile-navigation" className="absolute left-0 right-0 top-full border-t border-[#e4e7e2] bg-white px-6 py-3 shadow-lg">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="block border-b border-[#eef0ed] py-3 text-sm font-medium text-[#334038]">Projects</Link>
          <Link href="/profile" onClick={() => setOpen(false)} className="block border-b border-[#eef0ed] py-3 text-sm font-medium text-[#334038]">Profile</Link>
          <Link href="/support" onClick={() => setOpen(false)} className="block border-b border-[#eef0ed] py-3 text-sm font-medium text-[#334038]">Support</Link>
          <Link href="/feedback" onClick={() => setOpen(false)} className="block py-3 text-sm font-medium text-[#334038]">Feedback</Link>
          <div className="border-t border-[#eef0ed] pt-3"><SignOutButton /></div>
        </nav>
      )}
    </div>
  );
}
