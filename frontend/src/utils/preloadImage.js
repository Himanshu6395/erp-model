/** Load image in browser cache before swapping src (avoids avatar blink). */
export function preloadImageUrl(url) {
  if (!url) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}
