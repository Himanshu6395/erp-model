import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRoot = path.join(process.cwd(), "uploads", "student-leaves");

const ensureDir = () => {
  if (!fs.existsSync(uploadRoot)) {
    fs.mkdirSync(uploadRoot, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir();
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").slice(0, 10) || ".bin";
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safe);
  },
});

const fileFilter = (_req, file, cb) => {
  const okMime = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.mimetype || "");
  const okName = /\.(pdf|jpg|jpeg|png|webp)$/i.test(file.originalname || "");
  if (okMime || okName) cb(null, true);
  else cb(new Error("Only PDF or image files are allowed"), false);
};

export const uploadStudentLeaveFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
