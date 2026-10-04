import Link from "next/link";
import { ProjectForm } from "@/components/projects/project-form";

export default function NewProjectPage() {
  return <main className="mx-auto max-w-3xl px-6 py-12"><Link href="/dashboard" className="text-sm font-medium text-[#647068] hover:text-[#e45b35]">← Back to projects</Link><h1 className="mt-8 text-4xl font-semibold tracking-tight">Create a project</h1><p className="mt-2 text-[#647068]">Give your product a home. You can add more detail anytime.</p><div className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8"><ProjectForm /></div></main>;
}
