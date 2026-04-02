import {
  Rocket,
  GraduationCap,
  Headphones,
  Wrench,
  LineChart,
  Building2,
} from "lucide-react";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const services = [
  {
    icon: Rocket,
    title: "Discovery & rollout planning",
    body: "We map your roles, campuses, and priorities—then propose a phased go-live so admins, teachers, and students are not overwhelmed on day one.",
  },
  {
    icon: GraduationCap,
    title: "Training & enablement",
    body: "Hands-on sessions for school admins and faculty on attendance, fees, homework, exams, notices, and reporting—aligned to how your timetable actually runs.",
  },
  {
    icon: Wrench,
    title: "Configuration support",
    body: "Help structuring classes and sections, subject lists, fee heads, and user provisioning so your data model stays clean as you grow.",
  },
  {
    icon: Building2,
    title: "Multi-tenant & platform ops",
    body: "For operators managing many schools: guidance on plans, subscriptions, payments, and security dashboards so governance keeps pace with expansion.",
  },
  {
    icon: LineChart,
    title: "Adoption reviews",
    body: "Check-ins after launch to spot bottlenecks—who is stuck on which workflow—and adjust training or configuration before small issues become habits.",
  },
  {
    icon: Headphones,
    title: "Ongoing support",
    body: "Responsive channels for production questions, coordinated with your contract or pilot terms so nothing falls through the cracks during term time.",
  },
];

function ServicesPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="What we deliver"
        title="Services that turn software into"
        titleHighlight="school outcomes"
        subtitle="NexusCRM is more than a login screen. Our services wrap the product with planning, training, and follow-through so your teams actually use—and trust—the system."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="max-w-3xl text-base leading-relaxed text-gray-700 sm:text-lg">
          Every institution is different: some need a tight eight-week pilot on one campus; others
          need trust-wide templates and central reporting. Below is how we typically engage—mix and
          match based on what your leadership team wants to prove first.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-demo-100 to-brand-50 text-brand-700 transition group-hover:from-brand-100 group-hover:to-demo-50">
                <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-bold text-gray-900">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-8 border-t border-gray-200 pt-14 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Who we work with</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Independent K–12 schools, college groups, trusts with multiple branches, and EdTech
              operators who white-label or bundle ERP capability for their networks. If your org chart
              includes a “super admin” layer above individual schools, our routes and menus already
              speak that language.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">What we need from you</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              A project sponsor (often the principal or COO), a day-to-day admin champion, and honest
              samples of how you run fees, attendance, and exams today—even if they are messy.
              With that, we can calibrate timelines, avoid fake “big bang” go-lives, and keep
              teachers on your side.
            </p>
          </div>
        </div>
      </div>

      <MarketingPageCta headline="Talk through the right service mix for your school" />
      <div className="h-8" />
    </>
  );
}

export default ServicesPage;
