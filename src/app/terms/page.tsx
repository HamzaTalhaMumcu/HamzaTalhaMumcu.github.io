import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply when you use PITLO.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    title: "1. About PITLO",
    content: (
      <>
        <p>PITLO is an AI-assisted advertising workspace. It helps you turn product context into audience insights, positioning, strategy, creative concepts, and draft campaign materials.</p>
        <p className="mt-4">These Terms of Use apply to your access to and use of PITLO at <strong>pitlo.me</strong>, including its free and paid features.</p>
      </>
    ),
  },
  {
    title: "2. Accounts and acceptable use",
    content: (
      <>
        <p>You must provide accurate account information, keep your login credentials secure, and be at least 18 years old or have permission from a parent or legal guardian to use the service.</p>
        <p className="mt-4">You may not use PITLO to break the law, infringe another person&apos;s rights, upload malicious code, attempt to bypass security or usage limits, interfere with the service, or submit content that you do not have the right to use.</p>
      </>
    ),
  },
  {
    title: "3. Your content and AI-generated content",
    content: (
      <>
        <p>You retain ownership of the product information, brand context, URLs, briefs, and other content you submit to PITLO. You give PITLO the limited rights needed to host, process, display, secure, and improve the service for you.</p>
        <p className="mt-4">PITLO uses third-party AI infrastructure to generate results. AI output may be inaccurate, incomplete, similar to output provided to other users, or unsuitable for your particular business. You are responsible for reviewing every result before relying on it or publishing it as an advertisement.</p>
        <p className="mt-4">PITLO does not guarantee advertising performance, conversions, compliance with an advertising platform&apos;s policies, or the accuracy of competitor information.</p>
      </>
    ),
  },
  {
    title: "4. URLs and third-party services",
    content: (
      <>
        <p>When you submit a product or competitor URL, PITLO may retrieve publicly available page content to perform an analysis. You confirm that you have a lawful basis to submit those URLs and that the requested retrieval does not violate the website&apos;s terms or applicable law.</p>
        <p className="mt-4">PITLO depends on third-party services, including Supabase, Google Gemini, Vercel, and Lemon Squeezy. Their availability and terms may affect the service. PITLO does not control third-party websites or advertising platforms and is not responsible for their content or availability.</p>
      </>
    ),
  },
  {
    title: "5. Plans, payments, and changes",
    content: (
      <>
        <p>Some features may be subject to usage limits or paid plans. Where paid checkout is available, pricing, billing frequency, renewal, cancellation, and refund terms will be shown at checkout or in the applicable payment provider flow.</p>
        <p className="mt-4">We may change, suspend, or discontinue features, including AI models and quotas, when reasonably necessary. We will not use this clause to remove rights that cannot legally be excluded.</p>
      </>
    ),
  },
  {
    title: "6. Availability, disclaimers, and liability",
    content: (
      <>
        <p>PITLO is provided on an “as available” and “as is” basis. To the extent allowed by law, we disclaim warranties that the service will be uninterrupted, error-free, secure, or fit for a particular purpose.</p>
        <p className="mt-4">To the extent allowed by law, PITLO will not be liable for indirect, incidental, special, consequential, or lost-profit damages arising from your use of the service. Nothing in these Terms limits liability that cannot legally be limited.</p>
      </>
    ),
  },
  {
    title: "7. Termination",
    content: (
      <>
        <p>You may stop using PITLO at any time. We may suspend or terminate access if you materially breach these Terms, create a security risk, or use the service unlawfully. Sections that should reasonably survive termination will continue to apply.</p>
      </>
    ),
  },
  {
    title: "8. Contact and updates",
    content: (
      <>
        <p>If you have a question about these Terms, contact PITLO through the support channel available in the application. We may update these Terms as PITLO evolves. The updated version will be posted on this page with a revised effective date.</p>
        <p className="mt-4 text-sm text-[#8b968d]">Effective date: October 7, 2026.</p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#17201b] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">PITLO<span className="text-[#e45b35]">.</span></Link>
          <Link href="/" className="text-sm font-semibold text-[#647068] hover:text-[#e45b35]">Back to home</Link>
        </div>
        <article className="mt-10 rounded-[2rem] bg-white p-7 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Terms of Use</h1>
          <p className="mt-5 leading-7 text-[#647068]">Please read these terms before using PITLO. They explain what you can expect from the service and what we expect from you.</p>
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
