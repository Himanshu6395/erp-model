import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, MessageCircle } from "lucide-react";
import { FAQ_ITEMS } from "../../data/faqData";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

function FaqPage() {
  const [openId, setOpenId] = useState(null);

  return (
    <>
      <MarketingPageHero
        eyebrow="Help center"
        title="Frequently asked"
        titleHighlight="questions"
        subtitle="Straight answers about NexusCRM School ERP—roles, security, devices, and how to start a demo. Prefer the full landing experience? Jump home anytime."
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 sm:px-5">
          <p className="flex items-center gap-2 text-sm text-gray-700">
            <MessageCircle className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
            Need something else? Use the demo form or email in our footer.
          </p>
          <Link
            to="/"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            ← Back to home
          </Link>
        </div>

        <div className="mt-10 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-sm">
          {FAQ_ITEMS.map((item) => {
            const open = openId === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50/80 sm:px-6 sm:py-5"
                  aria-expanded={open}
                >
                  <span className="font-semibold text-gray-900">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="border-t border-gray-100 bg-gray-50/40 px-5 pb-5 pt-0 sm:px-6">
                    <p className="pt-4 text-sm leading-relaxed text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Last reviewed for accuracy with the current NexusCRM navigation and security model.
        </p>
      </div>

      <MarketingPageCta headline="Still unsure? Book a short walkthrough" />
      <div className="h-8" />
    </>
  );
}

export default FaqPage;
