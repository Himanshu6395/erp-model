import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Wallet,
  UsersRound,
  UserSquare2,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  CalendarDays,
  BookOpen,
  Shield,
  MonitorPlay,
  UserCircle,
  Building2,
  LayoutGrid,
  FolderOpen,
  Lock,
  BarChart3,
  Receipt,
  CreditCard,
  Banknote,
  Layers,
  Landmark,
  FileText,
  PieChart,
  Users,
  Plane,
  Clock,
  TrendingUp,
  Activity,
  UserPlus,
  Bell,
  MessageCircle,
  Send,
  ClipboardList,
  Smartphone,
  MessagesSquare,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookMarked,
  NotebookPen,
  HelpCircle,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import bgImage from "../assets/crm-brand-bg.jpg";
import demoMacbook from "../assets/demo-macbook.png";
import mobileAppMockup from "../assets/home-mobile-app-mockup.png";
import SiteFooter from "../components/SiteFooter";
import LandingHeader from "../components/LandingHeader";
import { FAQ_ITEMS } from "../data/faqData";

const POCKET_ERP_FEATURES = [
  "Run live and online classes—teachers schedule sessions and students join from one responsive NexusCRM workspace.",
  "Take and review attendance with admin oversight, teacher bulk marking, and instant student visibility.",
  "Timetables, notices, and role-based alerts so classes, fees, and deadlines never catch anyone off guard.",
  "Assignments end to end: publish homework, attach study material, and collect submissions without leaving the ERP.",
  "Fees, receipts, exams, and marks in one flow—aligned with your school admin, teacher, and student dashboards.",
  "One secure sign-in: super admin, school admin, teacher, and student routes open automatically after authentication.",
];

/** Pastel icon wrappers matching reference (sky / violet / orange rotation). */
const iconWrap = [
  "bg-sky-100 text-sky-600",
  "bg-sky-100 text-sky-600",
  "bg-violet-100 text-violet-600",
  "bg-orange-100 text-orange-600",
  "bg-sky-100 text-sky-600",
  "bg-violet-100 text-violet-600",
  "bg-orange-100 text-orange-600",
  "bg-sky-100 text-sky-600",
];

