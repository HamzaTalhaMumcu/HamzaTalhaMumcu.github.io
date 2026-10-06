"use client";

import { useActionState } from "react";
import { updateCampaign } from "@/lib/actions/campaigns";

type CampaignStatus = "draft" | "ready" | "archived";

const initialState: { error?: string; success?: string } = {};

export function CampaignEditForm({
  campaignId,
  projectId,
  name,
  status,
}: {
  campaignId: string;
  projectId: string;
  name: string;
  status: CampaignStatus;
}) {
  const [state, action, pending] = useActionState(updateCampaign, initialState);

  return (
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="project_id" value={projectId} />
      <label className="text-sm font-medium text-[#334038]">
        Campaign name
        <input name="name" required maxLength={120} defaultValue={name} className="mt-2 w-full rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" />
      </label>
      <label className="text-sm font-medium text-[#334038]">
        Status
        <select name="status" defaultValue={status} className="mt-2 w-full rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none focus:border-[#e45b35]">
          <option value="draft">Draft</option>
          <option value="ready">Ready</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <button type="submit" disabled={pending} className="rounded-xl bg-[#17201b] px-5 py-3 font-semibold text-white hover:bg-[#2b3d32] disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Saving..." : "Save changes"}
      </button>
      {state.error && <p role="alert" className="text-sm text-[#b44325] sm:col-span-3">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-[#327044] sm:col-span-3">{state.success}</p>}
    </form>
  );
}
