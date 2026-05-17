import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BarChart3, Download } from "lucide-react";
import Loader from "../../../components/Loader";
import { adminService } from "../../../services/adminService";
import { LibraryEmptyState, LibraryPageHero, LibrarySectionCard, downloadCsv } from "./libraryShared";

function LibraryReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setReports(await adminService.getLibraryReports());
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <Loader text="Loading library reports..." />;

  const exportInventory = () =>
    downloadCsv(
      "library-inventory.csv",
      (reports?.inventoryReport || []).map((book) => ({
        title: book.title,
        bookCode: book.bookCode,
        category: book.categoryId?.name || "Uncategorised",
        quantity: book.quantity,
        availableCopies: book.availableCopies,
        status: book.status,
      }))
    );

  const exportOverdue = () =>
    downloadCsv(
      "library-overdue-report.csv",
      (reports?.overdueReport || []).map((issue) => ({
        student: issue.studentSnapshot?.name,
        rollNumber: issue.studentSnapshot?.rollNumber,
        className: issue.studentSnapshot?.className,
        section: issue.studentSnapshot?.section,
        book: issue.bookSnapshot?.title,
        dueDate: issue.dueDate,
        overdueDays: issue.overdueDays,
      }))
    );

  const exportFine = () =>
    downloadCsv(
      "library-fine-report.csv",
      (reports?.fineReport || []).map((fine) => ({
        student: fine.studentId?.userId?.name,
        book: fine.bookId?.title,
        amount: fine.amount,
        daysOverdue: fine.daysOverdue,
        status: fine.status,
        createdAt: fine.createdAt,
      }))
    );

  return (
    <div className="space-y-6">
      <LibraryPageHero
        badge="Reporting center"
        title="Library reports & exports"
        subtitle="Generate operational reports for inventory, overdue books, fines, and borrower trends with export-ready output."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <LibrarySectionCard
          title="Inventory report"
          subtitle="Export title-wise inventory, copies, and stock health."
          actions={
            <button type="button" onClick={exportInventory} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Download className="h-4 w-4" />
              CSV
            </button>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Includes title, category, total quantity, available copies, and live stock status for each registered book.
          </p>
        </LibrarySectionCard>

        <LibrarySectionCard
          title="Overdue report"
          subtitle="Export active overdue issues for collection follow-up."
          actions={
            <button type="button" onClick={exportOverdue} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Download className="h-4 w-4" />
              CSV
            </button>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Lists overdue students, books, due dates, and the number of delayed days currently requiring action.
          </p>
        </LibrarySectionCard>

        <LibrarySectionCard
          title="Fine report"
          subtitle="Export collected, pending, and waived fine records."
          actions={
            <button type="button" onClick={exportFine} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Download className="h-4 w-4" />
              CSV
            </button>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Contains student fines, overdue days, recovery status, and timestamps for audit and settlement review.
          </p>
        </LibrarySectionCard>
      </div>

      <LibrarySectionCard title="Borrowing insights" subtitle="Quick readout of the current analytics delivered by the backend report service.">
        {!reports?.charts?.mostBorrowedBooks?.length ? (
          <LibraryEmptyState title="No report activity yet" message="Once students start borrowing, your most-borrowed and category analytics will appear here." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reports.charts.mostBorrowedBooks.map((book) => (
              <div key={book._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-600 text-white shadow-lg">
                    <BarChart3 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{book.title}</p>
                    <p className="text-xs text-slate-500">{book.bookCode || "No code"}</p>
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-950">{book.borrowCount}</p>
                <p className="text-sm text-slate-500">Total issue count</p>
              </div>
            ))}
          </div>
        )}
      </LibrarySectionCard>
    </div>
  );
}

export default LibraryReportsPage;
