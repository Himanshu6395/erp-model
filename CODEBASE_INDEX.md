# Codebase Index

## Overview

This repository is a full-stack School ERP application with:

- `backend/` - Node.js + Express + MongoDB API
- `frontend/` - React + Vite client

The current app is split cleanly by runtime, but there are a few legacy frontend folders and partially wired backend modules that are worth knowing about before making changes.

## Top-Level Structure

- `backend/` - API server, domain modules, Mongoose models, seed scripts
- `frontend/` - Vite React app
- `CODEBASE_INDEX.md` - this repository map
- `.gitignore`
- `LICENSE`

## Backend Index

### Runtime and boot flow

- `backend/server.js`
  Starts the process, loads env vars, connects to MongoDB, and listens on `PORT` / `HOST`.
- `backend/config/db.js`
  MongoDB connection bootstrap.
- `backend/package.json`
  Backend scripts and dependencies.

### Express app setup

- `backend/src/app.js`
  Central Express bootstrap:
  - enables CORS, JSON parsing, and request logging
  - serves uploaded files from `/uploads`
  - exposes `GET /` health/info response
  - mounts direct login compatibility routes:
    - `POST /api/auth/login`
    - `POST /auth/login`
  - mounts all API modules under `/api`
  - installs not-found and global error handlers

- `backend/src/routes/index.js`
  Primary API router. Active route groups:
  - `/api/auth/*`
  - `/api/super-admin/*`
  - `/api/super-admin/security/*`
  - `/api/announcements/*`
  - `/api/school-admin/*`
  - `/api/student/*`
  - `/api/teacher/*`

### Shared backend infrastructure

- `backend/src/common/constants/roles.js`
  Role constants used across auth/authorization.
- `backend/src/common/errors/AppError.js`
  Custom application error type.
- `backend/src/common/middleware/authMiddleware.js`
  JWT auth and role checks.
- `backend/src/common/middleware/errorHandler.js`
  Not-found and error middleware.
- `backend/src/common/middleware/validateRequest.js`
  `express-validator` result handling.
- `backend/src/common/middleware/uploadNotice.js`
- `backend/src/common/middleware/uploadStudentLeave.js`
- `backend/src/common/middleware/uploadStudyMaterial.js`
  Multer-based upload handlers.
- `backend/src/common/utils/catchAsync.js`
  Async route wrapper.
- `backend/src/common/utils/feeCalculations.js`
  Fee-related helper logic.
- `backend/src/common/utils/logger.js`
  Shared logging helper.

### Backend domain modules

Each module generally follows:

- `controller.js` - HTTP handlers
- `service.js` - business logic
- `repository.js` - database access
- `routes.js` - route declarations

Active or clearly wired modules:

- `backend/src/modules/auth/`
  Authentication flow.
- `backend/src/modules/school/`
  Super-admin school management.
- `backend/src/modules/admin/`
  School-admin actions.
- `backend/src/modules/student/`
  Student-facing data endpoints.
- `backend/src/modules/teacher/`
  Teacher-facing endpoints.
- `backend/src/modules/subscription/`
  Plans, subscriptions, payments.
- `backend/src/modules/security/`
  Security/admin monitoring endpoints.
- `backend/src/modules/globalAnnouncement/`
  Announcement flows, split into:
  - `superRoutes.js`
  - `schoolRoutes.js`

Present but not mounted centrally in `backend/src/routes/index.js`:

- `backend/src/modules/assignment/`
- `backend/src/modules/attendance/`
- `backend/src/modules/exams/`
- `backend/src/modules/fees/`
- `backend/src/modules/notice/`
- `backend/src/modules/notices/`
- `backend/src/modules/result/`
- `backend/src/modules/timetable/`
- `backend/src/modules/user/`

These may be in-progress, legacy, or used indirectly. Check imports before assuming they are live.

### Backend data models

Core tenant and identity models:

- `backend/src/models/User.js`
- `backend/src/models/School.js`
- `backend/src/models/Class.js`
- `backend/src/models/Teacher.js`
- `backend/src/models/Student.js`
- `backend/src/models/Subscription.js`
- `backend/src/models/Plan.js`

Academic and operations models:

- `backend/src/models/Attendance.js`
- `backend/src/models/Assignment.js`
- `backend/src/models/Exam.js`
- `backend/src/models/ExamSubject.js`
- `backend/src/models/Result.js`
- `backend/src/models/Timetable.js`
- `backend/src/models/Subject.js`
- `backend/src/models/StudyMaterial.js`
- `backend/src/models/Notice.js`

Finance, security, and support models:

- `backend/src/models/Fees.js`
- `backend/src/models/FeeAssignment.js`
- `backend/src/models/FeePayment.js`
- `backend/src/models/FeeStructure.js`
- `backend/src/models/Payment.js`
- `backend/src/models/GlobalAnnouncement.js`
- `backend/src/models/LoginActivity.js`
- `backend/src/models/SecurityLog.js`
- `backend/src/models/Notification.js`
- `backend/src/models/StudentLeave.js`
- `backend/src/models/TeacherLeave.js`
- `backend/src/models/StudentComplaint.js`
- `backend/src/models/StudentFeedback.js`

Also present:

- communication, diary, online class, library, placement, registration-link, and activity-log related models

### Backend support folders

- `backend/seed/seedData.js`
  Seed script for demo or reset data.
- `backend/seeduser.js`
  Additional user seeding utility.
