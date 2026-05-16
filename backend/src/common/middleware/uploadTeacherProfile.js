import fs from "fs";
import multer from "multer";
import path from "path";

const uploadRoot = path.join(process.cwd(), "uploads", "teachers");

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
    const ext = path.extname(file.originalname || "").slice(0, 12) || ".jpg";
    const safe = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safe);
  },
});

const allowedExt = /\.(jpe?g|png|webp)$/i;
const allowedMime = new Set(["image/jpeg", "image/png", "image/webp"]);

const fileFilter = (_req, file, cb) => {
  const nameOk = allowedExt.test(file.originalname || "");
  const mimeOk = allowedMime.has(file.mimetype || "");
  if (nameOk || mimeOk) cb(null, true);
  else cb(new Error("Only JPEG, PNG, or WebP images are allowed"), false);
};

export const uploadTeacherProfile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
