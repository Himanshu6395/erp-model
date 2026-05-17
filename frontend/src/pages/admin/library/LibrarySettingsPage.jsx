import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import Loader from "../../../components/Loader";
import { adminService } from "../../../services/adminService";
import { LibraryPageHero, LibrarySectionCard } from "./libraryShared";

function LibrarySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    maxBooksPerStudent: 3,
    defaultIssueDays: 14,
    finePerDay: 5,
    maxIssueDays: 30,
    requestRequiresApproval: true,
    allowStudentRequests: true,
    allowEbooks: true,
    issueReminderDaysBefore: 2,
  });

  useEffect(() => {
    const run = async () => {
      try {
        setForm(await adminService.getLibrarySettings());
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await adminService.updateLibrarySettings(form);
      setForm(saved);
      toast.success("Library settings updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading library settings..." />;

  return (
    <div className="space-y-6">
      <LibraryPageHero
        badge="Configuration"
        title="Library settings"
        subtitle="Control issue limits, student request flow, overdue fines, and e-book access from one policy page."
      />

      <LibrarySectionCard title="Borrowing policy" subtitle="These settings drive due dates, limits, and fine generation across the library module.">
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          {[
            ["maxBooksPerStudent", "Max books per student"],
            ["defaultIssueDays", "Default issue days"],
            ["maxIssueDays", "Max issue days"],
            ["finePerDay", "Fine per day (Rs)"],
            ["issueReminderDaysBefore", "Due reminder days before"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
              <input className="input w-full rounded-xl py-2.5 shadow-sm" type="number" min="0" name={name} value={form[name]} onChange={onChange} />
            </div>
          ))}
          <div className="space-y-3 md:col-span-2">
            {[
              ["requestRequiresApproval", "Student requests require librarian approval"],
              ["allowStudentRequests", "Allow students to request books from the portal"],
              ["allowEbooks", "Allow e-book links in the student portal"],
            ].map(([name, label]) => (
              <label key={name} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700">
                <input type="checkbox" name={name} checked={Boolean(form[name])} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                {label}
              </label>
            ))}
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-700 hover:to-cyan-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save settings"}
            </button>
          </div>
        </form>
      </LibrarySectionCard>
    </div>
  );
}

export default LibrarySettingsPage;
