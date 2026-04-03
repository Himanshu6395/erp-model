import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Clock, Megaphone, Radio, Save, Sparkles, Timer } from "lucide-react";
import Loader from "../../components/Loader";
import { announcementService } from "../../services/announcementService";

const DURATION_OPTIONS = [
  { value: "", label: "Until turned off (no auto-hide)" },
  { value: "1", label: "1 hour" },
  { value: "6", label: "6 hours" },
  { value: "12", label: "12 hours" },
  { value: "24", label: "24 hours" },
  { value: "48", label: "2 days" },
  { value: "72", label: "3 days" },
  { value: "168", label: "7 days" },
  { value: "720", label: "30 days" },
];

function formatUntil(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function GlobalAnnouncementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [durationSelect, setDurationSelect] = useState("");
  const [visibleUntil, setVisibleUntil] = useState(null);
  const [expired, setExpired] = useState(false);

  const applyServerData = (data) => {
    setMessage(data.message || "");
    setIsActive(Boolean(data.isActive));
    setUpdatedAt(data.updatedAt || null);
    const dh = data.durationHours;
    setDurationSelect(dh != null && dh !== "" ? String(dh) : "");
    setVisibleUntil(data.visibleUntil || null);
    setExpired(Boolean(data.expired));
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await announcementService.getSuperAdminGlobal();
      applyServerData(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const durationHours = durationSelect === "" ? null : Number(durationSelect);
      const data = await announcementService.setSuperAdminGlobal({
        message: message.trim(),
        isActive,
        durationHours,
      });
      applyServerData(data);
      toast.success(isActive ? "Announcement is live for all schools" : "Announcement saved (not visible to schools)");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text="Loading announcement settings…" />;
  }

  const lastUpdatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  const publicationTitle = !isActive ? "Draft / hidden" : expired ? "Expired (hidden)" : "Live";

  const publicationHint = (() => {
    if (!isActive) return "Not shown until you enable and save";
    if (expired) return "End time passed — schools no longer see this until you republish";
    if (visibleUntil) return `Auto-hides after ${formatUntil(visibleUntil)}`;
    return "Visible on all school portals until you turn it off";
  })();

  const durationOptionsForSelect = (() => {
    const dh = durationSelect;
    if (dh && !DURATION_OPTIONS.some((o) => o.value === dh)) {
      return [...DURATION_OPTIONS, { value: dh, label: `${dh} hours (custom)` }];
    }
    return DURATION_OPTIONS;
  })();

  return (
    <div className="w-full max-w-7xl space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-900 to-brand-900 px-6 py-8 text-white shadow-xl shadow-indigo-900/20 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-100/90">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              Broadcast
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Global announcement</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Publish a single message to every school on the platform. It appears at the top of the dashboard for school
              administrators, teachers, and students. You can set how long it stays visible before it disappears automatically.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
              <Radio className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Publication status</p>
              <p className="truncate text-lg font-bold text-slate-900">{publicationTitle}</p>
              <p className="mt-0.5 text-xs text-slate-500">{publicationHint}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Timer className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Auto-hide</p>
              <p className="text-lg font-bold leading-snug text-slate-900">
                {durationSelect === "" ? "Off" : `${durationSelect} h / save`}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {visibleUntil && isActive && !expired ? `Ends ${formatUntil(visibleUntil)}` : "Set below when publishing"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-md">
              <Clock className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last saved</p>
              <p className="text-lg font-bold leading-snug text-slate-900">{lastUpdatedLabel}</p>
              <p className="mt-0.5 text-xs text-slate-500">Updated when you save changes</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <Building2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Audience</p>
              <p className="text-lg font-bold text-slate-900">All schools</p>
              <p className="mt-0.5 text-xs text-slate-500">Admins, teachers & students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80 sm:p-8">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Megaphone className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">Announcement copy</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Keep it concise and actionable. Users can dismiss the banner; a new save shows it again. Auto-hide removes it
                  from schools after the chosen time from the moment you save while published.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="global-announcement-text" className="text-sm font-semibold text-slate-800">
                Message
              </label>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Examples: scheduled maintenance, new module availability, or security reminders. Maximum 2,000 characters.
              </p>
              <textarea
                id="global-announcement-text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={2000}
                placeholder="e.g. Planned maintenance tonight, 10:00 PM – 12:00 AM IST. Brief interruptions may occur."
                className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="mt-2 flex justify-end">
                <span className="text-xs tabular-nums text-slate-400">{message.length} / 2,000</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <label htmlFor="global-announcement-duration" className="text-sm font-semibold text-slate-800">
                How long should schools see this?
              </label>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Applies when the announcement is published. Timer starts from the time you click Save. Choose &quot;Until turned
                off&quot; to keep it until you disable publishing.
              </p>
              <select
                id="global-announcement-duration"
                value={durationSelect}
                onChange={(e) => setDurationSelect(e.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
              >
                {durationOptionsForSelect.map((opt) => (
                  <option key={opt.value === "" ? "off" : opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-8 flex flex-col gap-6 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                <input
                  id="global-announcement-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="global-announcement-active" className="cursor-pointer text-sm leading-snug text-slate-700">
                  <span className="font-semibold text-slate-900">Publish to all school portals</span>
                  <span className="mt-0.5 block text-slate-600">
                    When enabled, the message appears as a banner after the next page load (unless the user dismissed this
                    version). Respect auto-hide timing above.
                  </span>
                </label>
              </div>
              <button
                type="button"
                disabled={saving || (isActive && !message.trim())}
                onClick={save}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Save className="h-4 w-4" aria-hidden />
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80">
            <h3 className="text-sm font-semibold text-slate-900">Writing guidelines</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                <span>
                  State the <strong className="font-medium text-slate-800">what</strong> and{" "}
                  <strong className="font-medium text-slate-800">when</strong> clearly (timezone if relevant).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                <span>Match auto-hide to the real window (e.g. 6 hours for same-day maintenance).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                <span>Avoid internal jargon; this is read by staff and students across tenants.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                <span>Turn off publishing when the event is over; you can keep draft text for reuse.</span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
              Tip: For school-specific notices, use each school&apos;s own notice tools. This page is only for platform-wide
              communication.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default GlobalAnnouncementPage;
