/** Resize & compress image file for upload (max edge 1024px, JPEG quality ~0.85) */
export function compressImageFile(file, { maxSize = 1024, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(1, maxSize / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }
          const out = new File([blob], file.name.replace(/\.\w+$/, ".jpg") || "photo.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(out);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/** Square crop from center of image file */
export function cropImageSquare(file, size = 512) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Crop failed"));
            return;
          }
          resolve(new File([blob], "avatar.jpg", { type: "image/jpeg", lastModified: Date.now() }));
        },
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = url;
  });
}
