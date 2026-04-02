/**
 * Deep module catalog aligned with NexusCRM School ERP navigation and home carousel.
 * Used by /modules and referenced conceptually across marketing pages.
 */
export const MODULE_CATEGORIES = [
  {
    id: "academics",
    label: "Academics",
    summary:
      "Everything that happens in and around the classroom—content, time, assessment, and learner records—wired into one academic spine.",
    items: [
      {
        title: "Homework & assignments",
        detail:
          "Teachers publish tasks, attach context, and track submissions; students submit from their portal with a clear history per class.",
      },
      {
        title: "E-learning & study material",
        detail:
          "Online class scheduling plus file-based study resources so hybrid and revision workflows do not live in a separate silo.",
      },
      {
        title: "Student information (SIS)",
        detail:
          "Central profiles, class mapping, and guardian-facing views so enrollment data is not re-keyed for every module.",
      },
      {
        title: "Attendance",
        detail:
          "Period- and day-level marking with admin review, teacher bulk actions, and student self-service visibility into their own record.",
      },
      {
        title: "Timetable",
        detail:
          "Period grids published consistently to admins, teachers, and students—reducing corridor confusion and manual PDFs.",
      },
      {
        title: "Exams, marks & admit cards",
        detail:
          "Exam setup, mark entry, results publication, and admit-card flows aligned across school admin, teacher, and student roles.",
      },
      {
        title: "Library",
        detail:
          "Resource discovery for students with administrative hooks so reading programmes sit next to the rest of academic life.",
      },
      {
        title: "Diary & class notes",
        detail:
          "Teacher diary entries and structured notes that leadership and parents can rely on when coordinating interventions.",
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    summary:
      "How the school runs operationally—master data, access, files, and reporting—without opening ten different admin tools.",
    items: [
      {
        title: "Schools & tenants",
        detail:
          "Super-admin onboarding of schools, org metadata, and tenant isolation so each campus keeps its own operational boundary.",
      },
      {
        title: "Classes, sections & subjects",
        detail:
          "Canonical structure for grades, divisions, and subject lists that attendance, fees, and exams all consume.",
      },
      {
        title: "Student & teacher records",
        detail:
          "Lifecycle management from creation through roster assignment, imports where needed, and audit-friendly updates.",
      },
      {
        title: "Roles & permissions",
        detail:
          "Menu and action visibility driven by RBAC so clerks, principals, and specialists see only what their job requires.",
      },
      {
        title: "File management",
        detail:
          "Central document storage tied to students and staff instead of scattered drives with unclear retention rules.",
      },
      {
        title: "Security settings",
        detail:
          "Hooks for JWT-backed sessions, policy alignment, and super-admin security consoles where your deployment enables them.",
      },
      {
        title: "Reports & analytics",
        detail:
          "Operational roll-ups for attendance, fees, and academic signals so committees review facts—not folklore.",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    summary:
      "Fee design, collection, receipts, and leadership roll-ups—with optional platform-level plans and payments for multi-school operators.",
    items: [
      {
        title: "Fee structures",
        detail:
          "Configurable fee heads and class-wise rules so discounts, waivers, and term splits stay explainable to auditors and parents.",
      },
      {
        title: "Collection & receipts",
        detail:
          "Desk-side payment capture with immutable receipt trails and balance views that match what finance exports to the bank.",
      },
      {
        title: "Student fee portal",
        detail:
          "Guardian-readable dues, payment status, and downloadable receipts without queueing at the office for every query.",
      },
      {
        title: "Salary & payslip (teachers)",
        detail:
          "Staff-facing salary visibility inside the authenticated workspace so HR answers fewer one-off payslip emails.",
      },
      {
        title: "Plans, subscriptions & payments (platform)",
        detail:
          "Super-admin surfaces for billing plans, school subscriptions, and payment logs when you operate NexusCRM as a service provider.",
      },
      {
        title: "Financial summaries",
        detail:
          "Leadership dashboards that aggregate collection velocity and outstanding exposure without manual pivot tables.",
      },
    ],
  },
  {
    id: "hr",
    label: "Human resources",
    summary:
      "People operations for teaching and operational staff—presence, leave, performance signals, and audit trails.",
    items: [
      {
        title: "Teacher profiles & assignments",
        detail:
          "Roster integrity between HR records and classroom responsibilities, including subject and class linkage.",
      },
      {
        title: "Staff & non-teaching roles",
        detail:
          "Extend the same identity fabric to clerical, transport, or hostel teams as your governance model allows.",
      },
      {
        title: "Leave workflows",
        detail:
          "Apply, approve, and track leave without losing context in email threads or paper registers.",
      },
      {
        title: "Workforce attendance",
        detail:
          "Pair staff presence patterns with academic attendance so duty coverage stays defensible during inspections.",
      },
      {
        title: "Performance & activity",
        detail:
          "Signals from homework, diary, and engagement tools to support reviews—not punitive surveillance by default.",
      },
      {
        title: "Teacher timetable mirror",
        detail:
          "Always-current period view so substitutions and free periods are negotiated with accurate data.",
      },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    summary:
      "Official channels for notices, announcements, and outbound messaging—anchored to classes and roles, not lost in chat noise.",
    items: [
      {
        title: "Notices & notice board",
        detail:
          "Institution-wide and targeted notices with student-facing boards that reduce “I did not see the circular” disputes.",
      },
      {
        title: "Announcements",
        detail:
          "Teacher and admin broadcasts tied to academic context so recipients know why it matters to their class.",
      },
      {
        title: "Communication hub",
        detail:
          "Central place to orchestrate SMS, email, or future chat integrations with templates and role-aware audiences.",
      },
      {
        title: "Alerts & notifications",
        detail:
          "In-app alert surfaces for students and staff, ready to align with mobile push as your rollout matures.",
      },
      {
        title: "Feedback & grievances",
        detail:
          "Structured intake for student feedback and complaints with traceability for leadership follow-up.",
      },
    ],
  },
];
