import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit3, Mail, Phone, Trash2, UserRound } from "lucide-react";
import { adminService } from "../../services/adminService";

function TeacherDirectoryPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState([]);

  const fetchTeachers = async (searchText = "") => {
    setLoading(true);
    try {
      const data = await adminService.getTeachers({ page: 1, limit: 100, search: searchText });
      setTeachers(data.items || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const removeTeacher = async (teacherId) => {
    if (!window.confirm("Delete this teacher record?")) return;
    try {
      await adminService.deleteTeacher(teacherId);
      toast.success("Teacher deleted");
      fetchTeachers(search);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand-600">Faculty Directory</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Registered teachers</h2>
          <p className="mt-1 text-sm text-slate-500">Search, edit, and manage the teacher records created by the school admin.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
          <input
            className="input"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-secondary shrink-0" type="button" onClick={() => fetchTeachers(search)}>
            Search
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {loading ? <div className="py-8 text-sm text-slate-500">Loading teachers...</div> : null}

        {!loading && !teachers.length ? <div className="py-8 text-sm text-slate-500">No teachers found.</div> : null}

        {!loading &&
          teachers.map((teacher) => {
            const fullName = teacher.userId?.name || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "Teacher";
            const classLabels = (teacher.assignedClasses || [])
              .map((item) => [item?.name, item?.section].filter(Boolean).join(" - "))
              .filter(Boolean)
              .slice(0, 3);

            return (
              <div
                key={teacher._id}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-brand-200 hover:bg-white"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white">
                      {teacher.profileImage ? (
                        <img src={teacher.profileImage} alt={fullName} className="h-full w-full object-cover" />
                      ) : (
                        <UserRound className="h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">{fullName}</h3>
                        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white">
                          {teacher.employeeId || "EMP"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] ${
                            teacher.userId?.status === "INACTIVE"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {teacher.userId?.status || "ACTIVE"}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {teacher.userId?.email || "-"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-slate-400" />
                          {teacher.phone || "-"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {(teacher.subjectNames || []).slice(0, 4).map((subject) => (
                          <span key={subject} className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
                            {subject}
                          </span>
                        ))}
                        {!!classLabels.length &&
                          classLabels.map((label) => (
                            <span key={label} className="rounded-full bg-slate-200 px-2.5 py-1 font-semibold text-slate-700">
                              {label}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700 sm:w-auto"
                      type="button"
                      onClick={() => navigate("/admin/teachers/create", { state: { teacherId: teacher._id } })}
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 sm:w-auto"
                      type="button"
                      onClick={() => removeTeacher(teacher._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

export default TeacherDirectoryPanel;
