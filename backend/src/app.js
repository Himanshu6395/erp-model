import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";
import { body } from "express-validator";
import routes from "./routes/index.js";
import authRoutes from "./modules/auth/routes.js";
import { authController } from "./modules/auth/controller.js";
import catchAsync from "./common/utils/catchAsync.js";
import validateRequest from "./common/middleware/validateRequest.js";
import { notFoundHandler, errorHandler } from "./common/middleware/errorHandler.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "School ERP API running" });
});

// Direct auth endpoints to avoid route mismatch issues across clients.
app.post(
  "/api/auth/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  validateRequest,
  catchAsync(authController.login)
);
app.post(
  "/auth/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  validateRequest,
  catchAsync(authController.login)
);
app.all("/api/auth/login", (req, res, next) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed. Use POST /api/auth/login" });
  }
  return next();
});
// Explicit auth mount for stable login route access.
app.use("/api/auth", authRoutes);
app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
