"use client";

import { FormEvent } from "react";
import { createProject, updateProject } from "@/lib/actions/projects";
import type { Project } from "@/lib/supabase/types";
import { SubmitButton } from "@/components/ui/submit-button";

const urlMessage = "Enter a valid URL, for example https://example.com.";
const competitorMessage = "Enter valid competitor URLs, one per line, for example https://competitor.com.";

function isValidUrl(value: string) {
  try {
    const normalized = /^[a-z][a-z\d+\-.]*:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(normalized);
    return url.protocol === "https:" && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

export function ProjectForm({ project }: { project?: Project }) {
  const action = project ? updateProject : createProject;

  function validateCompetitors(event: FormEvent<HTMLFormElement>) {
    const field = event.currentTarget.elements.namedItem("competitors");
    if (!(field instanceof HTMLTextAreaElement)) return;
    const values = field.value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
    const invalid = values.some((value) => !isValidUrl(value));
    field.setCustomValidity(invalid ? competitorMessage : "");
    if (invalid) {
      event.preventDefault();
      field.reportValidity();
    }
  }

  return (
    <form action={action} onSubmit={validateCompetitors} className="space-y-5">
      {project && <input type="hidden" name="project_id" value={project.id} />}
      <label className="block text-sm font-medium text-[#334038]">
        Project name
        <input name="name" required defaultValue={project?.name} placeholder="e.g. Acme Coffee" className="mt-2 w-full rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none focus:border-[#e45b35]" />
      </label>
      <label className="block text-sm font-medium text-[#334038]">
        Product URL
        <input
          name="product_url"
          required
          type="url"
          defaultValue={project?.product_url ?? ""}
          placeholder="https://yourproduct.com"
          title={urlMessage}
          onInvalid={(event) => event.currentTarget.setCustomValidity(urlMessage)}
          onInput={(event) => event.currentTarget.setCustomValidity("")}
          className="mt-2 w-full rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none focus:border-[#e45b35]"
        />
      </label>
      <label className="block text-sm font-medium text-[#334038]">
        What should the ad achieve? <span className="font-normal text-[#8b968d]">(optional)</span>
        <textarea name="ad_request" rows={3} defaultValue={project?.ad_request ?? ""} placeholder="e.g. Launch a campaign for growing teams..." className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none focus:border-[#e45b35]" />
      </label>
      <label className="block text-sm font-medium text-[#334038]">
        Product description <span className="font-normal text-[#8b968d]">(optional)</span>
        <textarea name="product_description" rows={4} defaultValue={project?.product_description ?? ""} placeholder="Add context that the URL may not explain..." className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none focus:border-[#e45b35]" />
      </label>
      <label className="block text-sm font-medium text-[#334038]">
        Competitor URLs <span className="font-normal text-[#8b968d]">(optional, up to 5)</span>
        <textarea name="competitors" rows={3} defaultValue={project?.competitors?.join("\n") ?? ""} placeholder="One URL per line, e.g. https://competitor.com" onInput={(event) => event.currentTarget.setCustomValidity("")} className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none focus:border-[#e45b35]" />
      </label>
      <SubmitButton idleLabel={project ? "Save changes" : "Create project"} pendingLabel={project ? "Saving..." : "Creating..."} className="rounded-xl bg-[#e45b35] px-5 py-3 font-semibold text-white hover:bg-[#c94b29]" />
    </form>
  );
}
