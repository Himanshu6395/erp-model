import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BookMarked,
  BookOpen,
  Calendar,
  Filter,
  GraduationCap,
  PenLine,
  RefreshCw,
  Search,
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

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function classLabel(item) {
  const c = item.classId;
  if (!c) return "—";
  const name = c.name || "Class";
  return c.section ? `${name} · ${c.section}` : name;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherDiaryPage() {
  const [assigned, setAssigned] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [form, setForm] = useState({ date: todayStr(), classId: "", subject: "", notes: "" });

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
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const thisMonth = entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
    const classes = new Set(entries.map((e) => String(e.classId?._id || e.classId))).size;
    const subjects = new Set(entries.map((e) => e.subject).filter(Boolean)).size;
    return { total: entries.length, thisMonth, classes, subjects };
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((item) => {
      if (filterClass && String(item.classId?._id || item.classId) !== filterClass) return false;
      if (!q) return true;
      return (
        String(item.subject || "").toLowerCase().includes(q) ||
        String(item.notes || "").toLowerCase().includes(q) ||
        classLabel(item).toLowerCase().includes(q)
      );
    });
  }, [entries, search, filterClass]);

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
      const data = await teacherService.getDiary();
      setEntries(Array.isArray(data) ? data : []);
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

  const save = async () => {
    if (!form.date || !form.classId || !form.subject.trim() || !form.notes.trim()) {
      toast.error("Date, class, subject, and notes are required");
      return;
    }
    setSubmitting(true);
    try {
      await teacherService.createDiary({
        date: form.date,
        classId: form.classId,
        subject: form.subject.trim(),
        notes: form.notes.trim(),
      });
      toast.success("Diary entry saved");
      setForm({ date: todayStr(), classId: "", subject: "", notes: "" });
      load(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading diary…" />;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Teaching journal</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Diary & class notes</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Record daily lessons, topics covered, and planning notes for your assigned classes.
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
        <GlassStat icon={BookOpen} label="Total entries" value={stats.total} gradient="from-brand-600 to-indigo-700" />
        <GlassStat icon={Calendar} label="This month" value={stats.thisMonth} sub="Current calendar month" gradient="from-violet-600 to-purple-700" />
        <GlassStat icon={GraduationCap} label="Classes" value={stats.classes} sub="With diary notes" gradient="from-sky-600 to-cyan-700" />
        <GlassStat icon={BookMarked} label="Subjects" value={stats.subjects} sub="Unique subjects logged" gradient="from-emerald-600 to-teal-700" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="rounded-[1.35rem] border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <PenLine className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">New diary entry</h2>
              <p className="text-sm text-slate-500">Log what you taught today or plan ahead.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Date *</label>
              <input
                className={inputClass}
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>

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
                    placeholder="e.g. Mathematics"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  />
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes *</label>
              <textarea
                className={`${inputClass} min-h-[140px] resize-y`}
                placeholder="Topics covered, homework given, observations, parent communication…"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <button
              type="button"
              onClick={save}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:from-brand-700 hover:to-indigo-700 disabled:opacity-60 sm:w-auto"
            >
              <PenLine className="h-4 w-4" />
              {submitting ? "Saving…" : "Save entry"}
            </button>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900">Recent entries</h2>
            <p className="mt-0.5 text-sm text-slate-500">{filtered.length} of {entries.length} shown</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  placeholder="Search notes, subject, class…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative min-w-[160px]">
                <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  className={`${inputClass} pl-10`}
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
                className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white p-4 transition hover:border-brand-200/60 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{item.subject}</p>
                      <p className="text-xs text-slate-500">{classLabel(item)}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                    <Calendar className="h-3.5 w-3.5 text-brand-600" />
                    {formatDate(item.date)}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.notes}</p>
              </article>
            ))}
            {!filtered.length && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
                <BookMarked className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-semibold text-slate-700">No diary entries yet</p>
                <p className="mt-1 max-w-xs text-sm text-slate-500">Your saved notes will appear here. Use the form to add your first entry.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
