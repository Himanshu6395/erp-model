import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const sections = [
  {
    title: "1. Agreement to terms",
    paragraphs: [
      "These Terms and Conditions (“Terms”) govern your access to the NexusCRM School ERP website, demo environments, and production application (collectively, the “Service”) provided by NexusCRM and its affiliates.",
      "If you access the Service on behalf of a school, trust, or company, you represent that you have authority to bind that entity. If you do not agree, do not use the Service.",
    ],
  },
  {
    title: "2. The Service",
    paragraphs: [
      "NexusCRM provides cloud-based school management software, including role-specific dashboards, academic and administrative modules, and optional super-administration tools for multi-school operators.",
      "Features may change over time. We may add, modify, or retire functionality with reasonable notice where practicable and as permitted by your separate order form or contract.",
    ],
  },
  {
    title: "3. Accounts and eligibility",
    paragraphs: [
      "You must provide accurate registration information and keep credentials confidential. You are responsible for activity under your account.",
      "Accounts may be created or disabled by your organisation’s administrators. We may suspend access for security reasons or breach of these Terms.",
    ],
  },
  {
    title: "4. Acceptable use",
    paragraphs: [
      "You may not misuse the Service—including probing, scanning, or testing vulnerabilities without authorisation; interfering with other tenants; uploading malware; scraping in violation of our policies; or using the Service for unlawful, harassing, or discriminatory purposes.",
      "You may not attempt to access data or accounts you are not authorised to view.",
    ],
  },
  {
    title: "5. Intellectual property",
    paragraphs: [
      "NexusCRM and its licensors retain all rights in the Service, branding, documentation, and underlying software. Except for rights expressly granted in writing, no licence is implied.",
      "Your organisation retains rights to data it submits. You grant us a limited licence to host, process, and display that data solely to operate and improve the Service as described in our Privacy Policy and your agreement.",
    ],
  },
  {
    title: "6. Third-party services",
    paragraphs: [
      "The Service may integrate with third-party tools (payment gateways, SMS gateways, identity providers). Those services are governed by their own terms; we are not responsible for their availability or practices.",
    ],
  },
  {
    title: "7. Confidentiality and data",
    paragraphs: [
      "Each party may receive confidential information from the other. Recipient will use reasonable care to protect it and use it only for the purpose of the relationship.",
      "Processing of personal data is described in our Privacy Policy and, where applicable, a data processing addendum with your institution.",
    ],
  },
  {
    title: "8. Disclaimers",
    paragraphs: [
      "To the fullest extent permitted by law, the Service is provided “as is” and “as available” without warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant uninterrupted or error-free operation.",
    ],
  },
  {
    title: "9. Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by applicable law, neither party will be liable for indirect, incidental, special, consequential, or punitive damages, or loss of profits, data, or goodwill, except for breaches of confidentiality, indemnity obligations, or liability that cannot be limited by law.",
      "Our aggregate liability arising from these Terms or the Service is limited to the greater of amounts paid by you for the Service in the twelve months before the claim or the amount specified in your governing contract.",
    ],
  },
  {
    title: "10. Indemnity",
    paragraphs: [
      "You will defend and indemnify NexusCRM against third-party claims arising from your misuse of the Service, your content, or violation of law, subject to our prompt notice and reasonable cooperation.",
    ],
  },
  {
    title: "11. Term and termination",
    paragraphs: [
      "These Terms remain in effect while you use the Service. Your organisation’s subscription or pilot agreement may set additional start/end dates and data export obligations.",
      "We may suspend or terminate access for material breach after notice where reasonable. Provisions that by nature should survive will survive termination.",
    ],
  },
  {
    title: "12. Governing law and disputes",
    paragraphs: [
      "Unless your order form specifies otherwise, these Terms are governed by the laws of India, without regard to conflict-of-law principles. Courts at New Delhi, India, shall have exclusive jurisdiction, subject to any mandatory consumer protections in your country.",
    ],
  },
  {
    title: "13. Changes",
    paragraphs: [
      "We may update these Terms from time to time. Continued use after the effective date constitutes acceptance of the revised Terms, except where stricter consent is required by law.",
    ],
  },
  {
    title: "14. Contact",
    paragraphs: [
      "Questions about these Terms: use the contact information in the website footer.",
    ],
  },
];

function TermsPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Legal"
        title="Terms &"
        titleHighlight="conditions"
        subtitle="Rules for using NexusCRM’s website and software. Your formal contract or order form may override or supplement these terms where they conflict."
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-sm text-gray-500">Last updated: March {new Date().getFullYear()}</p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-lg font-bold text-gray-900">{s.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600 sm:text-[0.9375rem]">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <MarketingPageCta headline="Commercial or legal questions?" />
      <div className="h-8" />
    </>
  );
}

export default TermsPage;
