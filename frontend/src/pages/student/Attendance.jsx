import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";

function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await studentService.getAttendance();
        setData(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading attendance..." />;

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
        <p className="mt-1 text-sm text-gray-600">
          Total: {data?.summary?.totalDays || 0} | Present: {data?.summary?.presentDays || 0} | Percentage:{" "}
          {data?.summary?.percentage || 0}%
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Subject</th>
              <th className="py-2 pr-4">Marked By</th>
            </tr>
          </thead>
          <tbody>
            {(data?.attendance || []).map((item) => (
              <tr key={item._id} className="border-b last:border-0">
                <td className="py-2 pr-4">{new Date(item.date).toLocaleDateString()}</td>
                <td className={`py-2 pr-4 font-medium ${item.status === "PRESENT" ? "text-green-600" : "text-red-600"}`}>
                  {item.status}
                </td>
                <td className="py-2 pr-4">{item.subject || "-"}</td>
                <td className="py-2 pr-4">{item.markedBy?.userId?.name || "-"}</td>
              </tr>
            ))}
            {!data?.attendance?.length && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No attendance records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentAttendancePage;
