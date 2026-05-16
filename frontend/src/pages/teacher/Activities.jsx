import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Activity,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Globe,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";
import Loader from "../../components/Loader";
import { teacherService } from "../../services/teacherService";
import { EmptyState, GlassStat, PageCard, PageHeader } from "./teacherPageUi";

function formatAction(action) {
  if (!action) return "Activity";
  return String(action)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function actionIcon(action) {
  const a = String(action || "").toUpperCase();
  if (a.includes("ATTENDANCE")) return CalendarCheck;
  if (a.includes("HOMEWORK")) return BookOpen;
  if (a.includes("COMMUNICATION") || a.includes("MESSAGE")) return Send;
  if (a.includes("MARK") || a.includes("EXAM")) return GraduationCap;
  if (a.includes("LEAVE")) return ClipboardList;
  return Activity;
}

function actionAccent(action) {
  const a = String(action || "").toUpperCase();
  if (a.includes("ATTENDANCE")) return "from-emerald-500 to-teal-600";
  if (a.includes("HOMEWORK")) return "from-violet-500 to-purple-600";
  if (a.includes("COMMUNICATION")) return "from-sky-500 to-blue-600";
  if (a.includes("MARK") || a.includes("EXAM")) return "from-amber-500 to-orange-600";
  return "from-slate-500 to-slate-700";
}

function TeacherActivitiesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await teacherService.getActivities();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const byType = {};
    for (const item of items) {
      const key = formatAction(item.action);
      byType[key] = (byType[key] || 0) + 1;
    }
    const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
    return {
      total: items.length,
      uniqueTypes: Object.keys(byType).length,
      topType: topType ? topType[0] : "—",
      topCount: topType ? topType[1] : 0,
    };
  }, [items]);

  if (loading && !items.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader text="Loading activity logs…" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        badge="Audit trail"
        title="Activity logs"
        subtitle="Track attendance, homework, marks, and communication actions with timestamps and IP addresses."
        actions={
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassStat icon={Activity} label="Total events" value={stats.total} sub="Latest 100 records" gradient="from-brand-600 to-indigo-700" />
        <GlassStat icon={ClipboardList} label="Action types" value={stats.uniqueTypes} sub="Distinct categories" gradient="from-violet-500 to-purple-600" />
        <GlassStat
          icon={MessageSquare}
          label="Most frequent"
          value={stats.topCount}
          sub={stats.topType}
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      <PageCard title="Recent activity" subtitle="Newest actions appear first." icon={Activity}>
        {!items.length ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            message="Your actions in the ERP will appear here automatically."
          />
        ) : (
          <ul className="relative space-y-0">
            {items.map((item, index) => {
              const Icon = actionIcon(item.action);
              const accent = actionAccent(item.action);
              const isLast = index === items.length - 1;
              return (
                <li key={item._id} className="relative flex gap-4 pb-8">
                  {!isLast ? (
                    <span className="absolute left-5 top-12 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-slate-200 to-transparent" aria-hidden />
                  ) : null}
                  <span
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-4 ring-white ${accent}`}
                  >
                    <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                  </span>
                  <article className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:border-slate-200 hover:shadow-md">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">{formatAction(item.action)}</p>
                        <p className="mt-0.5 font-mono text-xs text-slate-400">{item.action}</p>
                      </div>
                      <time className="shrink-0 text-xs font-medium text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Globe className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                      IP: <span className="font-mono text-slate-600">{item.ipAddress || "—"}</span>
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </PageCard>
    </div>
  );
}

export default TeacherActivitiesPage;
