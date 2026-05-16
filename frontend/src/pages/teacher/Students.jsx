import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import ErpUserAvatar from "../../components/common/ErpUserAvatar";
import Loader from "../../components/Loader";
import { teacherService } from "../../services/teacherService";
import { resolveUploadUrl } from "../../utils/apiOrigin";
import { DataTable, EmptyState, GlassStat, inputClass, labelClass, PageCard, PageHeader } from "./teacherPageUi";

const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50";

function studentName(item) {
  return item.userId?.name || "Student";
}

function studentInitials(item) {
  return studentName(item)
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function classLabel(item) {
  const name = item.classId?.name || "—";
  const section = item.section || item.classId?.section;
  return section ? `${name} · ${section}` : name;
}

function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-slate-900">{value || "—"}</p>
    </div>
  );
}

function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [assigned, setAssigned] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const classOptions = useMemo(() => {
    const map = new Map();
    assigned.forEach((r) => {
      const key = `${r.classId}|${r.section || ""}`;
      if (!map.has(key)) {
        map.set(key, {
          classId: String(r.classId),
          section: String(r.section || ""),
          label: r.label || `${r.className || "Class"} — Sec ${r.section || "—"}`,
        });
      }
    });
    return [...map.values()];
  }, [assigned]);

  const parsedFilter = useMemo(() => {
    if (!classFilter) return { classId: "", section: "" };
    const [classId, section] = classFilter.split("|");
    return { classId: classId || "", section: section || "" };
  }, [classFilter]);

  const fetchData = useCallback(
    async (targetPage = 1, silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const data = await teacherService.getStudents({
          page: targetPage,
          limit: 12,
          search: search.trim(),
          classId: parsedFilter.classId,
          section: parsedFilter.section,
        });
        setStudents(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total ?? 0);
        setPage(data.page || targetPage);
      } catch (error) {
        toast.error(error.message || "Failed to load students");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, parsedFilter.classId, parsedFilter.section]
  );

  useEffect(() => {
    (async () => {
      try {
        const rows = await teacherService.getAssignedClassesWithSubjects();
        setAssigned(Array.isArray(rows) ? rows : []);
      } catch (e) {
        toast.error(e.message);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(1), search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [search, classFilter, fetchData]);

  const openProfile = async (studentId) => {
    setProfileLoading(true);
    setSelected({ _id: studentId, _loading: true });
    try {
      const data = await teacherService.getStudentProfile(studentId);
      setSelected(data);
    } catch (error) {
      toast.error(error.message);
      setSelected(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const avatarUrl = (item) => resolveUploadUrl(item?.profileImage || item?.userId?.avatarUrl);

  if (loading && !students.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader text="Loading students…" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        badge="Roster"
        title="Students"
        subtitle="Read-only access to students in your assigned classes. Search, filter, and view profiles."
        actions={
          <button
            type="button"
            onClick={() => fetchData(page, true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassStat icon={Users} label="Total students" value={total} sub="In your assigned classes" gradient="from-brand-600 to-indigo-700" />
        <GlassStat icon={GraduationCap} label="Classes" value={classOptions.length} sub="Mapped to you" gradient="from-violet-500 to-purple-600" />
        <GlassStat
          icon={User}
          label="This page"
          value={students.length}
          sub={`Page ${page} of ${totalPages}`}
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      <PageCard title="Student directory" subtitle="Filter by class or search by name, roll number, or parent." icon={GraduationCap}>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className={labelClass}>Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputClass} pl-10`}
                placeholder="Name, roll, or parent…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Class & section</label>
            <select className={inputClass} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">All assigned classes</option>
              {classOptions.map((o) => (
                <option key={`${o.classId}|${o.section}`} value={`${o.classId}|${o.section}`}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" className={`${btnSecondary} w-full sm:w-auto`} onClick={() => fetchData(1, true)}>
              Apply now
            </button>
          </div>
        </div>

        {!students.length ? (
          <EmptyState
            icon={GraduationCap}
            title="No students found"
            message={search || classFilter ? "Try clearing filters or another search term." : "No students are assigned to your classes yet."}
          />
        ) : (
          <>
            <DataTable>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Roll</th>
                    <th className="px-4 py-3.5">Class</th>
                    <th className="px-4 py-3.5">Parent</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((item) => (
                    <tr key={item._id} className="border-b border-slate-50 transition hover:bg-brand-50/20">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <ErpUserAvatar
                            src={avatarUrl(item)}
                            name={studentName(item)}
                            email={item.userId?.email}
                            size={40}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{studentName(item)}</p>
                            <p className="truncate text-xs text-slate-500">{item.userId?.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">{item.rollNumber || "—"}</td>
                      <td className="px-4 py-3.5 text-slate-600">{classLabel(item)}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">{item.parentName || "—"}</p>
                        {item.parentPhone ? <p className="text-xs text-slate-500">{item.parentPhone}</p> : null}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openProfile(item._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Showing page {page} of {totalPages} · {total} student{total === 1 ? "" : "s"} total
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={page <= 1 || refreshing}
                  onClick={() => fetchData(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={page >= totalPages || refreshing}
                  onClick={() => fetchData(page + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </PageCard>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.35rem] bg-white shadow-2xl ring-1 ring-slate-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="student-profile-title"
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  {profileLoading || selected._loading ? (
                    <span className="flex h-14 w-14 animate-pulse rounded-full bg-white/30" />
                  ) : (
                    <ErpUserAvatar
                      src={avatarUrl(selected)}
                      name={studentName(selected)}
                      email={selected.userId?.email}
                      size={56}
                      sx={{ borderColor: "rgba(255,255,255,0.5)" }}
                    />
                  )}
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/80">Student profile</p>
                    <h3 id="student-profile-title" className="mt-1 text-xl font-bold">
                      {profileLoading || selected._loading ? "Loading…" : studentName(selected)}
                    </h3>
                    {!profileLoading && !selected._loading ? (
                      <p className="mt-0.5 text-sm text-white/85">{classLabel(selected)} · Roll {selected.rollNumber || "—"}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {profileLoading || selected._loading ? (
              <div className="flex min-h-[200px] items-center justify-center p-8">
                <Loader text="Loading profile…" />
              </div>
            ) : (
              <div className="space-y-6 p-6">
                <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-indigo-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Performance snapshot</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <Calendar className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs text-slate-500">Attendance</p>
                          <p className="text-lg font-bold text-slate-900">{selected.attendanceSummary?.percentage ?? 0}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <Award className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs text-slate-500">Average marks</p>
                          <p className="text-lg font-bold text-slate-900">{selected.performanceSummary?.averageMarks ?? 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                <div>
                  <h4 className="mb-3 text-sm font-bold text-slate-900">Personal details</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProfileField icon={User} label="Gender" value={selected.gender} />
                    <ProfileField
                      icon={Calendar}
                      label="Date of birth"
                      value={selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : "—"}
                    />
                    <ProfileField icon={MapPin} label="Address" value={selected.address} />
                    <ProfileField icon={User} label="Student ID" value={selected._id} />
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-bold text-slate-900">Parent / guardian</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProfileField icon={User} label="Name" value={selected.parentName} />
                    <ProfileField icon={Phone} label="Phone" value={selected.parentPhone} />
                    <ProfileField icon={Mail} label="Email" value={selected.parentEmail} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default TeacherStudentsPage;
