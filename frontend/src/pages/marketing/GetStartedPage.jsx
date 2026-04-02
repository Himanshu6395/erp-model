import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, LogIn, Mail } from "lucide-react";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const paths = [
  {
    title: "I already have credentials",
    icon: LogIn,
    body: "Your school or platform team has provisioned an account. Use the login button to reach the correct dashboard after authentication.",
    action: { label: "Login to NexusCRM", to: "/login" },
  },
  {
    title: "I need access for my school",
    icon: Mail,
    body: "No account yet? Request a demo or pilot. We confirm scope, create tenants, and assign your first admin users with the right roles.",
    action: { label: "Request demo access", to: "/#request-demo" },
  },
  {
    title: "I am evaluating for multiple schools",
    icon: BookOpen,
    body: "Read the Modules and Features pages, then book a conversation focused on super-administration, subscriptions, and security dashboards.",
    action: { label: "Explore modules", to: "/modules" },
  },
];

function GetStartedPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Onboarding"
        title="Get started in the way that"
        titleHighlight="matches your situation"
        subtitle="NexusCRM is live behind authentication. Pick the path below—whether you are logging in for the first time or still convincing your board."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {paths.map(({ title, icon: Icon, body, action }) => (
            <article
              key={title}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-bold text-gray-900">{title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{body}</p>
              <Link
                to={action.to}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-800"
              >
                {action.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-16 rounded-2xl border border-gray-200 bg-slate-50 p-8 sm:p-10">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Checklist before your first login
          </h2>
          <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-gray-600 sm:text-base">
            <li>
              Confirm which <strong className="text-gray-800">role</strong> your account should
              carry (super admin, school admin, teacher, student)—mis-assigned roles are the #1
              support ticket after go-live.
            </li>
            <li>
              Use a <strong className="text-gray-800">supported browser</strong> (current Chrome,
              Edge, Safari, or Firefox) with JavaScript enabled.
            </li>
            <li>
              Complete any <strong className="text-gray-800">password policy</strong> steps your IT
              team emailed alongside your invite.
            </li>
            <li>
              Bookmark both the <Link to="/login" className="font-semibold text-brand-600 underline">login URL</Link>{" "}
              and your school’s help contact in case MFA or IP allowlists apply in your deployment.
            </li>
          </ol>
        </section>

        <section className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Want the full marketing tour first?{" "}
            <Link to="/" className="font-semibold text-brand-600 hover:text-brand-800">
              Return to the home page
            </Link>{" "}
            for interactive sections, or read{" "}
            <Link to="/features" className="font-semibold text-brand-600 hover:text-brand-800">
              Features
            </Link>{" "}
            and{" "}
            <Link to="/pricing" className="font-semibold text-brand-600 hover:text-brand-800">
              Pricing
            </Link>
            .
          </p>
        </section>
      </div>

      <MarketingPageCta headline="Still stuck? Email or call us via the footer" />
      <div className="h-8" />
    </>
  );
}

export default GetStartedPage;
