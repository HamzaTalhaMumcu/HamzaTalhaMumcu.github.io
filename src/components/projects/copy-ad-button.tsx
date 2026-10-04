"use client";

import { useState } from "react";

export function CopyAdButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Could not copy ad content:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-4 rounded-lg border border-[#d8ddd7] px-3 py-1.5 text-sm font-semibold text-[#647068] hover:border-[#e45b35] hover:text-[#e45b35]"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
