import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { adminService } from "../../services/adminService";

function CreateStudentPage() {
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [editingId, setEditingId] = useState(null);
  const [csvText, setCsvText] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "OTHER",
    dateOfBirth: "",
    address: "",
    admissionDate: "",
    classId: "",
    section: "",
    rollNumber: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    profileImage: "",
    documents: "",
  });

  const fetchStudents = async (targetPage = page, targetSearch = search) => {
    setListLoading(true);
    try {
      const data = await adminService.getStudents({ page: targetPage, limit: 10, search: targetSearch });
      setStudents(data.items || []);
      setPagination({ totalPages: data.totalPages || 1 });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setListLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await adminService.getClasses();
      setClasses(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchStudents(1, "");
    fetchClasses();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      gender: "OTHER",
      dateOfBirth: "",
      address: "",
      admissionDate: "",
      classId: "",
      section: "",
      rollNumber: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      profileImage: "",
      documents: "",
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        documents: form.documents
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      if (editingId) {
        await adminService.updateStudent(editingId, payload);
        toast.success("Student updated");
      } else {
        if (!form.classId?.trim()) {
          toast.error("Select a class for the student.");
          return;
        }
        await adminService.createStudent(payload);
        toast.success("Student created");
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.userId?.name || "",
      email: item.userId?.email || "",
      password: "",
      phone: item.phone || "",
      gender: item.gender || "OTHER",
      dateOfBirth: item.dateOfBirth ? item.dateOfBirth.slice(0, 10) : "",
      address: item.address || "",
      admissionDate: item.admissionDate ? item.admissionDate.slice(0, 10) : "",
      classId: item.classId?._id || "",
      section: item.section || "",
      rollNumber: item.rollNumber || "",
      parentName: item.parentName || "",
      parentPhone: item.parentPhone || "",
      parentEmail: item.parentEmail || "",
      profileImage: item.profileImage || "",
      documents: (item.documents || []).join(", "),
    });
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await adminService.deleteStudent(studentId);
      toast.success("Student deleted");
      fetchStudents();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const importCSV = async () => {
    if (!csvText.trim()) return toast.error("Paste CSV text first");
    try {
      const result = await adminService.bulkImportStudents(csvText);
      toast.success(`Imported: ${result.created}, skipped: ${result.skipped}`);
      setCsvText("");
      fetchStudents();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const downloadIdCard = async (studentId, studentName) => {
    try {
      const blob = await adminService.downloadStudentIdCard(studentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${studentName || "student"}-id-card.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title={editingId ? "Edit Student" : "Add Student"} subtitle="Full student management with profile data.">
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          <input className="input" name="name" placeholder="Name" value={form.name} onChange={onChange} required />
          <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
          <input className="input" name="password" type="password" placeholder={editingId ? "Password (optional)" : "Password"} value={form.password} onChange={onChange} required={!editingId} />
          <input className="input" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
          <select className="input" name="gender" value={form.gender} onChange={onChange}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <input className="input" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={onChange} />
          <input className="input sm:col-span-2" name="address" placeholder="Address" value={form.address} onChange={onChange} />
          <input className="input" name="admissionDate" type="date" value={form.admissionDate} onChange={onChange} />
          <select className="input" name="classId" value={form.classId} onChange={onChange} required>
            <option value="">Select Class</option>
            {classes.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}-{item.section}
              </option>
            ))}
          </select>
          <input className="input" name="section" placeholder="Section" value={form.section} onChange={onChange} required />
          <input className="input" name="rollNumber" placeholder="Roll Number" value={form.rollNumber} onChange={onChange} required />
          <input className="input" name="parentName" placeholder="Parent Name" value={form.parentName} onChange={onChange} />
          <input className="input" name="parentPhone" placeholder="Parent Phone" value={form.parentPhone} onChange={onChange} />
          <input className="input" name="parentEmail" type="email" placeholder="Parent Email" value={form.parentEmail} onChange={onChange} />
          <input className="input" name="profileImage" placeholder="Profile Image URL" value={form.profileImage} onChange={onChange} />
          <input className="input sm:col-span-2" name="documents" placeholder="Documents URLs (comma-separated)" value={form.documents} onChange={onChange} />
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn-primary w-fit" type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Student" : "Create Student"}
            </button>
            {editingId && (
              <button className="btn-secondary w-fit" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </FormCard>

      <FormCard title="Bulk Import Students (CSV)" subtitle="Paste CSV with headers: name,email,password,classId,section,rollNumber,...">
        <div className="grid gap-3">
          <textarea className="input min-h-32" value={csvText} onChange={(e) => setCsvText(e.target.value)} />
          <button className="btn-secondary w-fit" type="button" onClick={importCSV}>
            Import CSV
          </button>
        </div>
      </FormCard>

      <FormCard title="Students" subtitle="Search, paginate, edit, delete and generate ID card.">
        <div className="mb-3 flex gap-2">
          <input className="input" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setPage(1);
              fetchStudents(1, search);
            }}
          >
            Search
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Class</th>
                <th className="py-2 pr-3">Roll</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!listLoading &&
                students.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2 pr-3">{item.userId?.name}</td>
                    <td className="py-2 pr-3">{item.userId?.email}</td>
                    <td className="py-2 pr-3">
                      {item.classId?.name}-{item.section}
                    </td>
                    <td className="py-2 pr-3">{item.rollNumber}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => startEdit(item)}>
                          Edit
                        </button>
                        <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => deleteStudent(item._id)}>
                          Delete
                        </button>
                        <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => downloadIdCard(item._id, item.userId?.name)}>
                          ID Card
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {listLoading && <div className="py-3 text-sm text-gray-500">Loading students...</div>}
          {!listLoading && !students.length && <div className="py-3 text-sm text-gray-500">No students found.</div>}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            className="btn-secondary"
            type="button"
            disabled={page <= 1}
            onClick={() => {
              const next = page - 1;
              setPage(next);
              fetchStudents(next, search);
            }}
          >
            Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {page} / {pagination.totalPages || 1}
          </span>
          <button
            className="btn-secondary"
            type="button"
            disabled={page >= (pagination.totalPages || 1)}
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchStudents(next, search);
            }}
          >
            Next
          </button>
        </div>
      </FormCard>
    </div>
  );
}

export default CreateStudentPage;
