import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, Pencil, Search, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";

const STATUS_BADGE = {
  ACTIVE: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  INACTIVE: "bg-slate-100 text-slate-700 ring-slate-200",
  PASSED: "bg-sky-50 text-sky-900 ring-sky-200/80",
  TRANSFERRED: "bg-amber-50 text-amber-900 ring-amber-200/80",
};

function studentInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Full student directory (search, cards, pagination). Edit opens enrol wizard with student pre-loaded.
 */
export default function StudentDirectoryPanel() {
  const navigate = useNavigate();
  const [listLoading, setListLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const fetchStudents = useCallback(async (targetPage, targetSearch) => {
    setListLoading(true);
    try {
      const data = await adminService.getStudents({ page: targetPage, limit: 10, search: targetSearch });
      setStudents(data.items || []);
      setPagination({ totalPages: data.totalPages || 1 });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(1, "");
  }, [fetchStudents]);

  const goEdit = (item) => {
    navigate("/admin/students/enrol", { state: { editId: item._id } });
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await adminService.deleteStudent(studentId);
      toast.success("Student deleted");
      fetchStudents(page, search);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const downloadIdCard = async (studentId, studentName) => {
    try {
      const blob = await adminService.downloadStudentIdCard(studentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${studentName || "student"}-id-card.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/30">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-brand-950 px-6 py-8 text-white sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300/90">Directory</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">All registered students</h3>
            <p className="mt-2 max-w-lg text-sm text-slate-300">
              Search, open a record in the enrol wizard to edit, download ID cards, or remove entries.
            </p>
          </div>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-2xl border-0 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 ring-1 ring-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    fetchStudents(1, search);
                  }
                }}
              />
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-teal-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-teal-900/20 transition hover:bg-teal-300"
              onClick={() => {
                setPage(1);
                fetchStudents(1, search);
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {listLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : !students.length ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-500">
              <Users className="h-8 w-8" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-800">No students match this view</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Try another search, or use the <strong className="text-slate-700">Enrol new</strong> tab to add students.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {students.map((item) => {
              const name = item.userId?.name || "Student";
              const email = item.userId?.email || "—";
              const code = item.studentCode || "—";
              const st = item.status || "ACTIVE";
              const badge = STATUS_BADGE[st] || STATUS_BADGE.INACTIVE;
              const cls = item.classId?.name ? `${item.classId.name}-${item.section}` : "—";
              return (
                <li
                  key={item._id}
                  className="group flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm transition hover:border-brand-200/60 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    {item.profileImage ? (
                      <img src={item.profileImage} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-slate-100" />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-lg font-bold text-white shadow-md shadow-brand-500/20">
                        {studentInitials(name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate text-base font-bold text-slate-900">{name}</h4>
                        <span
                          className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ring-1 ring-inset ${badge}`}
                        >
                          {st}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-600">{email}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          <span className="font-semibold text-slate-700">Code</span> {code}
                        </span>
                        <span>
                          <span className="font-semibold text-slate-700">Class</span> {cls}
                        </span>
                        <span>
                          <span className="font-semibold text-slate-700">Roll</span> {item.rollNumber ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap sm:border-t-0 sm:pt-0">
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700 sm:w-auto"
                      onClick={() => goEdit(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                      onClick={() => downloadIdCard(item._id, name)}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      ID card
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-rose-700 transition hover:bg-rose-100 sm:w-auto"
                      onClick={() => deleteStudent(item._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!listLoading && students.length > 0 ? (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-800">{page}</span> of{" "}
              <span className="font-semibold text-slate-800">{pagination.totalPages || 1}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                disabled={page <= 1}
                onClick={() => {
                  const n = page - 1;
                  setPage(n);
                  fetchStudents(n, search);
                }}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                disabled={page >= (pagination.totalPages || 1)}
                onClick={() => {
                  const n = page + 1;
                  setPage(n);
                  fetchStudents(n, search);
                }}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
