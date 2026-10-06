"use client";

import { useState } from "react";

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFailed(true);
      window.setTimeout(() => setFailed(false), 2200);
    }
  }
  return <button type="button" onClick={copy} className="rounded-lg border border-[#d8ddd7] px-2.5 py-1 text-xs font-semibold text-[#647068] hover:border-[#e45b35] hover:text-[#e45b35]">{failed ? "Copy failed" : copied ? "Copied" : label}</button>;
}

export function CopyPasteCard({
  title,
  body,
  cta,
  angle,
}: {
  title: string;
  body: string;
  cta?: string;
  angle?: string;
}) {
  const all = [title, body, cta].filter(Boolean).join("\n\n");
  return (
    <article className="rounded-2xl border border-[#e4e7e2] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8b968d]">Copy-paste creative</p>
        <CopyButton label="Copy all" value={all} />
      </div>
      {angle && <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#e45b35]">{angle}</p>}
      {[
        ["Hook", title],
        ["Primary text", body],
        ["Headline / CTA", cta],
      ].filter(([, value]) => value).map(([label, value]) => (
        <div key={label} className="mt-4 rounded-xl bg-[#f1f1ec] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8b968d]">{label}</p>
            <CopyButton label="Copy" value={value as string} />
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#334038]">{value}</p>
        </div>
      ))}
    </article>
  );
}
