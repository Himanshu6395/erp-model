import { Target, UsersRound, Shield, Sparkles } from "lucide-react";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const pillars = [
  {
    icon: Target,
    title: "Purpose-built for schools",
    text: "Workflows follow real academic cycles—classes, exams, fees, and communication—not generic CRM patterns forced into education.",
  },
  {
    icon: UsersRound,
    title: "Everyone in their lane",
    text: "Super admins, school admins, teachers, and students each get navigation and permissions tuned to how they actually work.",
  },
  {
    icon: Shield,
    title: "Trust by design",
    text: "JWT sessions, RBAC, and tenant-aware data boundaries help institutions stay in control as they scale users and campuses.",
  },
  {
    icon: Sparkles,
    title: "Evolving with you",
    text: "We ship improvements across attendance, finance, homework, and platform tools while keeping upgrades predictable for IT teams.",
  },
];

function AboutPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="About NexusCRM"
        title="One platform for the people who"
        titleHighlight="run your school"
        subtitle="From the trust office to the classroom, NexusCRM School ERP connects administration and learning in a single, modern stack—without losing the nuance of each role."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="prose prose-gray max-w-none">
          <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
            NexusCRM began with a simple observation: schools juggle dozens of processes—admissions
            data, fee receipts, attendance sheets, report cards, notices—yet too often they sit in
            disconnected files and chat threads. We set out to give leadership, staff, students, and
            families one coherent place to operate, with clarity on who can see and do what.
          </p>
          <p className="mt-6 text-base leading-relaxed text-gray-700 sm:text-lg">
            Today our product supports multi-tenant operators who oversee many schools as well as
            single-campus deployments. Whether you are centralising billing and security or simply
            want teachers to mark attendance and publish homework without spreadsheet chaos, the same
            core principles apply: structured data, role-based access, and interfaces that respect
            busy school days.
          </p>
          <p className="mt-6 text-base leading-relaxed text-gray-700 sm:text-lg">
            We partner closely during rollout—demos, training windows, and pragmatic phasing—so your
            teams are never handed a “black box.” Your success is measured in fewer repetitive tasks,
            faster answers for parents, and leadership dashboards that finally match reality on the
            ground.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm ring-1 ring-gray-100/80 transition hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h2 className="mt-4 text-base font-bold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-8 sm:p-10">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">What “good” looks like</h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600 sm:text-base">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              Administrators configure classes, subjects, and fee rules once—and downstream modules
              consume the same source of truth.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              Teachers spend less time on duplicate data entry and more on instruction, with homework
              and attendance tied to real rosters.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              Students and guardians see timetables, notices, and fee status in one predictable portal
              instead of hunting across channels.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              Platform teams can audit access, subscriptions, and risk signals where super-admin tools
              are enabled—without blurring school boundaries.
            </li>
          </ul>
        </div>
      </div>

      <MarketingPageCta />
      <div className="h-8" />
    </>
  );
}

export default AboutPage;
