import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookMarked, History, IndianRupee } from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import { PageHeader, GlassStat, PageCard, DataTable, EmptyState } from "./studentPageUi";

function StudentLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setData(await studentService.getLibrary());
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <Loader text="Loading library records…" />;

  const history = data?.history || [];

  return (
    <div className="space-y-6">
      <PageHeader badge="Resources" title="Library" subtitle="Issued books, return history, and fine details." />

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStat icon={BookMarked} label="Issued books" value={data?.issuedBooks?.length || 0} gradient="from-brand-600 to-indigo-600" />
        <GlassStat icon={History} label="History count" value={history.length} gradient="from-violet-600 to-purple-600" />
        <GlassStat icon={IndianRupee} label="Total fine" value={data?.totalFine || 0} gradient="from-amber-500 to-orange-500" />
      </div>

      <PageCard title="Borrowing history" subtitle="Books issued and returned." icon={BookMarked}>
        {!history.length ? (
          <EmptyState icon={BookMarked} title="No library history" message="Your book issue records will appear here." />
        ) : (
          <DataTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Book name</th>
                  <th className="px-4 py-3">Issue date</th>
                  <th className="px-4 py-3">Return date</th>
                  <th className="px-4 py-3">Fine</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.bookId?.title || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : "Not returned"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.fine || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </PageCard>
    </div>
  );
}

export default StudentLibraryPage;
