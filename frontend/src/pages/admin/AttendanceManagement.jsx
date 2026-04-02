import { useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { adminService } from "../../services/adminService";

function AttendanceManagementPage() {
  const [studentPayload, setStudentPayload] = useState({ studentId: "", date: "", status: "PRESENT" });
  const [teacherPayload, setTeacherPayload] = useState({ teacherId: "", date: "", status: "PRESENT" });
  const [summary, setSummary] = useState(null);

  const markStudent = async () => {
    try {
      await adminService.markStudentAttendance(studentPayload);
      toast.success("Student attendance marked");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const markTeacher = async () => {
    try {
      await adminService.markTeacherAttendance(teacherPayload);
      toast.success("Teacher attendance marked");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadSummary = async () => {
    const now = new Date();
    try {
      const data = await adminService.getMonthlyAttendanceSummary({ month: now.getMonth() + 1, year: now.getFullYear() });
      setSummary(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Attendance Management" subtitle="Daily attendance and monthly summary.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-gray-100 p-4">
            <h4 className="font-semibold text-gray-900">Mark Student Attendance</h4>
            <input className="input" placeholder="Student ID" value={studentPayload.studentId} onChange={(e) => setStudentPayload((p) => ({ ...p, studentId: e.target.value }))} />
            <input className="input" type="date" value={studentPayload.date} onChange={(e) => setStudentPayload((p) => ({ ...p, date: e.target.value }))} />
            <select className="input" value={studentPayload.status} onChange={(e) => setStudentPayload((p) => ({ ...p, status: e.target.value }))}>
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
            <button className="btn-primary w-fit" type="button" onClick={markStudent}>
              Mark Student Attendance
            </button>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-100 p-4">
            <h4 className="font-semibold text-gray-900">Mark Teacher Attendance</h4>
            <input className="input" placeholder="Teacher ID" value={teacherPayload.teacherId} onChange={(e) => setTeacherPayload((p) => ({ ...p, teacherId: e.target.value }))} />
            <input className="input" type="date" value={teacherPayload.date} onChange={(e) => setTeacherPayload((p) => ({ ...p, date: e.target.value }))} />
            <select className="input" value={teacherPayload.status} onChange={(e) => setTeacherPayload((p) => ({ ...p, status: e.target.value }))}>
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
            <button className="btn-primary w-fit" type="button" onClick={markTeacher}>
              Mark Teacher Attendance
            </button>
          </div>
        </div>
      </FormCard>

      <FormCard title="Monthly Attendance Summary" subtitle="Student and teacher attendance totals for current month.">
        <div className="flex items-center gap-3">
          <button className="btn-secondary" type="button" onClick={loadSummary}>
            Load Summary
          </button>
          {summary && (
            <span className="text-sm text-gray-700">
              Student Records: {summary.studentAttendanceRecords} | Teacher Records: {summary.teacherAttendanceRecords}
            </span>
          )}
        </div>
      </FormCard>
    </div>
  );
}

export default AttendanceManagementPage;
