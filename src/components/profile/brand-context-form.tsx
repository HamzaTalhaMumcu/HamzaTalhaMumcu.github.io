"use client";

import { useActionState } from "react";
import { saveBrandProfileWithState } from "@/lib/actions/brand";

type BrandValues = {
  brand_name?: string | null;
  brand_description?: string | null;
  brand_voice?: string | null;
  brand_values?: string | null;
  preferred_words?: string | null;
  avoid_words?: string | null;
};

const initialState: { error?: string; success?: string } = {};

export function BrandContextForm({ brand }: { brand: BrandValues | null }) {
  const [state, action, pending] = useActionState(saveBrandProfileWithState, initialState);
  return (
    <form action={action} className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-[#334038]">Brand name<input name="brand_name" defaultValue={brand?.brand_name ?? ""} className="mt-2 w-full rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
      <label className="text-sm font-medium text-[#334038]">Brand voice<input name="brand_voice" defaultValue={brand?.brand_voice ?? ""} placeholder="e.g. clear, warm, confident" className="mt-2 w-full rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
      <label className="text-sm font-medium text-[#334038] sm:col-span-2">Brand description<textarea name="brand_description" rows={3} defaultValue={brand?.brand_description ?? ""} className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
      <label className="text-sm font-medium text-[#334038]">Brand values<textarea name="brand_values" rows={3} defaultValue={brand?.brand_values ?? ""} placeholder="One value per line" className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
      <label className="text-sm font-medium text-[#334038]">Preferred words<textarea name="preferred_words" rows={3} defaultValue={brand?.preferred_words ?? ""} placeholder="Words and phrases to prefer" className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
      <label className="text-sm font-medium text-[#334038] sm:col-span-2">Words or claims to avoid<textarea name="avoid_words" rows={3} defaultValue={brand?.avoid_words ?? ""} placeholder="Words, claims, or tones to avoid" className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="w-fit rounded-xl bg-[#17201b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2b3d32] disabled:opacity-60">{pending ? "Saving..." : "Save brand context"}</button>
        {state.error && <p role="alert" className="mt-3 text-sm text-[#b44325]">{state.error}</p>}
        {state.success && <p role="status" className="mt-3 text-sm text-[#327044]">{state.success}</p>}
      </div>
    </form>
  );
}
