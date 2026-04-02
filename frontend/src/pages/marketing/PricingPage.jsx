import { RefreshCw, CalendarDays, Building2, Headphones } from "lucide-react";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const included = [
  "Core NexusCRM web application for your school tenant(s)",
  "Role dashboards for school admin, teacher, and student (plus super-admin where contracted)",
  "Academic, fee, attendance, homework, exam, notice, and library flows as enabled in your build",
  "JWT sign-in, RBAC menus, and product updates on a managed cadence",
  "Standard email support and onboarding guidance aligned to your rollout plan",
];

function PricingPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Subscriptions"
        title="Pricing that respects how schools"
        titleHighlight="actually budget"
        subtitle="We keep public pages free of fixed rupee tables—every campus has different student counts, add-ons, and governance needs. Instead, here is exactly what we discuss when you request a quote or demo."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <RefreshCw className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="mt-6 text-xl font-bold text-gray-900">Monthly billing</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Ideal for pilots, single-campus trials, or trusts that prefer operational expenses to
              stay variable at the start. Invoicing cadence is monthly; contractual minimums and user
              bands are agreed up front so finance teams can forecast.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>• Shorter commitment while you validate adoption</li>
              <li>• Easier to align with grant or project-based funding cycles</li>
              <li>• Upgrade paths to annual terms once confidence is high</li>
            </ul>
          </article>

          <article className="rounded-2xl border-2 border-demo-300 bg-gradient-to-b from-demo-50/40 to-white p-8 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-demo-500 text-white">
              <CalendarDays className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-4 inline-block rounded-full bg-demo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-demo-800">
              Most schools choose
            </p>
            <h2 className="mt-3 text-xl font-bold text-gray-900">Annual billing</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Matches academic-year planning and reduces purchase-order churn. Annual agreements
              typically bundle implementation checkpoints, training windows, and clearer SLAs for
              production support.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>• One renewal conversation per year with leadership</li>
              <li>• Often includes modest loyalty benefits versus month-to-month</li>
              <li>• Better alignment with board approvals and audit calendars</li>
            </ul>
          </article>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900">What quotes typically cover</h2>
          <p className="mt-3 max-w-3xl text-sm text-gray-600">
            Your proposal may combine some or all of the following—scoped to your organisation chart
            and compliance posture.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {included.map((line) => (
              <li
                key={line}
                className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700"
              >
                <span className="text-emerald-600">✓</span>
                {line}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <Building2 className="h-8 w-8 shrink-0 text-brand-600" aria-hidden />
            <div>
              <h3 className="font-bold text-gray-900">Multi-campus & trusts</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Central reporting, consolidated billing, and template configurations across branches
                are priced by active school count, peak users, and whether super-administration is
                retained in-house or by NexusCRM operators.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <Headphones className="h-8 w-8 shrink-0 text-brand-600" aria-hidden />
            <div>
              <h3 className="font-bold text-gray-900">Services add-ons</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Dedicated training days, data migration from legacy ERP or spreadsheets, custom
                integrations (SMS, payment gateways), and extended support hours are quoted
                separately so you only buy what your IT capacity requires.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-gray-900 p-8 text-white sm:p-10">
          <h2 className="text-xl font-bold">Procurement checklist</h2>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-slate-300">
            <li>Approximate active students and staff who will log in monthly</li>
            <li>Whether you need super-admin tools for more than one school</li>
            <li>Target go-live date relative to your academic calendar</li>
            <li>Any mandatory integrations (fee gateways, identity providers, SMS)</li>
            <li>Data residency or contractual clauses your legal team requires</li>
          </ol>
        </div>
      </div>

      <MarketingPageCta headline="Request a tailored quote—no obligation" />
      <div className="h-8" />
    </>
  );
}

export default PricingPage;
