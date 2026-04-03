import { useCallback, useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { announcementService } from "../services/announcementService";

const STORAGE_KEY = "erp_global_announcement_dismissed_at";

function formatEndsAt(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return null;
  }
}

function isPast(iso) {
  if (!iso) return false;
  return new Date(iso).getTime() <= Date.now();
}

function GlobalAnnouncementBanner() {
  const [payload, setPayload] = useState(null);
  const [visible, setVisible] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const data = await announcementService.getSchoolGlobal();
      setPayload(data);
      if (!data?.message) {
        setVisible(false);
        return;
      }
      if (data.visibleUntil && isPast(data.visibleUntil)) {
        setVisible(false);
        return;
      }
      const token = data.updatedAt ? new Date(data.updatedAt).toISOString() : "";
      const dismissed = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      setVisible(Boolean(token && dismissed !== token));
    } catch {
      setPayload(null);
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!payload?.visibleUntil) return undefined;
    const id = setInterval(() => setNowTick(Date.now()), 15000);
    return () => clearInterval(id);
  }, [payload?.visibleUntil]);

  useEffect(() => {
    if (payload?.message && payload.visibleUntil && isPast(payload.visibleUntil)) {
      setVisible(false);
    }
  }, [payload?.message, payload?.visibleUntil, nowTick]);

  const dismiss = () => {
    if (payload?.updatedAt) {
      window.localStorage.setItem(STORAGE_KEY, new Date(payload.updatedAt).toISOString());
    }
    setVisible(false);
  };

  if (!visible || !payload?.message) return null;

  const endsLabel = formatEndsAt(payload.visibleUntil);

  return (
    <div
      role="status"
      className="sticky top-0 z-30 mb-4 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100/80 sm:px-5"
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
          <Megaphone className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">Platform announcement</p>
          <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-800">{payload.message}</p>
          {endsLabel ? (
            <p className="mt-2 text-xs text-slate-500">Automatically hidden after {endsLabel}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 self-start rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss announcement"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

export default GlobalAnnouncementBanner;
