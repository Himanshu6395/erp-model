import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import Loader from "../../../components/Loader";
import { adminService } from "../../../services/adminService";
import { LibraryEmptyState, LibraryPageHero, LibrarySectionCard } from "./libraryShared";

const INITIAL_FORM = { name: "", description: "", color: "#2563eb" };

function LibraryCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await adminService.getLibraryCategories());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminService.updateLibraryCategory(editingId, form);
        toast.success("Category updated");
      } else {
        await adminService.createLibraryCategory(form);
        toast.success("Category created");
      }
      setEditingId("");
      setForm(INITIAL_FORM);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    setForm({ name: row.name || "", description: row.description || "", color: row.color || "#2563eb" });
  };

  const onDelete = async (categoryId) => {
    try {
      await adminService.deleteLibraryCategory(categoryId);
      toast.success("Category deleted");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader text="Loading categories..." />;

  return (
    <div className="space-y-6">
      <LibraryPageHero
        badge="Library taxonomy"
        title="Categories & shelving groups"
        subtitle="Organise titles into clear sections like Science, Mathematics, History, Computer, and Literature."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <LibrarySectionCard title={editingId ? "Edit category" : "Create category"} subtitle="Manage catalog groups and visual color tags.">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Category name</label>
              <input className="input w-full rounded-xl py-2.5 shadow-sm" name="name" value={form.name} onChange={onChange} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Description</label>
              <textarea className="input min-h-28 w-full rounded-2xl py-3 shadow-sm" name="description" value={form.description} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Color</label>
              <input className="h-12 w-24 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm" type="color" name="color" value={form.color} onChange={onChange} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-700 hover:to-cyan-700 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Update category" : "Create category"}
              </button>
              {editingId ? (
                <button type="button" onClick={() => { setEditingId(""); setForm(INITIAL_FORM); }} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </LibrarySectionCard>

        <LibrarySectionCard title="All categories" subtitle="Book counts update dynamically based on your current catalog.">
          {!rows.length ? (
            <LibraryEmptyState title="No categories yet" message="Create your first library category to classify books cleanly." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rows.map((row) => (
                <div key={row._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: row.color || "#2563eb" }}>
                        <Tags className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{row.description || "No description added"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-950">{row.booksCount || 0}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Books</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Copies</p>
                      <p className="font-semibold text-slate-900">{row.quantity || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(row)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => onDelete(row._id)} className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </LibrarySectionCard>
      </div>
    </div>
  );
}

export default LibraryCategoriesPage;
