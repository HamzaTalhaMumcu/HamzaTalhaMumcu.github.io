"use client";

import { useActionState } from "react";
import { generateMoreHooks } from "@/lib/actions/analysis";

const initialState: { error?: string; success?: string } = {};

export function VariantActions({
  projectId,
  source,
}: {
  projectId: string;
  source: string;
}) {
  const [state, action, pending] = useActionState(generateMoreHooks, initialState);
  return (
    <div className="mt-4 border-t border-[#e4e7e2] pt-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8b968d]">A/B test variants</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          ["more-hooks", "Generate 3 more hooks"],
          ["aggressive", "Make it aggressive"],
          ["soft", "Make it soft/storytelling"],
        ].map(([mode, label]) => (
          <button key={mode} type="submit" formAction={action} name="mode" value={mode} disabled={pending} className="rounded-lg border border-[#d8ddd7] px-3 py-1.5 text-xs font-semibold text-[#647068] hover:border-[#e45b35] hover:text-[#e45b35] disabled:opacity-50">
            {pending ? "Generating..." : label}
          </button>
        ))}
      </div>
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="source" value={source} />
      {state.error && <p role="alert" className="mt-2 text-xs text-[#b44325]">{state.error}</p>}
      {state.success && <p role="status" className="mt-2 text-xs text-[#327044]">{state.success}</p>}
    </div>
  );
}
