import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [section, setSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (targetPage = page) => {
    try {
      const data = await teacherService.getStudents({
        page: targetPage,
        limit: 10,
        search,
        classId,
        section,
      });
      setStudents(data.items || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || targetPage);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const openProfile = async (studentId) => {
    try {
      const data = await teacherService.getStudentProfile(studentId);
      setSelected(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Assigned Students" subtitle="Read-only student access for your classes only.">
        <div className="grid gap-3 sm:grid-cols-4">
          <input className="input" placeholder="Search name/roll/parent" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input className="input" placeholder="Filter classId (optional)" value={classId} onChange={(e) => setClassId(e.target.value)} />
          <input className="input" placeholder="Filter section (optional)" value={section} onChange={(e) => setSection(e.target.value)} />
          <button className="btn-secondary" type="button" onClick={() => fetchData(1)}>
            Apply Filters
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Roll</th>
                <th className="py-2 pr-3">Class</th>
                <th className="py-2 pr-3">Section</th>
                <th className="py-2 pr-3">Parent</th>
                <th className="py-2 pr-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="py-2 pr-3">{item.userId?.name}</td>
                  <td className="py-2 pr-3">{item.rollNumber}</td>
                  <td className="py-2 pr-3">{item.classId?.name}</td>
                  <td className="py-2 pr-3">{item.section}</td>
                  <td className="py-2 pr-3">{item.parentName || "-"}</td>
                  <td className="py-2 pr-3">
                    <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => openProfile(item._id)}>
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {!students.length && (
                <tr>
                  <td colSpan={6} className="py-3 text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button className="btn-secondary" type="button" disabled={page <= 1} onClick={() => fetchData(page - 1)}>
            Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {page} / {totalPages}
          </span>
          <button className="btn-secondary" type="button" disabled={page >= totalPages} onClick={() => fetchData(page + 1)}>
            Next
          </button>
        </div>
      </FormCard>

      {selected && (
        <FormCard title="Student Profile" subtitle="Read-only profile">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="font-semibold">Name:</span> {selected.userId?.name}
            </div>
            <div>
              <span className="font-semibold">Student ID:</span> {selected._id}
            </div>
            <div>
              <span className="font-semibold">Roll Number:</span> {selected.rollNumber}
            </div>
            <div>
              <span className="font-semibold">Class/Section:</span> {selected.classId?.name}-{selected.section}
            </div>
            <div>
              <span className="font-semibold">Gender:</span> {selected.gender}
            </div>
            <div>
              <span className="font-semibold">DOB:</span>{" "}
              {selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : "-"}
            </div>
            <div>
              <span className="font-semibold">Parent:</span> {selected.parentName || "-"}
            </div>
            <div>
              <span className="font-semibold">Parent Phone:</span> {selected.parentPhone || "-"}
            </div>
            <div>
              <span className="font-semibold">Parent Email:</span> {selected.parentEmail || "-"}
            </div>
            <div>
              <span className="font-semibold">Address:</span> {selected.address || "-"}
            </div>
            <div>
              <span className="font-semibold">Attendance %:</span> {selected.attendanceSummary?.percentage || 0}
            </div>
            <div>
              <span className="font-semibold">Average Marks:</span> {selected.performanceSummary?.averageMarks || 0}
            </div>
          </div>
        </FormCard>
      )}
    </div>
  );
}

export default TeacherStudentsPage;
