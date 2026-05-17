import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookUp2, Plus, UserRound } from "lucide-react";
import Loader from "../../../components/Loader";
import { adminService } from "../../../services/adminService";
import { LibraryEmptyState, LibraryPageHero, LibrarySectionCard, LibraryStatusBadge, formatLibraryDate } from "./libraryShared";

const INITIAL_FORM = {
  studentId: "",
  bookId: "",
  issueDate: "",
  dueDate: "",
  notes: "",
};

function LibraryIssuedBooksPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const [issueRes, studentRes, bookRes] = await Promise.all([
        adminService.getLibraryIssues({ page: 1, limit: 100 }),
        adminService.getLibraryStudents(),
        adminService.getLibraryBooks({ page: 1, limit: 100 }),
      ]);
      setIssues((issueRes?.data || []).filter((item) => ["ISSUED", "OVERDUE", "RETURNED"].includes(item.computedStatus || item.status)));
      setStudents(studentRes || []);
      setBooks(bookRes?.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedStudent = students.find((student) => student._id === form.studentId);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminService.issueLibraryBook(form);
      toast.success("Book issued successfully");
      setForm(INITIAL_FORM);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading issued books..." />;

  return (
    <div className="space-y-6">
      <LibraryPageHero
        badge="Issue control"
        title="Issue books to students"
        subtitle="Assign books to students with class-aware context, due dates, and full borrowing visibility."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        <LibrarySectionCard title="Issue a book" subtitle="Pick a student, choose a title, and set the due date.">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Student</label>
              <select className="input w-full rounded-xl py-2.5 shadow-sm" name="studentId" value={form.studentId} onChange={onChange} required>
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} • {student.rollNumber} • {student.className}-{student.section}
                  </option>
                ))}
              </select>
            </div>
            {selectedStudent ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedStudent.name}</p>
                    <p className="text-xs text-slate-500">
                      Roll {selectedStudent.rollNumber} • {selectedStudent.className} / {selectedStudent.section}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Book</label>
              <select className="input w-full rounded-xl py-2.5 shadow-sm" name="bookId" value={form.bookId} onChange={onChange} required>
                <option value="">Select book</option>
                {books
                  .filter((book) => Number(book.availableCopies || 0) > 0)
                  .map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title} • {book.bookCode} • {book.availableCopies}/{book.quantity}
                    </option>
                  ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Issue date</label>
                <input className="input w-full rounded-xl py-2.5 shadow-sm" type="date" name="issueDate" value={form.issueDate} onChange={onChange} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Due date</label>
                <input className="input w-full rounded-xl py-2.5 shadow-sm" type="date" name="dueDate" value={form.dueDate} onChange={onChange} required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Notes</label>
              <textarea className="input min-h-24 w-full rounded-2xl py-3 shadow-sm" name="notes" value={form.notes} onChange={onChange} />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-700 hover:to-cyan-700 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Issuing..." : "Issue book"}
            </button>
          </form>
        </LibrarySectionCard>

        <LibrarySectionCard title="Issued book register" subtitle="Monitor who has what, when it was issued, and the current return status.">
          {!issues.length ? (
            <LibraryEmptyState title="No issued books yet" message="Start by issuing a title from the issue panel." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Issue date</th>
                    <th className="px-4 py-3">Due date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue._id} className="border-b border-slate-100 hover:bg-slate-50/40">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{issue.studentSnapshot?.name || issue.studentId?.userId?.name}</p>
                        <p className="text-xs text-slate-500">
                          {issue.studentSnapshot?.className || issue.studentId?.classId?.name} • {issue.studentSnapshot?.section || issue.studentId?.section}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{issue.bookSnapshot?.title || issue.bookId?.title}</p>
                        <p className="text-xs text-slate-500">{issue.bookSnapshot?.bookCode || issue.bookId?.bookCode}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatLibraryDate(issue.issueDate)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatLibraryDate(issue.dueDate)}</td>
                      <td className="px-4 py-3">
                        <LibraryStatusBadge status={issue.computedStatus || issue.status} />
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

export default LibraryIssuedBooksPage;
