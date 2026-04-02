import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRoot = path.join(process.cwd(), "uploads", "study-materials");

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
    const safe = `sm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safe);
  },
});

const allowedExt = /\.(pdf|doc|docx|ppt|pptx|png|jpe?g|webp|gif|mp4|webm|mov|mkv)$/i;
const allowedMime = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const fileFilter = (_req, file, cb) => {
  const nameOk = allowedExt.test(file.originalname || "");
  const mimeOk = allowedMime.has(file.mimetype || "");
  if (nameOk || mimeOk) cb(null, true);
  else cb(new Error("Unsupported file type for study material"), false);
};

export const uploadStudyMaterialFiles = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter,
});
