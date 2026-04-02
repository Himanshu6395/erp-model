import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const sections = [
  {
    title: "1. Introduction",
    body: [
      "NexusCRM School ERP (“NexusCRM”, “we”, “us”) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit our website, submit enquiry or demo forms, subscribe to updates, or use the NexusCRM application as deployed for your school or organisation.",
      "By using our services, you agree to the practices described here. If you do not agree, please discontinue use of the website or application except as required by your institution’s contract.",
    ],
  },
  {
    title: "2. Information we collect",
    body: [
      "Contact and account data: names, email addresses, phone numbers, job titles, and school affiliation when you fill forms, create accounts, or correspond with us.",
      "Usage and technical data: IP address, browser type, device identifiers, pages viewed, and approximate location derived from network data—used for security, diagnostics, and improving performance.",
      "Operational school data: information entered into the ERP by authorised users (for example student records, attendance, fees, grades) is processed strictly to deliver the service and as instructed by your organisation.",
    ],
  },
  {
    title: "3. How we use information",
    body: [
      "To provide, maintain, and secure the platform; authenticate users; and enforce role-based access.",
      "To respond to enquiries, send onboarding or product communications you have opted into, and fulfil contractual obligations.",
      "To detect, prevent, and address fraud, abuse, or technical issues; to comply with law; and to protect the rights and safety of users and the public.",
    ],
  },
  {
    title: "4. Legal bases (where applicable)",
    body: [
      "Depending on jurisdiction, we may rely on contract performance, legitimate interests (such as securing our systems), consent (for marketing emails), or legal obligation as the basis for processing.",
    ],
  },
  {
    title: "5. Sharing and subprocessors",
    body: [
      "We do not sell your personal information. We may share data with vetted service providers (hosting, email delivery, analytics) who process it on our instructions under confidentiality and security obligations.",
      "We may disclose information if required by law, court order, or governmental request, or to protect NexusCRM, our users, or others.",
    ],
  },
  {
    title: "6. Retention",
    body: [
      "We retain information for as long as needed to provide the service, meet legal or audit requirements, and resolve disputes. Retention periods may be specified in your school’s data processing agreement.",
    ],
  },
  {
    title: "7. Security",
    body: [
      "We implement administrative, technical, and organisational measures—including encryption in transit where appropriate, access controls, and monitoring—designed to protect personal data. No method of transmission or storage is 100% secure; please report suspected incidents promptly.",
    ],
  },
  {
    title: "8. Your rights",
    body: [
      "Depending on where you live, you may have the right to access, correct, delete, restrict, or port certain personal data, or to object to processing. To exercise these rights, contact us using the details in the site footer. You may also lodge a complaint with a supervisory authority where applicable.",
    ],
  },
  {
    title: "9. Children’s data",
    body: [
      "The platform may process student information on behalf of schools. Schools act as controllers for much of that data; we process it as a processor according to contractual terms. Parents or guardians should direct questions about student records to the school first.",
    ],
  },
  {
    title: "10. International transfers",
    body: [
      "If data is processed in countries other than your own, we implement appropriate safeguards (such as standard contractual clauses) where required by law.",
    ],
  },
  {
    title: "11. Changes to this policy",
    body: [
      "We may update this Privacy Policy periodically. The “Last updated” date will change; material changes may be communicated by email or in-app notice where appropriate.",
    ],
  },
  {
    title: "12. Contact",
    body: [
      "For privacy questions, contact us at the email and phone listed in the website footer, or write to the postal address shown there.",
    ],
  },
];

function PrivacyPolicyPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Legal"
        title="Privacy"
        titleHighlight="policy"
        subtitle="How NexusCRM handles personal and school data. This page is a general template—have it reviewed by counsel for your jurisdiction and data flows."
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
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <MarketingPageCta headline="Privacy questions? Reach us through the demo flow or footer contacts" />
      <div className="h-8" />
    </>
  );
}

export default PrivacyPolicyPage;
