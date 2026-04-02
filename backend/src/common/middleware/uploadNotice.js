import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRoot = path.join(process.cwd(), "uploads", "notices");

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
    const ext = path.extname(file.originalname || "").slice(0, 12) || ".bin";
    const safe = `notice-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safe);
  },
});

const fileFilter = (_req, file, cb) => {
  const okMime = /\.(pdf|doc|docx|png|jpe?g|webp)$/i.test(file.originalname || "") ||
    ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword"].includes(file.mimetype || "");
  if (okMime) cb(null, true);
  else cb(new Error("Invalid attachment type"), false);
};

export const uploadNoticeFile = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter,
});
