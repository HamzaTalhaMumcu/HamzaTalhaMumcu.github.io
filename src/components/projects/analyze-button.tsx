"use client";

import { useFormStatus } from "react-dom";

export function AnalyzeButton({ hasInsight }: { hasInsight: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#e45b35] px-5 py-3 font-semibold text-white hover:bg-[#f07854] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Analyzing..." : hasInsight ? "Refresh with AI" : "Analyze URL with AI"}
      {!pending && <span className="ml-1">→</span>}
    </button>
  );
}
