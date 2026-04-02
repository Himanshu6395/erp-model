import {
  Shield,
  UsersRound,
  GraduationCap,
  UserSquare2,
  Building2,
  Smartphone,
  Zap,
  Database,
  Lock,
} from "lucide-react";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const roles = [
  {
    icon: Building2,
    title: "Super administrator",
    body: "Create and oversee schools, manage subscription plans, log payments, and open security dashboards including login activity and blocked-tenant controls when enabled. Built for trusts, EdTech operators, or central teams running many campuses.",
  },
  {
    icon: UsersRound,
    title: "School administrator",
    body: "Owns master data: students, teachers, classes, subjects, fees, attendance policies, notices, and most compliance reporting. Sees placeholders for future modules (transport, hostel) as your roadmap expands.",
  },
  {
    icon: GraduationCap,
    title: "Teacher",
    body: "Marks attendance (including bulk where configured), publishes homework, records marks, maintains diary entries, schedules online sessions, uploads study material, and communicates with classes through announcements.",
  },
  {
    icon: UserSquare2,
    title: "Student",
    body: "Checks timetables, fees, results, homework, library activity, notices, admit cards, and personal alerts—without seeing staff-only financial or roster administration screens.",
  },
];

const technical = [
  {
    icon: Lock,
    title: "JWT authentication",
    text: "Session tokens issued after email/password login; APIs expect authenticated calls, reducing anonymous data exposure.",
  },
  {
    icon: Shield,
    title: "RBAC navigation",
    text: "Menus and routes are filtered by role so a student account never lands on fee-structure editors by mistake.",
  },
  {
    icon: Database,
    title: "Tenant-aware data",
    text: "School-level operations stay scoped to the correct institution while super-admin tooling can aggregate where contracts allow.",
  },
  {
    icon: Zap,
    title: "Fast, modern UI",
    text: "React-powered interface with responsive layouts so staff can work from desks or tablets during busy school days.",
  },
  {
    icon: Smartphone,
    title: "Mobile-friendly web",
    text: "No forced desktop-only flows for core student and teacher tasks; companion native apps can align with your rollout plan.",
  },
];

function FeaturesPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Platform features"
        title="Built for four audiences, one"
        titleHighlight="secure product"
        subtitle="NexusCRM combines broad school ERP coverage (65+ routed screens across roles) with authentication and access patterns suited to regulated, youth-serving environments."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Role experiences</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
            After login, each user is routed to the correct home path. The sidebar mirrors the
            responsibilities of that role in the product today—not a generic app with every tile
            visible to everyone.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {roles.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Capability surface area</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
            The application navigation currently exposes dozens of distinct screens spanning
            academics, finance, communication, HR-style tooling for teachers, and platform
            administration. Exact counts shift slightly as we ship improvements, but the design
            goal is simple: <strong className="text-gray-800">fewer shadow systems</strong> for your
            registrar, accountant, faculty head, and IT lead.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { k: "Academic ops", v: "Attendance, homework, exams, results, timetables, library, diary" },
              { k: "Admin & records", v: "Students, teachers, classes, subjects, notices, files, reports" },
              { k: "Money & plans", v: "Fees, receipts, salary views, super-admin plans & payments" },
            ].map((row) => (
              <div key={row.k} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{row.k}</p>
                <p className="mt-2 text-sm text-gray-600">{row.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Security & architecture highlights</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {technical.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5">
                <Icon className="h-6 w-6 shrink-0 text-demo-600" strokeWidth={1.5} aria-hidden />
                <div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 p-8 sm:p-10">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">When NexusCRM is the right fit</h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
            <li className="flex gap-3">
              <span className="text-brand-600">✓</span>
              You want one authenticated product instead of five overlapping apps for fees,
              attendance, and notices.
            </li>
            <li className="flex gap-3">
              <span className="text-brand-600">✓</span>
              You operate more than one school—or plan to—and need super-administration without
              blending tenant data.
            </li>
            <li className="flex gap-3">
              <span className="text-brand-600">✓</span>
              Your compliance conversations include audit trails, access reviews, and predictable
              change management for staff turnover.
            </li>
          </ul>
        </section>
      </div>

      <MarketingPageCta headline="Compare these features against your current stack in a live session" />
      <div className="h-8" />
    </>
  );
}

export default FeaturesPage;
