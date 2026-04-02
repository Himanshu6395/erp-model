import { Heart, Lightbulb, Users } from "lucide-react";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const values = [
  {
    icon: Heart,
    title: "Impact on real schools",
    text: "We care about attendance actually being marked, fees reconciling, and teachers not fighting the UI during exam week.",
  },
  {
    icon: Lightbulb,
    title: "Pragmatic innovation",
    text: "We ship useful increments—RBAC, better notices, cleaner fees—before chasing trends that do not help a principal sleep at night.",
  },
  {
    icon: Users,
    title: "Collaboration",
    text: "Product, engineering, and customer-facing roles work as one team; ego is replaced by ownership for the institution on the other end.",
  },
];

function CareerPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Careers"
        title="Build software that"
        titleHighlight="schools rely on"
        subtitle="We hire people who want depth over hype—whether you write code, design flows, or guide a trust through go-live. If education operations fascinate you, you will fit right in."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-bold text-gray-900">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900">Open applications</h2>
          <p className="mt-4 text-base leading-relaxed text-gray-700">
            We maintain a rolling pipeline for software engineers (React/Node ecosystems), product
            analysts, implementation consultants, and customer success generalists with school or ERP
            exposure. Specific requisitions are shared when we open a dedicated search; until then,
            we still read thoughtful inbound applications.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-700">
            Send your CV, a short note on what you want to learn next, and (if applicable) links to
            GitHub, portfolios, or writing samples to{" "}
            <a
              href="mailto:schoolerp2004@gmail.com?subject=Careers%20%E2%80%93%20NexusCRM"
              className="font-semibold text-brand-600 underline-offset-2 hover:underline"
            >
              schoolerp2004@gmail.com
            </a>{" "}
            with the subject line <strong className="text-gray-900">Careers – NexusCRM</strong>.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            NexusCRM is an equal-opportunity employer. We welcome applicants of any background,
            gender, age, or ability—and we make interview adjustments when you let us know what you
            need.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm font-medium text-gray-700">No roles listed right now?</p>
          <p className="mt-2 text-sm text-gray-600">
            Introduce yourself anyway. We often create roles when we meet the right person.
          </p>
        </div>
      </div>

      <MarketingPageCta headline="Questions before you apply?" />
      <div className="h-8" />
    </>
  );
}

export default CareerPage;
