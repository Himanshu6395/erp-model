import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BookMarked, Clock3, History, IndianRupee, LibraryBig, Search } from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import { PageHeader, GlassStat, PageCard, DataTable, EmptyState, TabPills, btnPrimary, inputClass } from "./studentPageUi";

const TABS = [
  { id: "catalog", label: "Available Books" },
  { id: "issued", label: "Issued Books" },
  { id: "requests", label: "My Requests" },
  { id: "history", label: "History" },
  { id: "fines", label: "Fine History" },
];

function StudentLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState("");
  const [activeTab, setActiveTab] = useState("catalog");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      setData(await studentService.getLibrary({ search, categoryId: categoryId || undefined }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [search, categoryId]);

  const requestBook = async (bookId) => {
    setRequestingId(bookId);
    try {
      await studentService.requestLibraryBook({ bookId });
      toast.success("Book request submitted");
      load();
      setActiveTab("requests");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRequestingId("");
    }
  };

  const activeIssueBookIds = useMemo(
    () => new Set([...(data?.issuedBooks || []), ...(data?.requests || [])].map((item) => String(item.bookId?._id || item.bookId))),
    [data]
  );

  if (loading && !data) return <Loader text="Loading library records..." />;

  const catalog = data?.catalog || [];
  const issuedBooks = data?.issuedBooks || [];
  const requests = data?.requests || [];
  const history = data?.history || [];
  const fines = data?.fines || [];

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Resources"
        title="Library"
        subtitle="Browse the school library, request books, track due dates, and review fines and borrowing history."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStat icon={BookMarked} label="Available Books" value={catalog.length} gradient="from-brand-600 to-indigo-600" />
        <GlassStat icon={Clock3} label="Currently Issued" value={issuedBooks.length} gradient="from-emerald-600 to-teal-600" />
        <GlassStat icon={History} label="History" value={history.length} gradient="from-violet-600 to-purple-600" />
        <GlassStat icon={IndianRupee} label="Total Fine" value={data?.totalFine || 0} gradient="from-amber-500 to-orange-500" />
      </div>

      <PageCard
        title="Library workspace"
        subtitle="Search books, request titles, monitor due dates, and see your library standing."
        icon={LibraryBig}
      >
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabPills tabs={TABS} active={activeTab} onChange={setActiveTab} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} pl-9`} placeholder="Search title, author, code" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All categories</option>
              {(data?.categories || []).map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeTab === "catalog" ? (
          !catalog.length ? (
            <EmptyState icon={BookMarked} title="No books available" message="Try another search or check back after the library adds more titles." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {catalog.map((book) => {
                const disabled = Number(book.availableCopies || 0) <= 0 || activeIssueBookIds.has(String(book._id));
                return (
                  <div key={book._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{book.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{book.author || "Unknown author"}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-slate-600">
                        {book.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {book.bookCode} • {book.categoryId?.name || "Uncategorised"} • {book.availableCopies}/{book.quantity} available
                    </p>
                    {book.description ? <p className="mt-3 text-sm leading-relaxed text-slate-600">{book.description}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" disabled={disabled || requestingId === book._id} onClick={() => requestBook(book._id)} className={btnPrimary}>
                        {requestingId === book._id ? "Requesting..." : disabled ? "Unavailable" : "Request book"}
                      </button>
                      {book.ebookUrl ? (
                        <a href={book.ebookUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50">
                          Open e-book
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : null}

        {activeTab === "issued" ? (
          !issuedBooks.length ? (
            <EmptyState icon={Clock3} title="No active issues" message="Books currently issued to you will appear here with due dates and return status." />
          ) : (
            <DataTable>
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Issue date</th>
                    <th className="px-4 py-3">Due date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBooks.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.bookSnapshot?.title || item.bookId?.title || "—"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.computedStatus || item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>
          )
        ) : null}

        {activeTab === "requests" ? (
          !requests.length ? (
            <EmptyState icon={History} title="No pending requests" message="Requested books will remain here until they are approved or rejected." />
          ) : (
            <DataTable>
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Requested on</th>
                    <th className="px-4 py-3">Expected due</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.bookSnapshot?.title || item.bookId?.title || "—"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>
          )
        ) : null}

        {activeTab === "history" ? (
          !history.length ? (
            <EmptyState icon={History} title="No library history" message="Your borrowing history will appear here once the first issue cycle starts." />
          ) : (
            <DataTable>
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Issue date</th>
                    <th className="px-4 py-3">Return date</th>
                    <th className="px-4 py-3">Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.bookSnapshot?.title || item.bookId?.title || "—"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : "Not returned"}</td>
                      <td className="px-4 py-3 text-slate-700">Rs {item.fineAmount || item.fine || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>
          )
        ) : null}

        {activeTab === "fines" ? (
          !fines.length ? (
            <EmptyState icon={IndianRupee} title="No fines yet" message="Any overdue charges generated by the library will appear here." />
          ) : (
            <DataTable>
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Overdue days</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map((fine) => (
                    <tr key={fine._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{fine.bookId?.title || "—"}</td>
                      <td className="px-4 py-3 text-slate-700">Rs {fine.amount || 0}</td>
                      <td className="px-4 py-3 text-slate-700">{fine.daysOverdue || 0}</td>
                      <td className="px-4 py-3 text-slate-700">{fine.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>
          )
        ) : null}
      </PageCard>
    </div>
  );
}

export default StudentLibraryPage;