const MODULE_TABS = [
  {
    id: "academics",
    label: "Academics",
    cards: [
      {
        icon: BookOpen,
        title: "Homework Assignment",
        description:
          "Teachers publish homework and track submissions; students submit work from their portal—aligned with your admin homework module.",
      },
      {
        icon: MonitorPlay,
        title: "E-learning",
        description:
          "Schedule online classes and share study material so lessons continue beyond the classroom with structured digital access.",
      },
      {
        icon: UserCircle,
        title: "Student Information System",
        description:
          "Central student profiles, enrollment, and class mapping with quick access for admins and self-service views for learners.",
      },
      {
        icon: ClipboardCheck,
        title: "Attendance",
        description:
          "Mark and audit attendance for classes and staff with bulk tools for teachers and transparent records for students.",
      },
      {
        icon: CalendarDays,
        title: "Timetable",
        description:
          "Build and publish period-wise timetables for admins, teachers, and students so everyone follows the same daily rhythm.",
      },
      {
        icon: GraduationCap,
        title: "Exams & results",
        description:
          "Plan exams, capture marks, and publish results and admit cards across roles with a single academic workflow.",
      },
      {
        icon: BookMarked,
        title: "Library",
        description:
          "Catalog resources and let students browse library activity next to their academic tools in the same ERP.",
      },
      {
        icon: NotebookPen,
        title: "Diary & class notes",
        description:
          "Teachers maintain diary entries and structured notes so parents and coordinators stay aligned with class progress.",
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    cards: [
      {
        icon: Building2,
        title: "Schools & tenants",
        description:
          "Super admins onboard schools, manage org records, and keep each tenant isolated with dedicated navigation and data.",
      },
      {
        icon: LayoutGrid,
        title: "Classes & sections",
        description:
          "Configure classes and sections, map students, and keep roll lists accurate for attendance and fee allocation.",
      },
      {
        icon: BookOpen,
        title: "Subject management",
        description:
          "Define subjects and link them to classes so teachers and exams use consistent academic structure.",
      },
      {
        icon: UsersRound,
        title: "Student management",
        description:
          "Create and update student records, imports, and lifecycle data from a single school admin console.",
      },
      {
        icon: Shield,
        title: "Roles & permissions",
        description:
          "Delegate access with role-aware menus so only the right staff see sensitive operations and reports.",
      },
      {
        icon: FolderOpen,
        title: "File management",
        description:
          "Store and organize documents for students and staff with centralized uploads tied to your security model.",
      },
      {
        icon: Lock,
        title: "Security",
        description:
          "Harden access with security settings, monitoring hooks, and patterns that match your JWT and RBAC-ready routes.",
      },
      {
        icon: BarChart3,
        title: "Reports & analytics",
        description:
          "Surface operational reports for attendance, fees, and performance to guide leadership decisions.",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    cards: [
      {
        icon: Wallet,
        title: "Fee structures",
        description:
          "Design fee heads and structures per class so collections stay consistent and auditable across terms.",
      },
      {
        icon: Receipt,
        title: "Fee collection",
        description:
          "Record payments, discounts, and balances from the admin desk with clear trails for every receipt.",
      },
      {
        icon: CreditCard,
        title: "Student fee portal",
        description:
          "Let students and guardians view dues, pay where enabled, and download receipts without admin bottlenecks.",
      },
      {
        icon: Banknote,
        title: "Salary & payslip",
        description:
          "Give teachers visibility into salary and payslip information inside the same authenticated workspace.",
      },
      {
        icon: Layers,
        title: "Plans & subscriptions",
        description:
          "Platform operators manage billing plans and school subscriptions from the super-admin finance tools.",
      },
      {
        icon: Landmark,
        title: "Payment records",
        description:
          "Track institutional payments and settlements with views suited for finance and super-admin oversight.",
      },
      {
        icon: FileText,
        title: "Receipts & documents",
        description:
          "Keep digital references for invoices and fee letters ready for compliance and parent communication.",
      },
      {
        icon: PieChart,
        title: "Financial summaries",
        description:
          "Roll up fee and payment signals into summaries that leadership can scan without exporting spreadsheets first.",
      },
    ],
  },
  {
    id: "hr",
    label: "Human Resource",
    cards: [
      {
        icon: UserSquare2,
        title: "Teacher profiles",
        description:
          "Maintain teacher records, assignments, and class links from creation through daily teaching operations.",
      },
      {
        icon: Users,
        title: "Staff management",
        description:
          "Extend people operations to non-teaching staff with modules reserved for clerical and operational roles.",
      },
      {
        icon: Plane,
        title: "Leave management",
        description:
          "Teachers apply for leave and admins track approvals without leaving the ERP messaging context.",
      },
      {
        icon: Clock,
        title: "Workforce attendance",
        description:
          "Pair academic attendance with staff-facing patterns so duty and presence stay accountable.",
      },
      {
        icon: TrendingUp,
        title: "Performance",
        description:
          "Capture performance signals for classes and cohorts to support reviews and academic interventions.",
      },
      {
        icon: Activity,
        title: "Activity logs",
        description:
          "Review teacher activity trails to understand engagement across homework, diary, and classroom tools.",
      },
      {
        icon: CalendarDays,
        title: "Teacher timetable",
        description:
          "Mirror institutional timetables in teacher views so workloads and free periods are always current.",
      },
      {
        icon: UserPlus,
        title: "Hiring readiness",
        description:
          "Prepare pipelines for future recruitment hooks while today’s roster stays organized in one directory.",
      },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    cards: [
      {
        icon: Megaphone,
        title: "Notices",
        description:
          "Publish official notices from admin workflows and propagate them to student notice feeds instantly.",
      },
      {
        icon: Bell,
        title: "Announcements",
        description:
          "Teachers broadcast class announcements while students see them next to alerts and timetables.",
      },
      {
        icon: MessageCircle,
        title: "Communication hub",
        description:
          "Route school-wide communication through a dedicated module built for SMS, email, and chat integrations.",
      },
      {
        icon: Send,
        title: "Outbound messaging",
        description:
          "Queue parent and student messages with templates that respect roles and delivery channels you enable.",
      },
      {
        icon: ClipboardList,
        title: "Notice board",
        description:
          "Students browse a curated board that aggregates institutional updates without hunting through email.",
      },
      {
        icon: Smartphone,
        title: "Alerts & push-ready UI",
        description:
          "Alert surfaces for students and staff mirror how mobile push and SMS layers will attach to the same events.",
      },
      {
        icon: MessagesSquare,
        title: "Parent touchpoints",
        description:
          "Structure parent-facing messages alongside fee and attendance events for fewer missed conversations.",
      },
      {
        icon: MessageSquare,
        title: "Feedback & grievances",
        description:
          "Students submit feedback and complaints so leadership can respond inside guarded, traceable threads.",
      },
    ],
  },
];

/** Landing grid (third section) — same MODULE_FEATURES idea, fewer imports. */
const MODULE_FEATURES = [
  {
    icon: Wallet,
    title: "Fees & finance",
    description:
      "Collect fees, track balances, and manage structures from the admin console—students pay and view receipts; teachers access salary and payslip views.",
  },
  {
    icon: UsersRound,
    title: "Students & profiles",
    description:
      "Onboard students, manage profiles, and give families a dedicated portal for attendance, results, fees, notices, admit cards, and timetables.",
  },
  {
    icon: UserSquare2,
    title: "Teachers & classes",
    description:
      "Create teachers and classes, assign subjects and sections, and connect staff to homework, exams, diary, and online class workflows.",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance",
    description:
      "Mark and review attendance for admins and teachers—including bulk marking—while students see their own records in real time.",
  },
  {
    icon: GraduationCap,
    title: "Exams, results & homework",
    description:
      "Schedule exams, enter marks, publish results, assign homework, and issue admit cards across admin, teacher, and student views.",
  },
  {
    icon: Megaphone,
    title: "Notices & communication",
    description:
      "Publish notices and announcements, run the communication hub, and keep everyone aligned with alerts and notification centers per role.",
  },
  {
    icon: CalendarDays,
    title: "Timetable & scheduling",
    description:
      "Plan periods and slots for admins, teachers, and students so daily routines stay visible and consistent across the institution.",
  },
  {
    icon: BookOpen,
    title: "Library & study material",
    description:
      "Support library access for students and let teachers upload study material so learning resources live next to class activity.",
  },
  {
    icon: Shield,
    title: "Platform & security",
    description:
      "Super-admin tools for schools, plans, subscriptions, and payments—plus security dashboards, login activity, blocks, and RBAC-ready navigation.",
  },
];

const DEMO_ROLES = [
  { value: "", label: "— Please choose an option —" },
  { value: "super_admin", label: "Super Admin" },
  { value: "school_admin", label: "School Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "other", label: "Other / exploring" },
];

function useCarouselPerView() {
  const [perView, setPerView] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setPerView(1);
      else if (w < 1024) setPerView(2);
      else setPerView(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return perView;
}

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  const [demoForm, setDemoForm] = useState({
    role: "",
    name: "",
    email: "",
    mobile: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [moduleTab, setModuleTab] = useState("academics");
  const [moduleSlide, setModuleSlide] = useState(0);
  const [openFaqId, setOpenFaqId] = useState(null);
  const perView = useCarouselPerView();

  const activeTabData = useMemo(
    () => MODULE_TABS.find((t) => t.id === moduleTab) ?? MODULE_TABS[0],
    [moduleTab]
  );
  const cards = activeTabData.cards;
  const maxSlide = Math.max(0, cards.length - perView);

  useEffect(() => {
    setModuleSlide(0);
  }, [moduleTab]);

  useEffect(() => {
    setModuleSlide((s) => Math.min(s, maxSlide));
  }, [maxSlide, perView]);

  const slidePrev = () => setModuleSlide((s) => Math.max(0, s - 1));
  const slideNext = () => setModuleSlide((s) => Math.min(maxSlide, s + 1));

  const onDemoChange = (e) => {
    const { name, value } = e.target;
    setDemoForm((prev) => ({ ...prev, [name]: value }));
  };

  const onDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoForm.role) {
      toast.error("Please select your role.");
      return;
    }
    if (!/^\d{10}$/.test(demoForm.mobile.replace(/\D/g, ""))) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast.success("Thanks! We’ll email demo access shortly.");
    setDemoForm({ role: "", name: "", email: "", mobile: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      <main className="relative flex min-h-[78vh] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 sm:min-h-[82vh] sm:px-6 sm:py-28 lg:py-32 lg:px-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/85 via-gray-900/75 to-gray-900/90" aria-hidden />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-teal-300/90">
            School & operations in one place
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl sm:leading-tight">
            Run your institution with clarity and control
          </h1>
          <p className="mt-6 text-base text-white/80 sm:text-lg">
            Super admins, school staff, teachers, and students each get the tools they need—secure
            access, role-based dashboards, and a single sign-in experience.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-700 sm:w-auto"
            >
              Login to dashboard
            </Link>
            <p className="text-sm text-white/60">
              Use your school credentials to continue
            </p>
          </div>
        </div>
      </main>

      <section
        id="erp-modules"
        className="relative z-20 scroll-mt-20 bg-[#0b7cff] py-14 sm:py-20"
        aria-labelledby="erp-modules-heading"
      >
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            id="erp-modules-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.25rem]"
          >
            School ERP Modules
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base">
            A comprehensive ERP module with user-friendly dashboards, easy navigation, and
            well-structured reports—mapped to the NexusCRM roles you already use.
          </p>

          <div className="mt-10 flex flex-wrap items-end justify-center gap-3 sm:gap-4">
            {MODULE_TABS.map((tab) => {
              const active = moduleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModuleTab(tab.id)}
                  className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition sm:px-6 sm:text-[0.95rem] ${
                    active
                      ? "bg-white text-[#0b7cff] shadow-md"
                      : "border border-white/90 bg-transparent text-white hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span
                      className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[8px] border-x-transparent border-t-white"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden pb-2">
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{
                width: `${(cards.length * 100) / perView}%`,
                transform: `translateX(-${moduleSlide * (100 / cards.length)}%)`,
              }}
            >
              {cards.map((card, idx) => {
                const Icon = card.icon;
                const wrap = iconWrap[idx % iconWrap.length];
                return (
                  <div
                    key={`${activeTabData.id}-${card.title}`}
                    className="box-border shrink-0 px-2 sm:px-3"
                    style={{ width: `${100 / cards.length}%` }}
                  >
                    <article className="flex h-full flex-col rounded-2xl bg-white p-6 text-left shadow-lg shadow-black/10 sm:p-7">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${wrap}`}
                        >
                          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                        </div>
                        <h3 className="pt-1 text-base font-bold leading-snug text-gray-900 sm:text-lg">
                          {card.title}
                        </h3>
                      </div>
                      <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
                        {card.description}
                      </p>
                      <Link
                        to="/login"
                        className="mt-5 inline-flex items-center text-sm font-semibold text-[#0b7cff] transition hover:text-blue-700"
                      >
                        Read More <span className="ml-1" aria-hidden>→</span>
                      </Link>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-4">
            <button
              type="button"
              onClick={slidePrev}
              disabled={moduleSlide <= 0}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/95 text-gray-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous modules"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={slideNext}
              disabled={moduleSlide >= maxSlide}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/95 text-gray-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next modules"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        className="relative z-20 scroll-mt-20 bg-gradient-to-b from-gray-50/80 to-white py-16 sm:py-20"
        aria-labelledby="modules-heading"
      >
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            NexusCRM capabilities
          </p>
          <h2
            id="modules-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            65+ modules & screens
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
            Every tile reflects areas already wired in this School ERP—super admin, school admin,
            teacher, and student experiences in one product.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          {MODULE_FEATURES.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group flex flex-col items-center rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-lg rounded-bl-lg border border-gray-100/90 bg-white p-8 text-center shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 hover:border-brand-200/80 hover:shadow-[0_24px_48px_-12px_rgba(37,99,235,0.18)]"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 via-white to-demo-500/10 text-brand-600 ring-1 ring-brand-100/80 transition group-hover:from-brand-100/80 group-hover:text-brand-700">
                <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="subscriptions"
        className="relative z-20 scroll-mt-20 overflow-hidden border-y border-gray-200/80 py-16 sm:py-20"
        aria-labelledby="subscriptions-heading"
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-brand-50/80 via-white to-demo-50/40"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-demo-400/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[min(90%,42rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-200/60 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 shadow-sm shadow-brand-500/10 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden />
              Billing
            </span>
            <h2
              id="subscriptions-heading"
              className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            >
              Subscriptions{" "}
              <span className="bg-gradient-to-r from-brand-600 to-demo-500 bg-clip-text text-transparent">
                your way
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
              NexusCRM runs as a school subscription. Pick the rhythm that fits your finance process—
              we’ll walk through terms and onboarding when you reach out (no obligation).
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2 sm:gap-6">
            <article className="group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white/90 p-6 shadow-[0_16px_40px_-20px_rgba(37,99,235,0.2)] ring-1 ring-white/80 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200/80 hover:shadow-[0_24px_48px_-16px_rgba(37,99,235,0.25)] sm:p-7">
              <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-demo-400 opacity-90"
                aria-hidden
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 shadow-inner ring-1 ring-brand-100/80 transition group-hover:scale-105">
                <RefreshCw className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">Monthly</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Renew each month—ideal while you pilot NexusCRM or need maximum flexibility at the
                start of your rollout.
              </p>
            </article>

            <article className="group relative overflow-hidden rounded-2xl border border-demo-200/60 bg-gradient-to-b from-white to-demo-50/30 p-6 shadow-[0_16px_40px_-20px_rgba(14,165,233,0.18)] ring-1 ring-demo-100/50 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-demo-300/70 hover:shadow-[0_24px_48px_-16px_rgba(14,165,233,0.22)] sm:p-7">
              <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-demo-400 via-cyan-500 to-brand-500 opacity-90"
                aria-hidden
              />
              <span className="absolute right-4 top-4 rounded-full bg-demo-500/15 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-demo-700">
                Popular
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-demo-100 to-cyan-50 text-demo-700 shadow-inner ring-1 ring-demo-100/80 transition group-hover:scale-105">
                <CalendarDays className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">Yearly</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                One renewal aligned with your academic year—easier for budgets and less paperwork for
                finance and leadership teams.
              </p>
            </article>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <a
              href="#request-demo"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition hover:from-brand-700 hover:to-brand-800 hover:shadow-brand-600/40"
            >
              Request details
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <p className="text-xs text-gray-500">
              Custom options available for trusts and multi-campus setups.
            </p>
          </div>
        </div>
      </section>

      <section
        id="request-demo"
        className="relative z-20 scroll-mt-20 overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-16 sm:py-24"
        aria-labelledby="demo-heading"
      >
        <div
          className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-demo-500/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-cyan-200/20 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-[2rem] border border-white/60 bg-white/75 p-8 shadow-[0_25px_80px_-20px_rgba(15,118,200,0.25)] backdrop-blur-xl sm:p-10">
                <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-demo-500/20 via-transparent to-brand-500/15 opacity-60" />
                <div className="relative">
                  <span className="inline-flex items-center rounded-full border border-demo-500/25 bg-gradient-to-r from-demo-500/10 to-cyan-100/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-800">
                    Get 2 mobile apps free
                  </span>
                  <h2
                    id="demo-heading"
                    className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
                  >
                    Get a free demo
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                    Share your details and we’ll send demo credentials for NexusCRM school management
                    software—web plus companion apps for admins, teachers, and students.
                  </p>

                  <form onSubmit={onDemoSubmit} className="mt-8 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="demo-role" className="text-sm font-medium text-gray-800">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="demo-role"
                          name="role"
                          value={demoForm.role}
                          onChange={onDemoChange}
                          className="w-full rounded-full border border-gray-200/90 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none ring-demo-500/0 transition focus:border-demo-500 focus:ring-4 focus:ring-demo-500/15"
                        >
                          {DEMO_ROLES.map((opt) => (
                            <option key={opt.value || "empty"} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="demo-name" className="text-sm font-medium text-gray-800">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="demo-name"
                          name="name"
                          type="text"
                          required
                          value={demoForm.name}
                          onChange={onDemoChange}
                          placeholder="Your name"
                          className="w-full rounded-full border border-gray-200/90 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-demo-500 focus:ring-4 focus:ring-demo-500/15"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="demo-email" className="text-sm font-medium text-gray-800">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="demo-email"
                          name="email"
                          type="email"
                          required
                          value={demoForm.email}
                          onChange={onDemoChange}
                          placeholder="Email address"
                          className="w-full rounded-full border border-gray-200/90 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-demo-500 focus:ring-4 focus:ring-demo-500/15"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="demo-mobile" className="text-sm font-medium text-gray-800">
                          Mobile number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="demo-mobile"
                          name="mobile"
                          type="tel"
                          inputMode="numeric"
                          required
                          maxLength={10}
                          value={demoForm.mobile}
                          onChange={onDemoChange}
                          placeholder="10-digit mobile no."
                          className="w-full rounded-full border border-gray-200/90 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-demo-500 focus:ring-4 focus:ring-demo-500/15"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full bg-gradient-to-r from-demo-500 to-demo-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-demo-500/30 transition hover:from-demo-600 hover:to-demo-600 hover:shadow-xl hover:shadow-demo-500/35 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "Sending…" : "Submit"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
              <div className="relative max-w-lg">
                <div
                  className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-[3rem] bg-gradient-to-tr from-demo-500/20 via-transparent to-brand-400/20 blur-2xl"
                  aria-hidden
                />
                <img
                  src={demoMacbook}
                  alt="NexusCRM dashboard preview on laptop"
                  className="relative z-10 w-full max-w-[min(100%,520px)] drop-shadow-[0_30px_60px_rgba(15,23,42,0.35)] motion-reduce:animate-none animate-demo-float select-none"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pocket-erp"
        className="relative z-20 scroll-mt-20 overflow-hidden py-16 sm:py-24 lg:py-28"
        aria-labelledby="pocket-erp-heading"
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-800 to-[#0a1628]"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-black/25 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <div className="lg:col-span-7">
            <h2
              id="pocket-erp-heading"
              className="text-left text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem] lg:leading-[1.2]"
            >
              Carry your institute with you—school management at your fingertips with NexusCRM.
            </h2>
            <ul className="mt-8 space-y-4" role="list">
              {POCKET_ERP_FEATURES.map((line, i) => (
                <li key={`pocket-feat-${i}`} className="flex gap-3 text-left">
                  <span
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25"
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed text-white/90 sm:text-base sm:leading-7">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="#faq"
              className="mt-10 inline-flex items-center justify-center rounded-lg bg-[#EF5D10] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-orange-600/30 transition hover:bg-[#d54e0c] hover:shadow-orange-600/40 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Know more
            </a>
          </div>

          <div className="relative flex justify-center lg:col-span-5 lg:justify-end">
            <div className="relative w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[320px]">
              <div
                className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent blur-2xl"
                aria-hidden
              />

              <div className="absolute -left-2 top-[8%] z-20 sm:-left-4 sm:top-[10%] lg:-left-6">
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white px-3 py-2.5 shadow-xl shadow-black/20 sm:gap-2.5 sm:px-4 sm:py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white shadow-md shadow-teal-900/30">
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                    </span>
                    <span className="text-xs font-bold text-gray-900 sm:text-sm">Mark attendance</span>
                  </div>
                  <div
                    className="absolute -bottom-3 left-[60%] h-6 w-px bg-white/40 sm:left-[55%]"
                    aria-hidden
                  />
                  <div
                    className="absolute -bottom-6 left-[58%] h-3 w-3 rotate-45 border-b border-r border-white/40 sm:left-[53%]"
                    aria-hidden
                  />
                </div>
              </div>

              <div className="absolute -right-1 bottom-[18%] z-20 sm:-right-2 sm:bottom-[20%] lg:-right-4">
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white px-3 py-2.5 shadow-xl shadow-black/20 sm:gap-2.5 sm:px-4 sm:py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b7cff] text-white shadow-md shadow-blue-900/30">
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                    </span>
                    <span className="text-xs font-bold text-gray-900 sm:text-sm">Submit assignment</span>
                  </div>
                  <div
                    className="absolute -top-3 right-[45%] h-6 w-px bg-white/40"
                    aria-hidden
                  />
                  <div
                    className="absolute -top-5 right-[43%] h-3 w-3 rotate-45 border-l border-t border-white/40"
                    aria-hidden
                  />
                </div>
              </div>

              <img
                src={mobileAppMockup}
                alt="NexusCRM school app dashboard on a smartphone"
                className="relative z-10 mx-auto w-full drop-shadow-[0_28px_60px_rgba(0,0,0,0.45)] select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="relative z-20 scroll-mt-20 overflow-hidden border-t border-gray-200/60 bg-gradient-to-b from-slate-100/90 via-white to-brand-50/20 py-20 sm:py-28"
        aria-labelledby="faq-heading"
      >
        <div
          className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-400/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-32 h-64 w-64 rounded-full bg-demo-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-300/40 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="text-center lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-700 shadow-sm shadow-brand-500/5 backdrop-blur-sm">
                <HelpCircle className="h-4 w-4 text-brand-600" aria-hidden />
                Help center
              </span>
              <h2
                id="faq-heading"
                className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.35rem] lg:leading-tight"
              >
                Answers that{" "}
                <span className="bg-gradient-to-r from-brand-600 via-demo-500 to-brand-500 bg-clip-text text-transparent">
                  match your rollout
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-600 sm:text-base lg:mx-0">
                Practical detail on roles, tenancy, security, and how teams graduate from this page
                into a guided NexusCRM School ERP evaluation.
              </p>

              <div className="mx-auto mt-10 hidden max-w-sm flex-col gap-4 lg:mx-0 lg:flex">
                <div className="group flex gap-4 rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-md shadow-gray-900/5 ring-1 ring-gray-100/80 transition hover:border-brand-200/60 hover:shadow-lg hover:shadow-brand-500/10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-inner shadow-brand-900/20">
                    <Shield className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Security-first</p>
                    <p className="mt-1 text-sm text-gray-600">
                      JWT sessions and RBAC-aware menus across every dashboard.
                    </p>
                  </div>
                </div>
                <div className="group flex gap-4 rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-md shadow-gray-900/5 ring-1 ring-gray-100/80 transition hover:border-demo-200/60 hover:shadow-lg hover:shadow-demo-500/10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-demo-500 to-brand-500 text-white shadow-inner">
                    <UsersRound className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Four role experiences</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Super admin, school admin, teacher, and student—each with tailored navigation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <ul className="space-y-4" role="list">
                {FAQ_ITEMS.map((item, index) => {
                  const open = openFaqId === item.id;
                  const num = String(index + 1).padStart(2, "0");
                  return (
                    <li key={item.id}>
                      <div
                        className={`group overflow-hidden rounded-2xl border transition-all duration-300 ease-out motion-reduce:transition-none ${
                          open
                            ? "border-brand-300/70 bg-gradient-to-br from-white via-white to-brand-50/40 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.35)] ring-2 ring-brand-500/10"
                            : "border-gray-200/90 bg-white/90 shadow-md shadow-gray-900/[0.04] ring-1 ring-gray-100/80 hover:border-brand-200/50 hover:shadow-lg hover:shadow-brand-500/[0.07]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqId(open ? null : item.id)}
                          className="flex w-full items-start gap-4 p-5 text-left sm:gap-5 sm:p-6"
                          aria-expanded={open}
                          aria-controls={`faq-panel-${item.id}`}
                          id={`faq-trigger-${item.id}`}
                        >
                          <span
                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums transition-colors ${
                              open
                                ? "bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md"
                                : "bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-700"
                            }`}
                            aria-hidden
                          >
                            {num}
                          </span>
                          <span className="min-w-0 flex-1 pt-0.5 text-base font-semibold leading-snug text-gray-900 sm:text-lg">
                            {item.question}
                          </span>
                          <span
                            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                              open
                                ? "rotate-180 border-brand-200 bg-brand-50 text-brand-700"
                                : "border-gray-200 bg-gray-50 text-gray-500"
                            }`}
                          >
                            <ChevronDown className="h-5 w-5" aria-hidden />
                          </span>
                        </button>
                        <div
                          id={`faq-panel-${item.id}`}
                          role="region"
                          aria-labelledby={`faq-trigger-${item.id}`}
                          className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="border-t border-brand-100/60 bg-gradient-to-b from-brand-50/20 to-transparent px-5 pb-6 pt-1 sm:px-6">
                              <p className="pl-0 text-sm leading-relaxed text-gray-600 sm:text-[0.9375rem] sm:leading-7">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-10 rounded-2xl border border-brand-200/60 bg-gradient-to-br from-white via-brand-50/40 to-demo-50/30 p-6 text-center shadow-lg shadow-brand-500/10 sm:p-8">
                <p className="text-sm font-medium text-gray-800 sm:text-base">
                  Still exploring?
                </p>
                <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
                  <Link
                    to="/login"
                    className="font-semibold text-brand-600 underline decoration-brand-300/80 underline-offset-2 transition hover:text-brand-700"
                  >
                    Sign in
                  </Link>{" "}
                  with existing credentials, or scroll up and submit the demo form—we’ll tailor next
                  steps to your role.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export default HomePage;
