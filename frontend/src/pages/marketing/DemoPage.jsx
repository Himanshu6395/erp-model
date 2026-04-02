import { Link } from "react-router-dom";
import { ClipboardList, KeyRound, Monitor, Users, Clock } from "lucide-react";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const steps = [
  {
    icon: ClipboardList,
    title: "Tell us who you are",
    text: "Use the demo request form with your role (super admin, school admin, teacher, student, or exploring). That determines which workspace we provision first.",
  },
  {
    icon: Users,
    title: "We qualify scope",
    text: "A short call or email exchange confirms campus count, approximate users, and whether you need platform-level tools or a single-school pilot.",
  },
  {
    icon: KeyRound,
    title: "Credentials & orientation",
    text: "You receive login instructions for sandbox or pilot tenants, plus links to module summaries matching your evaluation checklist.",
  },
  {
    icon: Monitor,
    title: "Guided or self exploration",
    text: "Some teams want a live screen-share walkthrough; others prefer two weeks of self-guided clicks—we adapt to your calendar.",
  },
  {
    icon: Clock,
    title: "Decision support",
    text: "We summarise open questions (data migration, integrations, training) so procurement and academic leads can compare NexusCRM to status quo honestly.",
  },
];

function DemoPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Try NexusCRM"
        title="A demo that reflects your"
        titleHighlight="real roles"
        subtitle="We do not hand everyone the same generic tour. Demos are structured around how NexusCRM actually behaves for super administrators, school operations teams, teachers, and students—with JWT sign-in and RBAC in place from day one."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
            Whether you are a principal evaluating discipline workflows, a CFO focused on fee
            reconciliation, or a platform owner onboarding ten schools, the demo path highlights the
            modules that matter to <em>your</em> questions—not a scripted marketing reel.
          </p>
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">What happens after you enquire</h2>
          <div className="mt-10 space-y-6">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:gap-6 sm:p-8"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-brand-600" aria-hidden />
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900">You may ask to see…</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>• Attendance marking—including bulk flows for teachers</li>
              <li>• Fee structure setup and student balance views</li>
              <li>• Homework publish → student submit lifecycle</li>
              <li>• Super-admin schools list, plans, and security dashboards</li>
              <li>• Notice creation and student notice board consumption</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900">Security notes we cover upfront</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>• How JWT sessions are issued and refreshed in your deployment</li>
              <li>• Which actions are restricted by role out of the box</li>
              <li>• How tenant data stays separated for multi-school operators</li>
              <li>• What logging or blocked-school tooling exists for operators</li>
            </ul>
          </div>
        </section>

        <div className="mt-14 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/30 p-8 text-center sm:p-10">
          <p className="text-lg font-semibold text-gray-900">Ready to submit the form?</p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
            The same fields you see on the home page—role, name, email, mobile—kick off this process.
            You can jump there now or return after sharing this page internally.
          </p>
          <Link
            to="/#request-demo"
            className="mt-6 inline-flex rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-brand-700"
          >
            Open demo form on home
          </Link>
        </div>
      </div>

      <MarketingPageCta headline="Prefer we call you first? Leave notes in the demo form" />
      <div className="h-8" />
    </>
  );
}

export default DemoPage;
