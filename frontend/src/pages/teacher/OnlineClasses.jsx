import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarClock,
  Copy,
  ExternalLink,
  Filter,
  GraduationCap,
  RefreshCw,
  Search,
  Video,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import Loader from "../../components/Loader";
import { teacherService } from "../../services/teacherService";

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

const labelClass = "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600";

function GlassStat({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.25rem] border border-white/60 bg-gradient-to-br p-5 text-white shadow-lg ring-1 ring-slate-200/50 backdrop-blur-md ${gradient}`}>
      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/25 ring-1 ring-white/30">
          <Icon className="h-5 w-5" strokeWidth={1.85} />
        </span>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/85">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
          {sub ? <p className="mt-0.5 text-xs text-white/80">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function classLabel(item) {
  const c = item.classId;
  if (!c) return "—";
  const name = c.name || "Class";
  return c.section ? `${name} · ${c.section}` : name;
}

function sessionStatus(date) {
  const t = new Date(date).getTime();
  const now = Date.now();
  if (t > now) return "upcoming";
  if (now - t < 2 * 60 * 60 * 1000) return "recent";
  return "past";
}

function statusBadge(status) {
  if (status === "upcoming") return "bg-sky-50 text-sky-800 ring-sky-200/80";
  if (status === "recent") return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
  return "bg-slate-100 text-slate-600 ring-slate-200/80";
}

function statusLabel(status) {
  if (status === "upcoming") return "Upcoming";
  if (status === "recent") return "Ended recently";
  return "Past";
}

export default function TeacherOnlineClassesPage() {
  const [assigned, setAssigned] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [form, setForm] = useState({ classId: "", subject: "", date: "", meetingLink: "" });

  const classOptions = useMemo(() => {
    const map = new Map();
    assigned.forEach((r) => {
      const id = String(r.classId);
      if (!map.has(id)) {
        map.set(id, {
          classId: id,
          label: r.label || `${r.className}${r.section ? ` · ${r.section}` : ""}`,
        });
      }
    });
    return [...map.values()];
  }, [assigned]);

  const subjectOptions = useMemo(() => {
    if (!form.classId) return [];
    const names = new Set();
    assigned
      .filter((r) => String(r.classId) === form.classId)
      .forEach((r) => {
        (r.subjects || []).forEach((s) => {
          const n = s.name || s.subjectName;
          if (n) names.add(n);
        });
      });
    return [...names];
  }, [assigned, form.classId]);

  const stats = useMemo(() => {
    const now = Date.now();
    let upcoming = 0;
    let past = 0;
    let thisWeek = 0;
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    items.forEach((item) => {
      const t = new Date(item.date).getTime();
      if (t > now) upcoming += 1;
      else past += 1;
      const d = new Date(item.date);
      if (d >= weekStart && d < weekEnd) thisWeek += 1;
    });
    return { total: items.length, upcoming, past, thisWeek };
  }, [items]);

  const enriched = useMemo(
    () => items.map((item) => ({ ...item, session: sessionStatus(item.date) })),
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((item) => {
      if (filterClass && String(item.classId?._id || item.classId) !== filterClass) return false;
      if (filterStatus && item.session !== filterStatus) return false;
      if (!q) return true;
      return (
        String(item.subject || "").toLowerCase().includes(q) ||
        String(item.meetingLink || "").toLowerCase().includes(q) ||
        classLabel(item).toLowerCase().includes(q)
      );
    });
  }, [enriched, search, filterClass, filterStatus]);

  const loadAssigned = useCallback(async () => {
    try {
      const data = await teacherService.getAssignedClassesWithSubjects();
      setAssigned(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await teacherService.getOnlineClasses();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssigned();
    load();
  }, [loadAssigned, load]);

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const save = async () => {
    if (!form.classId || !form.subject.trim() || !form.date || !form.meetingLink.trim()) {
      toast.error("Class, subject, date & time, and meeting link are required");
      return;
    }
    setSubmitting(true);
    try {
      await teacherService.scheduleOnlineClass({
        classId: form.classId,
        subject: form.subject.trim(),
        date: form.date,
        meetingLink: form.meetingLink.trim(),
      });
      toast.success("Online class scheduled");
      setForm({ classId: "", subject: "", date: "", meetingLink: "" });
      load(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading online classes…" />;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Virtual classroom</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Online classes</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Schedule Google Meet, Zoom, or other live sessions for your assigned classes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStat icon={Video} label="Total sessions" value={stats.total} gradient="from-brand-600 to-indigo-700" />
        <GlassStat icon={CalendarClock} label="Upcoming" value={stats.upcoming} sub="Scheduled ahead" gradient="from-sky-600 to-cyan-700" />
        <GlassStat icon={Clock3} label="This week" value={stats.thisWeek} sub="All sessions" gradient="from-violet-600 to-purple-700" />
        <GlassStat icon={CheckCircle2} label="Completed" value={stats.past} sub="Past sessions" gradient="from-slate-600 to-slate-800" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="rounded-[1.35rem] border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Schedule session</h2>
              <p className="text-sm text-slate-500">Students can join via the meeting link you provide.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Class *</label>
                <select
                  className={inputClass}
                  value={form.classId}
                  onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value, subject: "" }))}
                >
                  <option value="">Select class</option>
                  {classOptions.map((c) => (
                    <option key={c.classId} value={c.classId}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Subject *</label>
                {subjectOptions.length > 0 ? (
                  <select
                    className={inputClass}
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  >
                    <option value="">Select subject</option>
                    {subjectOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputClass}
                    placeholder="e.g. Science"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  />
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Date & time *</label>
              <input
                className={inputClass}
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>

            <div>
              <label className={labelClass}>Meeting link *</label>
              <input
                className={inputClass}
                placeholder="https://meet.google.com/… or Zoom link"
                value={form.meetingLink}
                onChange={(e) => setForm((p) => ({ ...p, meetingLink: e.target.value }))}
              />
            </div>

            <button
              type="button"
              onClick={save}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-brand-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:from-indigo-700 hover:to-brand-700 disabled:opacity-60 sm:w-auto"
            >
              <CalendarClock className="h-4 w-4" />
              {submitting ? "Scheduling…" : "Schedule class"}
            </button>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900">Scheduled sessions</h2>
            <p className="mt-0.5 text-sm text-slate-500">{filtered.length} of {items.length} shown</p>
            <div className="mt-4 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  placeholder="Search subject, class, link…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[140px]">
                  <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    className={`${inputClass} pl-10`}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="recent">Ended recently</option>
                    <option value="past">Past</option>
                  </select>
                </div>
                <select
                  className={inputClass}
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="">All classes</option>
                  {classOptions.map((c) => (
                    <option key={c.classId} value={c.classId}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="max-h-[520px] space-y-3 overflow-y-auto p-5">
            {filtered.map((item) => (
              <article
                key={item._id}
                className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white p-4 transition hover:border-indigo-200/60 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <Video className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{item.subject}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {classLabel(item)}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                        <CalendarClock className="h-3.5 w-3.5 text-brand-600" />
                        {formatDateTime(item.date)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide ring-1 ${statusBadge(item.session)}`}>
                    {statusLabel(item.session)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-indigo-700 sm:flex-none"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Join meeting
                  </a>
                  <button
                    type="button"
                    onClick={() => copyLink(item.meetingLink)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copy link
                  </button>
                </div>
              </article>
            ))}
            {!filtered.length && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
                <Video className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-semibold text-slate-700">No online classes scheduled</p>
                <p className="mt-1 max-w-xs text-sm text-slate-500">Create a session with a meeting link and it will appear here for quick access.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
