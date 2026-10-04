"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-6 py-12">
      <section className="w-full rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#17201b]">
          We could not complete that request.
        </h1>
        <p className="mx-auto mt-3 max-w-md leading-6 text-[#647068]">
          Your data is safe. Please try again, or return to your projects and continue from there.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-[#e45b35] px-5 py-3 font-semibold text-white hover:bg-[#c94b29]"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-xl border border-[#d8ddd7] px-5 py-3 font-semibold text-[#334038] hover:border-[#e45b35] hover:text-[#e45b35]"
          >
            Back to projects
          </Link>
        </div>
      </section>
    </main>
  );
}
