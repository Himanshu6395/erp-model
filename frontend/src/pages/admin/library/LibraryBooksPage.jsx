import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BookCopy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Loader from "../../../components/Loader";
import { adminService } from "../../../services/adminService";
import { LibraryEmptyState, LibraryPageHero, LibrarySectionCard, LibraryStatusBadge } from "./libraryShared";

const INITIAL_FORM = {
  title: "",
  isbn: "",
  bookCode: "",
  author: "",
  publisher: "",
  categoryId: "",
  language: "English",
  quantity: 1,
  availableCopies: 1,
  shelfNumber: "",
  rackNumber: "",
  bookImage: "",
  ebookUrl: "",
  description: "",
};

function LibraryBooksPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [bookRes, categoryRes] = await Promise.all([
        adminService.getLibraryBooks({ page: 1, limit: 100, search, categoryId: categoryFilter || undefined }),
        adminService.getLibraryCategories(),
      ]);
      setBooks(bookRes?.data || []);
      setCategories(categoryRes || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, categoryFilter]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title || "",
      isbn: book.isbn || "",
      bookCode: book.bookCode || "",
      author: book.author || "",
      publisher: book.publisher || "",
      categoryId: book.categoryId?._id || "",
      language: book.language || "English",
      quantity: book.quantity || 1,
      availableCopies: book.availableCopies || 0,
      shelfNumber: book.shelfNumber || "",
      rackNumber: book.rackNumber || "",
      bookImage: book.bookImage || "",
      ebookUrl: book.ebookUrl || "",
      description: book.description || "",
    });
  };

  const resetForm = () => {
    setEditingId("");
    setForm(INITIAL_FORM);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminService.updateLibraryBook(editingId, form);
        toast.success("Book updated");
      } else {
        await adminService.createLibraryBook(form);
        toast.success("Book created");
      }
      resetForm();
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (bookId) => {
    try {
      await adminService.deleteLibraryBook(bookId);
      toast.success("Book deleted");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const summary = useMemo(() => ({
    totalTitles: books.length,
    totalCopies: books.reduce((sum, book) => sum + Number(book.quantity || 0), 0),
    availableCopies: books.reduce((sum, book) => sum + Number(book.availableCopies || 0), 0),
  }), [books]);

  if (loading) return <Loader text="Loading library books..." />;

  return (
    <div className="space-y-6">
      <LibraryPageHero
        title="Books & inventory"
        subtitle="Manage catalog titles, shelf locations, availability, e-books, and inventory status from one operational desk."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.55fr]">
        <LibrarySectionCard title={editingId ? "Edit book" : "Add new book"} subtitle="Catalog titles with availability, shelf, and digital resource metadata.">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            {[
              ["title", "Book name"],
              ["isbn", "ISBN number"],
              ["bookCode", "Book code"],
              ["author", "Author"],
              ["publisher", "Publisher"],
              ["language", "Language"],
              ["shelfNumber", "Shelf number"],
              ["rackNumber", "Rack number"],
              ["bookImage", "Book image URL"],
              ["ebookUrl", "PDF / E-book URL"],
            ].map(([name, label]) => (
              <div key={name} className={name === "bookImage" || name === "ebookUrl" ? "md:col-span-2" : ""}>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
                <input className="input w-full rounded-xl py-2.5 shadow-sm" name={name} value={form[name]} onChange={onChange} required={["title", "bookCode"].includes(name)} />
              </div>
            ))}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Category</label>
              <select className="input w-full rounded-xl py-2.5 shadow-sm" name="categoryId" value={form.categoryId} onChange={onChange}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Quantity</label>
                <input className="input w-full rounded-xl py-2.5 shadow-sm" type="number" min="0" name="quantity" value={form.quantity} onChange={onChange} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Available copies</label>
                <input className="input w-full rounded-xl py-2.5 shadow-sm" type="number" min="0" name="availableCopies" value={form.availableCopies} onChange={onChange} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Description</label>
              <textarea className="input min-h-28 w-full rounded-2xl py-3 shadow-sm" name="description" value={form.description} onChange={onChange} />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-700 hover:to-cyan-700 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Update book" : "Add book"}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </LibrarySectionCard>

        <LibrarySectionCard
          title="Catalog inventory"
          subtitle={`Showing ${summary.totalTitles} titles, ${summary.totalCopies} copies, and ${summary.availableCopies} available copies.`}
          actions={
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input rounded-xl py-2.5 pl-9 pr-3 shadow-sm"
                  placeholder="Search title, code, author"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="input rounded-xl py-2.5 shadow-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </>
          }
        >
          {!books.length ? (
            <LibraryEmptyState title="No books found" message="Add your first catalog entry or loosen the current search filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Inventory</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id} className="border-b border-slate-100 hover:bg-slate-50/40">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{book.title}</p>
                        <p className="text-xs text-slate-500">
                          {book.bookCode} • {book.author || "Unknown author"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{book.categoryId?.name || "Uncategorised"}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {book.availableCopies}/{book.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <LibraryStatusBadge status={book.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {book.shelfNumber || "Shelf ?"} / {book.rackNumber || "Rack ?"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => startEdit(book)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => onDelete(book._id)} className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </LibrarySectionCard>
      </div>
    </div>
  );
}

export default LibraryBooksPage;
