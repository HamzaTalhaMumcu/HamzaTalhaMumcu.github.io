"use client";

import { useActionState } from "react";
import { createCampaignWithState } from "@/lib/actions/campaigns";

const initialState: { error?: string; success?: string } = {};

export function CampaignForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createCampaignWithState, initialState);
  return (
    <form action={action} className="mt-5 flex flex-col gap-3 sm:flex-row">
      <input type="hidden" name="project_id" value={projectId} />
      <input name="name" required placeholder="Campaign name" className="flex-1 rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" />
      <button type="submit" disabled={pending} className="rounded-xl bg-[#17201b] px-5 py-3 font-semibold text-white hover:bg-[#2b3d32] disabled:opacity-60">{pending ? "Creating..." : "Create draft campaign"}</button>
      {state.error && <p role="alert" className="text-sm text-[#b44325] sm:self-center">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-[#327044] sm:self-center">{state.success}</p>}
    </form>
  );
}
