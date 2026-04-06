import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit3, LayoutGrid, Trash2, UserRound } from "lucide-react";
import { adminService } from "../../services/adminService";

function ClassDirectoryPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await adminService.getClasses();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((item) => {
      const label = `${item.name || ""} ${item.section || ""} ${item.classTeacherId?.userId?.name || ""}`.toLowerCase();
      return label.includes(q);
    });
  }, [classes, search]);

  const deleteClass = async (classId) => {
    if (!window.confirm("Delete this class and section?")) return;
    try {
      await adminService.deleteClass(classId);
      toast.success("Class deleted");
      fetchClasses();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand-600">Academic Structure</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Registered classes and sections</h2>
          <p className="mt-1 text-sm text-slate-500">Review and edit each class, section, and assigned class teacher from one clean panel.</p>
        </div>
        <div className="w-full sm:max-w-sm">
          <input
            className="input"
            placeholder="Search class, section, or teacher"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <div className="py-8 text-sm text-slate-500">Loading classes...</div> : null}
        {!loading && !filteredClasses.length ? <div className="py-8 text-sm text-slate-500">No classes found.</div> : null}

        {!loading &&
          filteredClasses.map((item) => (
            <article
              key={item._id}
              className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm transition hover:border-brand-200 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <LayoutGrid className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-950">
                      Class {item.name}
                    </h3>
                    <p className="mt-1 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                      Section {item.section}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Class teacher</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  <span>{item.classTeacherId?.userId?.name || "Not assigned"}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                  onClick={() => navigate("/admin/classes/create", { state: { classId: item._id } })}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  onClick={() => deleteClass(item._id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}

export default ClassDirectoryPanel;
