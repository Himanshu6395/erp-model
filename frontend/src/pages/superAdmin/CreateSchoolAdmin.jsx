import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Sparkles, UserPlus } from "lucide-react";
import { superAdminService } from "../../services/superAdminService";

function CreateSchoolAdminPage() {
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    schoolId: "",
  });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await superAdminService.getSchools({ page: 1, limit: 100 });
        setSchools(response.data || []);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchSchools();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await superAdminService.createSchoolAdmin(form);
      toast.success("School admin created");
      setForm({ name: "", email: "", phone: "", password: "", schoolId: "" });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-900 to-brand-900 px-6 py-8 text-white shadow-xl shadow-indigo-900/20 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" aria-hidden />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <UserPlus className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-100/90">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              Access
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Create school admin</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Attach a <strong className="text-white">SCHOOL_ADMIN</strong> user to an existing tenant. Credentials should be
              delivered over a secure channel.
            </p>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/[0.06] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-violet-500/10 via-white to-cyan-50/30 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2 text-slate-800">
            <Building2 className="h-5 w-5 text-violet-600" aria-hidden />
            <h2 className="text-base font-bold text-slate-900">Account details</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">All fields except phone are typically required by the API.</p>
        </div>
        <form className="grid gap-5 p-6 sm:p-8" onSubmit={onSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full name</label>
            <input className="input w-full rounded-xl py-2.5 shadow-sm" name="name" value={form.name} onChange={onChange} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
            <input
              className="input w-full rounded-xl py-2.5 shadow-sm"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label>
            <input
              className="input w-full rounded-xl py-2.5 shadow-sm"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone (optional)</label>
            <input className="input w-full rounded-xl py-2.5 shadow-sm" name="phone" value={form.phone} onChange={onChange} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">School</label>
            <select className="input w-full rounded-xl py-2.5 shadow-sm" name="schoolId" value={form.schoolId} onChange={onChange} required>
              <option value="">Select school…</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-700 hover:to-brand-700 disabled:opacity-60 sm:w-auto sm:px-8"
            disabled={loading}
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            {loading ? "Creating…" : "Create school admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateSchoolAdminPage;
