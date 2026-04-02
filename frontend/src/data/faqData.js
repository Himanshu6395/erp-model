export const FAQ_ITEMS = [
  {
    id: "what-is-nexuscrm",
    question: "What is NexusCRM, and who is it designed for?",
    answer:
      "NexusCRM is a school management ERP that unifies operations for platform super administrators, school administrators, teachers, and students. Each role receives its own dashboard and navigation, so day-to-day work stays focused and permissions stay appropriate.",
  },
  {
    id: "sign-in-roles",
    question: "How does sign-in work across different roles?",
    answer:
      "Users authenticate with email and password. After a successful login, the application routes each user to the home area for their role—for example super-admin consoles, school admin tools, teacher workspaces, or the student portal—based on the account that was provisioned for them.",
  },
  {
    id: "data-isolation",
    question: "Is each school’s data kept separate on the platform?",
    answer:
      "Yes. The product is built for multi-tenant use: super-admin users oversee schools, plans, subscriptions, and platform-wide settings, while school-level administrators, teachers, and students work within their institution’s context so operational data remains logically separated between tenants.",
  },
  {
    id: "modules-scope",
    question: "Which capabilities are available today versus planned on the roadmap?",
    answer:
      "Active areas reflected in the product include dashboards, student and teacher management, classes and subjects, attendance, fees, notices, timetables, homework, exams and marks, library and study material, communication surfaces, and super-admin tooling for schools, billing, payments, and security monitoring. Some sidebar entries are placeholders (such as certain transport or hostel flows) and are intended to be completed as your deployment matures.",
  },
  {
    id: "demo-access",
    question: "How do I request a demo or evaluation access?",
    answer:
      "Complete the “Get a free demo” section on the home page with your role and contact details. Our team will respond with demo credentials and orientation matched to whether you are evaluating the platform centrally or within a single school.",
  },
  {
    id: "security",
    question: "How does NexusCRM approach authentication and access control?",
    answer:
      "The stack is oriented around authenticated APIs, JWT-based sessions, and role-based access control (RBAC). Super-admin views such as security dashboards, login activity, and blocked-school management support operational governance wherever those features are enabled in your environment.",
  },
  {
    id: "devices",
    question: "Can staff and students use NexusCRM on mobile devices?",
    answer:
      "The web application is built with responsive layouts and runs in current desktop and mobile browsers. Companion mobile apps may be part of your rollout; discuss device strategy and branding when you coordinate onboarding with your project contact.",
  },
  {
    id: "support",
    question: "Who should we contact for onboarding or technical questions?",
    answer:
      "Use the channel provided in your demo or contract response—typically a designated success or technical contact. For larger rollouts, we recommend assigning a lead school administrator to coordinate user roles, data imports, and training alongside your NexusCRM representative.",
  },
];
