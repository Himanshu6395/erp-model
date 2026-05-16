import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, Upload } from "lucide-react";
import { compressImageFile, cropImageSquare } from "../../../utils/imageCompress";
import { resolveUploadUrl } from "../../../utils/apiOrigin";

export default function ProfilePhotoUpload({
  name,
  previewUrl,
  cacheBust = 0,
  onFileSelect,
  onRemove,
  disabled,
  uploading = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [displayUrl, setDisplayUrl] = useState("");
  const [imgReady, setImgReady] = useState(true);

  const initials = (name || "T")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!previewUrl) {
      setDisplayUrl("");
      setImgReady(true);
      return;
    }
    if (previewUrl.startsWith("blob:") || previewUrl.startsWith("http")) {
      setDisplayUrl(previewUrl);
      setImgReady(true);
      return;
    }
    const base = resolveUploadUrl(previewUrl);
    const next = cacheBust ? `${base}${base.includes("?") ? "&" : "?"}v=${cacheBust}` : base;
    setImgReady(false);
    const img = new Image();
    img.onload = () => {
      setDisplayUrl(next);
      setImgReady(true);
    };
    img.onerror = () => {
      setDisplayUrl(next);
      setImgReady(true);
    };
    img.src = next;
  }, [previewUrl, cacheBust]);

  const processFile = useCallback(
    async (file) => {
      if (!file) return;
      setBusy(true);
      try {
        const cropped = await cropImageSquare(file);
        const compressed = await compressImageFile(cropped);
        onFileSelect(compressed);
      } catch {
        onFileSelect(file);
      } finally {
        setBusy(false);
      }
    },
    [onFileSelect]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type?.startsWith("image/")) processFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-100 to-indigo-100 shadow-lg ring-4 ring-white ring-offset-2 ring-offset-slate-50">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt=""
              className={`h-full w-full object-cover transition-opacity duration-200 ${imgReady ? "opacity-100" : "opacity-0"}`}
            />
          ) : (
            <span className="text-2xl font-bold text-brand-700">{initials}</span>
          )}
        </div>
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition hover:bg-brand-700 disabled:opacity-50"
          title="Change photo"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragOver ? "border-brand-400 bg-brand-50/50" : "border-slate-200 bg-slate-50/80 hover:border-brand-300"
        }`}
      >
        <ImagePlus className="mb-2 h-8 w-8 text-slate-400" />
        <p className="text-sm font-semibold text-slate-800">Drag & drop or choose a photo</p>
        <p className="mt-1 text-xs text-slate-500">JPEG, PNG, WebP · auto-cropped & compressed</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : busy ? "Processing…" : "Upload from device"}
          </button>
          {displayUrl && onRemove ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onRemove}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => processFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
