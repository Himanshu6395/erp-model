# Codebase Index

## Overview

`1stEccom` is a full-stack School ERP application with:
- A Node.js/Express/MongoDB backend in `backend`
- A React + Vite frontend in `frontend/frontend`

The repository currently has a nested frontend folder (`frontend/frontend`) and a few legacy/unused frontend directories (`src/api`, `src/apis`, `src/redux`, `src/data`) alongside the active `src/services`-based app.

## Top-Level Structure

- `backend` - Express API server, domain modules, Mongoose models, seed scripts
- `frontend` - Wrapper folder containing the actual Vite app in `frontend/frontend`
- `.gitignore` - root ignore rules
- `LICENSE` - project license

## Backend Index (`backend`)

### Runtime and config
- `server.js` - process entry point; loads env, connects MongoDB, starts HTTP server
- `config/db.js` - MongoDB connection logic (`MONGO_URI`)
- `.env.example` - required backend env keys
- `package.json` - backend dependencies/scripts

### Application bootstrap
- `src/app.js` - Express app setup (CORS, JSON parser, morgan, auth endpoints, API router, error handlers)
- `src/routes/index.js` - API route aggregation under `/api`

### Shared infrastructure (`src/common`)
- `constants/roles.js` - role constants
- `errors/AppError.js` - custom error class
- `middleware/authMiddleware.js` - JWT auth + role authorization
- `middleware/validateRequest.js` - express-validator result handler
- `middleware/errorHandler.js` - not-found + global error middleware
- `utils/catchAsync.js` - async route wrapper
- `utils/logger.js` - logging helper

### Domain modules (`src/modules`)
- `auth` - login endpoint and auth service/controller/repository
- `school` - super-admin and school-admin operations (schools/admins/students/teachers/classes/notices)
- `student` - student self-service dashboard data (attendance/result/fees/assignments/notices/admit card)
- `user`, `attendance`, `assignment`, `fees`, `notice`, `result` - present but mostly placeholder or not wired into `src/routes/index.js`

### Data models (`src/models`)
- `User.js`, `School.js`, `Class.js`, `Teacher.js`, `Student.js`
- `Attendance.js`, `Result.js`, `Fees.js`, `Assignment.js`, `Notice.js`

### Data/utility folders
- `seed/seedData.js` - DB reseed script with demo users and sample records
- `seeduser.js` - additional seed utility script
- `s3` - S3-related assets/scripts folder
- `service` - currently empty
- `utils` - root-level backend utility folder (separate from `src/common/utils`)

### Backend entry points and mounted routes
- Health/info: `GET /`
- Auth:
  - `POST /api/auth/login`
  - `POST /auth/login` (duplicate compatibility path)
- API root (`/api`) from `src/routes/index.js`:
  - `/auth/*`
  - `/super-admin/*`
  - `/school-admin/*`
  - `/student/*`

## Frontend Index (`frontend/frontend`)

### Runtime and config
- `package.json` - Vite/React scripts and dependencies
- `vite.config.ts`, `tailwind.config.js`, `postcss.config.js` - build/styling config
- `.env.example` - frontend env (`VITE_API_BASE_URL`)
- `eslint.config.js`, `tsconfig*.json`, `jsconfig.json` - linting + language config

### Application entry
- `src/main.jsx` - React root mount, router setup, auth provider, toast provider
- `src/App.jsx` - app shell rendering route tree
- `src/routes/AppRoutes.jsx` - central route map with role-based guards and dashboards

### Auth and app state
- `src/context/AuthContext.jsx` - auth lifecycle (login/logout, token/user persistence)
- `src/context/useAuth.js` - auth hook
- `src/components/ProtectedRoute.jsx` - route guarding by role
- `src/utils/roleUtils.js` - roles and role-home mapping
- `src/utils/storage.js` - localStorage helpers

### API/data layer (active)
- `src/services/api.js` - axios instance, base URL, auth header interceptor, error normalization
- `src/services/authService.js` - login service
- `src/services/superAdminService.js` - school/school-admin operations
- `src/services/adminService.js` - student/teacher/class/notice creation
- `src/services/studentService.js` - student dashboard endpoints + admit-card download

### UI composition
- `src/layouts` - `DashboardLayout`, `Navbar`, `Sidebar`
- `src/components` - reusable UI pieces (`Loader`, `FormCard`, `StatCard`, route guard)
- `src/pages/auth` - login
- `src/pages/superAdmin` - super admin pages
- `src/pages/admin` - school admin pages
- `src/pages/student` - student pages
- `src/pages/teacher` - teacher dashboard

### Legacy/possibly unused frontend folders
- `src/api`, `src/apis`, `src/app`, `src/redux`, `src/data`, `src/pages.js`
- These do not appear to be imported by the active `src/main.jsx -> src/App.jsx -> src/routes/AppRoutes.jsx` flow.

## Tech Stack

### Backend
- Node.js (ESM)
- Express 5
- MongoDB + Mongoose
- JWT auth (`jsonwebtoken`)
- Validation (`express-validator`)
- File/upload/PDF/S3 support (`multer`, `pdfkit`, AWS SDK)

### Frontend
- React 19 + Vite
- React Router
- Tailwind CSS
- Axios
- React Hot Toast
- Optional/installed: Redux Toolkit, Framer Motion, icon libraries

## Key Scripts

### Backend (`backend/package.json`)
- `npm run start` - start API server
- `npm run dev` - run server with nodemon
- `npm run seed` - reseed database with demo data

### Frontend (`frontend/frontend/package.json`)
- `npm run dev` - start Vite dev server
- `npm run build` - type-check + production build
- `npm run lint` - run ESLint
- `npm run preview` - preview production build

## Environment Variables

### Backend (`backend/.env`)
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### Frontend (`frontend/frontend/.env`)
- `VITE_API_BASE_URL` (defaults in code to `http://localhost:5000/api`)

## Quick Start

1. Backend:
   - `cd backend`
   - `npm install`
   - create `.env` from `.env.example`
   - optional seed: `npm run seed`
   - run: `npm run dev`
2. Frontend:
   - `cd frontend/frontend`
   - `npm install`
   - create `.env` from `.env.example`
   - run: `npm run dev`

## Notes and Hotspots

- Route duplication exists in backend auth/school module (`/school` and `/schools`, etc.) for compatibility.
- Several backend modules are scaffolded but not mounted in `src/routes/index.js`.
- Frontend has a nested root and legacy folders that look like leftovers from earlier architecture iterations.
