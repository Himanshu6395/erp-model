import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function MarketingPageCta({ headline = "Ready to see NexusCRM in action?" }) {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-brand-200/60 bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 p-8 text-center shadow-xl shadow-brand-900/20 sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15), transparent 50%)",
          }}
        />
        <p className="relative text-lg font-semibold text-white sm:text-xl">{headline}</p>
        <p className="relative mx-auto mt-2 max-w-lg text-sm text-white/85">
          Request a demo, ask about subscriptions, or talk through your roles and campuses—we’ll
          respond with clear next steps.
        </p>
        <Link
          to="/#request-demo"
          className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-lg transition hover:bg-gray-100"
        >
          Get a free demo
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

export default MarketingPageCta;
