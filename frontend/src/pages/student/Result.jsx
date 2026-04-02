import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";

function StudentResultPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await studentService.getResult();
        setData(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading result..." />;

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900">Result Summary</h2>
        <p className="mt-1 text-sm text-gray-600">
          Total Marks: {data?.totalMarks || 0} | Percentage: {data?.percentage || 0}%
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="py-2 pr-4">Subject</th>
              <th className="py-2 pr-4">Marks</th>
              <th className="py-2 pr-4">Grade</th>
              <th className="py-2 pr-4">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {(data?.subjects || []).map((item) => (
              <tr key={item._id} className="border-b last:border-0">
                <td className="py-2 pr-4">{item.subject}</td>
                <td className="py-2 pr-4">
                  {item.marks}/{item.totalMarks || 100}
                </td>
                <td className="py-2 pr-4">{item.grade || "-"}</td>
                <td className="py-2 pr-4">{item.percentage || 0}%</td>
              </tr>
            ))}
            {!data?.subjects?.length && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentResultPage;
