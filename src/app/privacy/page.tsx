import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PITLO collects and uses information.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "1. Information we collect",
    content: (
      <>
        <p><strong>Account information.</strong> When you sign up, Supabase Auth processes your email address, password authentication data, session information, and account identifiers.</p>
        <p className="mt-4"><strong>Workspace content.</strong> We collect the project names, product descriptions, product URLs, competitor URLs, advertising requests, brand context, generated strategies, creative variants, draft campaigns, and feedback that you choose to store in PITLO.</p>
        <p className="mt-4"><strong>Usage and technical information.</strong> We process authentication events, AI usage/quota records, basic request information, and error or security logs needed to operate and protect the service. Vercel Analytics is enabled to measure website visits and page views.</p>
        <p className="mt-4"><strong>Payment information.</strong> If you purchase a paid plan or make a contribution, Lemon Squeezy processes payment and billing details. PITLO does not receive or store your full payment card number.</p>
      </>
    ),
  },
  {
    title: "2. How we use information",
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Provide authentication, projects, saved brand context, campaigns, feedback, and other requested features.</li>
        <li>Retrieve publicly available content from submitted product and competitor URLs and generate advertising analysis.</li>
        <li>Send relevant project context to Google Gemini so PITLO can produce AI analysis, strategy, hooks, copy, visual briefs, and related variants.</li>
        <li>Count AI generations, apply plan quotas, process billing events, prevent abuse, troubleshoot errors, and secure the service.</li>
        <li>Measure site usage through Vercel Analytics and improve the product.</li>
      </ul>
    ),
  },
  {
    title: "3. AI processing",
    content: (
      <>
        <p>When you request an analysis, PITLO may send the product page text, competitor page text, product description, advertising brief, and brand context to Google Gemini through our server-side integration. API keys are kept on the server and are not exposed to users.</p>
        <p className="mt-4">Do not submit passwords, payment card data, government identifiers, health information, or other sensitive personal data to project fields. AI output should be reviewed by a human and does not constitute legal, financial, or advertising-policy advice.</p>
      </>
    ),
  },
  {
    title: "4. Service providers",
    content: (
      <>
        <p>PITLO uses service providers to operate the product. Supabase provides authentication and database infrastructure; Google provides Gemini AI processing; Vercel provides hosting and analytics; and Lemon Squeezy provides checkout and subscription or contribution billing when enabled.</p>
        <p className="mt-4">These providers may process information in countries other than where you live and under their own privacy policies. We do not sell your personal information.</p>
      </>
    ),
  },
  {
    title: "5. Retention and security",
    content: (
      <>
        <p>We retain account and workspace information while it is needed to provide PITLO, maintain your projects, meet legal obligations, resolve disputes, and enforce our agreements. Deleting a project removes it through the available product flow; backups and security logs may persist for a limited period.</p>
        <p className="mt-4">PITLO uses authentication controls, ownership checks, row-level security, server-side API keys, and HTTPS URL validation. No internet service can guarantee absolute security.</p>
      </>
    ),
  },
  {
    title: "6. Your choices and rights",
    content: (
      <>
        <p>You can update your profile and project information in the application and request help with access, correction, deletion, or privacy questions through the in-app support channel. Depending on your location, you may have additional rights under applicable data-protection law, including access, portability, restriction, objection, or complaint rights.</p>
        <p className="mt-4">PITLO uses essential session cookies needed for authentication. Vercel Analytics may use its own measurement technology to provide analytics. You can also control cookies through your browser settings.</p>
      </>
    ),
  },
  {
    title: "7. Children and policy updates",
    content: (
      <>
        <p>PITLO is not directed to children under 13, and we do not knowingly collect their personal information. We may update this Policy as the product or legal requirements change. The latest version will be posted here with a revised effective date.</p>
        <p className="mt-4 text-sm text-[#8b968d]">Effective date: October 7, 2026.</p>
      </>
    ),
  },
  {
    title: "8. Contact",
    content: (
      <p>For privacy questions or requests, contact PITLO through the support channel available in the application.</p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#17201b] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">PITLO<span className="text-[#e45b35]">.</span></Link>
          <Link href="/" className="text-sm font-semibold text-[#647068] hover:text-[#e45b35]">Back to home</Link>
        </div>
        <article className="mt-10 rounded-[2rem] bg-white p-7 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-5 leading-7 text-[#647068]">This Policy explains what information PITLO handles, why we handle it, and the choices available to you.</p>
          <div className="mt-10 space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <div className="mt-3 leading-7 text-[#647068]">{section.content}</div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
