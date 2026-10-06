import type { Metadata } from "next";
import Link from "next/link";
import { createDonationCheckout } from "@/lib/actions/donations";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Support PITLO",
  description: "Support PITLO's independent development with a one-time contribution.",
  alternates: {
    canonical: "/support",
  },
};

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#17201b] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-xl font-bold tracking-tight">
          PITLO<span className="text-[#e45b35]">.</span>
        </Link>
        <div className="mt-6">
          <Link href={user ? "/dashboard" : "/login"} className="inline-flex rounded-xl border border-[#d8ddd7] px-4 py-2 text-sm font-semibold text-[#334038] hover:border-[#e45b35] hover:text-[#e45b35]">
            {user ? "Back to dashboard" : "Log in to continue"}
          </Link>
        </div>
        <section className="mt-12 rounded-[2rem] bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">Support PITLO</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Help keep clearer advertising tools growing.</h1>
          <p className="mt-5 leading-7 text-[#647068]">
            PITLO is being built to help founders and teams turn product context into better advertising.
            If it is useful to you, you can support its independent development with a one-time contribution.
          </p>
          <form action={createDonationCheckout} className="mt-8">
            <label htmlFor="amount" className="text-sm font-semibold text-[#334038]">Choose a contribution</label>
            <div className="mt-3 flex items-center rounded-xl border border-[#d8ddd7] bg-white focus-within:border-[#e45b35]">
              <span className="pl-4 text-lg font-semibold text-[#8b968d]">$</span>
              <input id="amount" name="amount" type="number" min="1" step="0.01" defaultValue="10" required inputMode="decimal" className="w-full bg-transparent px-3 py-3 text-lg font-semibold outline-none" aria-describedby="amount-help" />
            </div>
            <p id="amount-help" className="mt-2 text-sm text-[#8b968d]">Enter any amount of at least $1.00.</p>
            <button type="submit" className="mt-6 w-full rounded-xl bg-[#17201b] px-4 py-3.5 font-semibold text-white hover:bg-[#2b3d32]">
              Continue to secure checkout
            </button>
          </form>
          <p className="mt-4 text-center text-xs leading-5 text-[#8b968d]">
            Payments are securely processed by Lemon Squeezy. This is a voluntary one-time contribution.
          </p>
        </section>
      </div>
    </main>
  );
}