- `backend/uploads/`
  Uploaded files served statically.
- `backend/s3/config.js`
  S3-related configuration.
- `backend/utils/`
  Extra utility helpers outside `src/common`.

### Backend scripts

- `cd backend && npm run dev`
- `cd backend && npm run start`
- `cd backend && npm run seed`

## Frontend Index

### Runtime and boot flow

- `frontend/package.json`
  Frontend scripts and dependencies.
- `frontend/src/main.jsx`
  React entrypoint. Wraps the app with:
  - `BrowserRouter`
  - `AuthProvider`
  - `Toaster`
- `frontend/src/App.jsx`
  Thin shell that renders `AppRoutes`.
- `frontend/src/routes/AppRoutes.jsx`
  Main route registry for:
  - public marketing pages
  - login
  - super admin area
  - school admin area
  - student area
  - teacher area

### Frontend auth and session flow

- `frontend/src/context/AuthContext.jsx`
  Holds current user/token, login/logout actions, and persistence logic.
- `frontend/src/context/useAuth.js`
  Auth context hook.
- `frontend/src/components/ProtectedRoute.jsx`
  Role-aware route guard.
- `frontend/src/utils/storage.js`
  Local storage helpers for auth state.
- `frontend/src/utils/roleUtils.js`
  Role constants and home-route mapping.

### Frontend API layer

- `frontend/src/config/api.js`
  Global API origin toggle:
  - `LOCAL_API = http://localhost:5000`
  - `PROD_API = https://43.205.113.119`
  - `USE_LOCAL` decides which base host is active

- `frontend/src/services/api.js`
  Shared Axios instance using `${BASE_URL}/api`, with:
  - auth header injection
  - normalized error handling

- `frontend/src/services/authService.js`
- `frontend/src/services/adminService.js`
- `frontend/src/services/studentService.js`
- `frontend/src/services/teacherService.js`
- `frontend/src/services/superAdminService.js`
- `frontend/src/services/superAdminOpsService.js`
- `frontend/src/services/announcementService.js`
  Feature-level API wrappers.

### Frontend layouts and reusable UI

- `frontend/src/layouts/DashboardLayout.jsx`
  Shared authenticated app shell.
- `frontend/src/layouts/AdminStudentManagementLayout.jsx`
  Nested admin student management shell.
- `frontend/src/layouts/MarketingShell.jsx`
  Public marketing page wrapper.
- `frontend/src/layouts/Navbar.jsx`
- `frontend/src/layouts/Sidebar.jsx`

- `frontend/src/components/`
  Reusable UI and utility components such as:
  - `Loader`
  - `FormCard`
  - `StatCard`
  - `Pagination`
  - `SearchInput`
  - `LandingHeader`
  - `SiteFooter`
  - `GlobalAnnouncementBanner`
  - `MarketingPageHero`
  - `MarketingPageCta`

### Frontend page structure

- `frontend/src/pages/auth/`
  Login flow.
- `frontend/src/pages/marketing/`
  Public landing, modules, pricing, FAQ, services, legal pages.
- `frontend/src/pages/superAdmin/`
  School creation, plans, subscriptions, payments, security, announcements.
- `frontend/src/pages/admin/`
  School-admin dashboard and management pages.
- `frontend/src/pages/student/`
  Student dashboard, attendance, results, fees, assignments, leaves, materials, notices.
- `frontend/src/pages/teacher/`
  Teacher dashboard, attendance, homework, leaves, study material, timetable, communication.

### Frontend data and assets

- `frontend/src/data/`
  Marketing and catalog content.
- `frontend/src/assets/`
  Images and brand assets.

### Frontend folders that look legacy or secondary

- `frontend/src/api/`
- `frontend/src/apis/`
- `frontend/src/app/`
- `frontend/src/redux/`
- `frontend/src/pages.js`

The active app flow appears to rely on `src/services/`, `src/context/`, and `src/routes/`. These other folders may be remnants from an older architecture or experimental work.

## Tech Stack

### Backend

- Node.js (ESM)
- Express 5
- MongoDB + Mongoose
- JWT auth
- `express-validator`
- `multer`
- `pdfkit`
- AWS S3 SDK

### Frontend

- React 19
- Vite 7
- React Router
- Tailwind CSS
- Axios
- React Hot Toast
- Framer Motion
- Redux Toolkit is installed, but not obviously central to the active app flow

## Environment and Config Notes

### Backend

Expected env values include:

- `PORT`
- `HOST`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### Frontend

The frontend currently uses hardcoded host selection in `frontend/src/config/api.js` instead of a Vite env-driven config. That file is the first place to check when API calls point at the wrong server.

## Navigation Hotspots

If you are trying to understand the app quickly, start here:

1. `backend/server.js`
2. `backend/src/app.js`
3. `backend/src/routes/index.js`
4. `frontend/src/main.jsx`
5. `frontend/src/routes/AppRoutes.jsx`
6. `frontend/src/context/AuthContext.jsx`
7. `frontend/src/services/api.js`
8. `frontend/src/config/api.js`

## Notes

- The old index previously described a nested `frontend/frontend` app, but the active app lives directly in `frontend/`.
- The backend contains more modules than are actually mounted in the central router.
- The frontend appears to have some duplicate API/state patterns (`services`, `api`, `apis`, `redux`), so it is worth checking whether a folder is part of the live path before extending it.
