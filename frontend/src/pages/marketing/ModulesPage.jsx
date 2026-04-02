import { MODULE_CATEGORIES } from "../../data/modulesCatalog";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

function ModulesPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Product depth"
        title="Every module in NexusCRM maps to"
        titleHighlight="real school work"
        subtitle="Below is how we group capabilities inside the product—aligned with the same academics, administration, finance, HR, and communication surfaces you see after sign-in. Placeholder routes in your sidebar (transport, hostel, etc.) are called out so expectations stay honest."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-brand-50/50 to-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">How to read this catalog</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
            NexusCRM ships as a single web application with role-based menus. Super administrators
            see platform-wide tools (schools, plans, subscriptions, security). School administrators
            see operational consoles (students, teachers, fees, attendance). Teachers and students
            see focused workspaces. The modules below describe capability areas—your exact menu may
            vary slightly by deployment and permissions.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
            Some items in the school-admin navigation are <strong>roadmap placeholders</strong>{" "}
            (for example dedicated transport or hostel workflows). They appear so your IT team can
            plan integrations; we note them here to avoid overselling what is click-ready today.
          </p>
        </div>

        <div className="mt-14 space-y-16">
          {MODULE_CATEGORIES.map((cat) => (
            <section key={cat.id} id={cat.id}>
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{cat.label}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
                  {cat.summary}
                </p>
              </div>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2">
                {cat.items.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                  >
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-slate-900 px-6 py-8 text-white sm:px-10 sm:py-10">
          <h2 className="text-xl font-bold sm:text-2xl">Roadmap & placeholders</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Your admin sidebar may list transport, hostel, advanced transport mapping, or similar
            entries as <strong className="text-white">module placeholders</strong>. Those screens
            typically explain the intended workflow and collect requirements rather than executing
            full production logic until your project prioritises them. Ask us during a demo which
            placeholders are nearest to release for your stack.
          </p>
        </div>
      </div>

      <MarketingPageCta headline="Want a guided tour of these modules on your roles?" />
      <div className="h-8" />
    </>
  );
}

export default ModulesPage;
