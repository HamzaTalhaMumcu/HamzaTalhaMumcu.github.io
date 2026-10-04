"use client";

type ExportResultsProps = {
  projectName: string;
  analysis: {
    summary: string;
    audience: string;
    painPoints: string[];
    promise: string;
    positioning: string;
  };
  strategy: {
    objective: string;
    channels: string[];
    messagingPillars: string[];
    creativeDirections: string[];
  };
  variants: Array<{
    kind: string;
    content: Record<string, string>;
  }>;
};

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

export function ExportResults({
  projectName,
  analysis,
  strategy,
  variants,
}: ExportResultsProps) {
  function downloadCsv() {
    const rows = [
      ["Section", "Field", "Value"],
      ["Analysis", "Summary", analysis.summary],
      ["Analysis", "Audience", analysis.audience],
      ["Analysis", "Pain points", analysis.painPoints.join(" | ")],
      ["Analysis", "Promise", analysis.promise],
      ["Analysis", "Positioning", analysis.positioning],
      ["Strategy", "Objective", strategy.objective],
      ["Strategy", "Channels", strategy.channels.join(" | ")],
      ["Strategy", "Messaging pillars", strategy.messagingPillars.join(" | ")],
      ["Strategy", "Creative directions", strategy.creativeDirections.join(" | ")],
      ...variants.map((variant, index) => [
        variant.kind === "hook" ? "Hook" : "Ad copy",
        `Variant ${index + 1}`,
        [variant.content.title, variant.content.body, variant.content.cta].filter(Boolean).join(" — "),
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "pitlo-results"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={downloadCsv}
        className="rounded-xl border border-[#d8ddd7] bg-white px-4 py-2.5 text-sm font-semibold text-[#334038] hover:border-[#e45b35] hover:text-[#e45b35]"
      >
        Download CSV
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-xl border border-[#d8ddd7] bg-white px-4 py-2.5 text-sm font-semibold text-[#334038] hover:border-[#e45b35] hover:text-[#e45b35]"
      >
        Save as PDF
      </button>
    </div>
  );
}
