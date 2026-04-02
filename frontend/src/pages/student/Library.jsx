import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

function StudentLibraryPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setData(await studentService.getLibrary());
      } catch (error) {
        toast.error(error.message);
      }
    };
    run();
  }, []);

  return (
    <div className="space-y-6">
      <FormCard title="Library" subtitle="Issued books, history and fine details.">
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">Issued Books: {data?.issuedBooks?.length || 0}</div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">History Count: {data?.history?.length || 0}</div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">Total Fine: {data?.totalFine || 0}</div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Book Name</th>
                <th className="py-2 pr-3">Issue Date</th>
                <th className="py-2 pr-3">Return Date</th>
                <th className="py-2 pr-3">Fine</th>
              </tr>
            </thead>
            <tbody>
              {(data?.history || []).map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="py-2 pr-3">{item.bookId?.title || "-"}</td>
                  <td className="py-2 pr-3">{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : "-"}</td>
                  <td className="py-2 pr-3">{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : "Not returned"}</td>
                  <td className="py-2 pr-3">{item.fine || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormCard>
    </div>
  );
}

export default StudentLibraryPage;
