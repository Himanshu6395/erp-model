import {
  LayoutDashboard,
  Wallet,
  Bell,
  Smartphone,
  Lock,
  RefreshCw,
} from "lucide-react";
import MarketingPageHero from "../../components/MarketingPageHero";
import MarketingPageCta from "../../components/MarketingPageCta";

const advantages = [
  {
    icon: LayoutDashboard,
    title: "Unified dashboards",
    desc: "Leaders see attendance trends, fee collection, and academic activity without exporting five spreadsheets into one pivot table.",
  },
  {
    icon: Wallet,
    title: "Fees that reconcile",
    desc: "Structures, receipts, and student balances stay tied to the same ledger logic—reducing parent disputes and audit surprises.",
  },
  {
    icon: Bell,
    title: "Fewer communication gaps",
    desc: "Notices, announcements, and alerts live beside timetables and homework so nobody has to guess which channel is “official.”",
  },
  {
    icon: Smartphone,
    title: "Works where teachers already are",
    desc: "Responsive web means staff can act from the staff room or on duty—without waiting for a desktop-only legacy window.",
  },
  {
    icon: Lock,
    title: "Permissions that match responsibility",
    desc: "RBAC ensures a class teacher, accountant, and student each see appropriate screens—critical when handling minors’ data.",
  },
  {
    icon: RefreshCw,
    title: "Continuous improvement",
    desc: "Product updates land on a managed cadence; you are not stuck on a five-year-old build because an upgrade is “too risky.”",
  },
];

function AdvantagesPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Why school ERP"
        title="Advantages your board and faculty"
        titleHighlight="can feel in a term"
        subtitle="Moving from paper registers and fragmented apps to NexusCRM is not about chasing buzzwords—it is about time recovered, money traced, and parents answered with confidence."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
            The schools that benefit most treat ERP as infrastructure: like electricity, you notice
            it when it fails. Below are the advantages teams cite after the first full academic cycle
            on NexusCRM—or even sooner when a crisis hits and everything is already in one system.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 border-l-4 border-l-brand-500 bg-white p-6 shadow-sm"
            >
              <Icon className="h-8 w-8 text-brand-600" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-gray-900 px-6 py-10 text-white sm:px-10 sm:py-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Compared to “just another app”</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-300/90">
                Without a real ERP
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• Duplicate student profiles across tools</li>
                <li>• Fee Excel sheets that disagree with the bank statement</li>
                <li>• Parents ping five WhatsApp groups for one timetable change</li>
                <li>• Audits mean weeks of manual reconciliation</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-300/90">
                With NexusCRM
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/90">
                <li>• One roster powering attendance, fees, and reports</li>
                <li>• Receipts and balances visible to finance and guardians</li>
                <li>• Notices and homework anchored to class context</li>
                <li>• Security and subscription views for operators who need them</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <MarketingPageCta headline="See these advantages on your own data" />
      <div className="h-8" />
    </>
  );
}

export default AdvantagesPage;
