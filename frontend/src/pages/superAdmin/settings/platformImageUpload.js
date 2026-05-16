const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
const ACCEPT_ATTR = ".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp";

export { ACCEPT_ATTR };

export function isAcceptedImage(file) {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  if (ACCEPTED_TYPES.includes(type)) return true;
  const name = (file.name || "").toLowerCase();
  return [".png", ".jpg", ".jpeg", ".svg", ".webp"].some((ext) => name.endsWith(ext));
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

function resizeRaster(file, maxDim) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        } else {
          width = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const mime = file.type === "image/webp" ? "image/webp" : "image/png";
      resolve(canvas.toDataURL(mime, 0.92));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image file"));
    };
    img.src = url;
  });
}

/** Read image file → data URL (resizes raster images to maxDim). */
export async function processPlatformImage(file, { maxDim = 512, maxBytes = 2 * 1024 * 1024 } = {}) {
  if (!isAcceptedImage(file)) {
    throw new Error("Use PNG, JPG, SVG, or WEBP");
  }
  if (file.size > maxBytes) {
    throw new Error(`Image must be under ${Math.round(maxBytes / 1024 / 1024)}MB`);
  }

  const type = (file.type || "").toLowerCase();
  if (type === "image/svg+xml" || (file.name || "").toLowerCase().endsWith(".svg")) {
    return readAsDataUrl(file);
  }

  return resizeRaster(file, maxDim);
}
