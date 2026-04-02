import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { adminService } from "../../services/adminService";

function SubjectManagementPage() {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    classId: "",
    name: "",
    teacherId: "",
  });

  const fetchData = async () => {
    try {
      const [subjectData, classData, teacherData] = await Promise.all([
        adminService.getSubjects(),
        adminService.getClasses(),
        adminService.getTeachers({ page: 1, limit: 200 }),
      ]);
      setSubjects(subjectData);
      setClasses(classData);
      setTeachers(teacherData.items || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await adminService.updateSubject(editingId, form);
        toast.success("Subject updated");
      } else {
        if (!form.classId?.trim()) {
          toast.error("Select a class for this subject.");
          return;
        }
        await adminService.createSubject(form);
        toast.success("Subject created");
      }
      setEditingId(null);
      setForm({ classId: "", name: "", teacherId: "" });
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const editSubject = (item) => {
    setEditingId(item._id);
    setForm({
      classId: item.classId?._id || "",
      name: item.name || "",
      teacherId: item.teacherId?._id || "",
    });
  };

  const removeSubject = async (subjectId) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await adminService.deleteSubject(subjectId);
      toast.success("Subject deleted");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title={editingId ? "Edit Subject" : "Add Subject"} subtitle="Assign subjects to classes and teachers.">
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          <select className="input" name="classId" value={form.classId} onChange={onChange} required>
            <option value="">Select Class</option>
            {classes.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}-{item.section}
              </option>
            ))}
          </select>
          <input className="input" name="name" placeholder="Subject Name" value={form.name} onChange={onChange} required />
          <select className="input sm:col-span-2" name="teacherId" value={form.teacherId} onChange={onChange}>
            <option value="">Assign Teacher (optional)</option>
            {teachers.map((item) => (
              <option key={item._id} value={item._id}>
                {item.userId?.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn-primary w-fit" type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Subject" : "Add Subject"}
            </button>
            {editingId && (
              <button
                className="btn-secondary w-fit"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ classId: "", name: "", teacherId: "" });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </FormCard>

      <FormCard title="Subjects List" subtitle="Subject mapping per class.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Subject</th>
                <th className="py-2 pr-3">Class</th>
                <th className="py-2 pr-3">Teacher</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="py-2 pr-3">{item.name}</td>
                  <td className="py-2 pr-3">
                    {item.classId?.name}-{item.classId?.section}
                  </td>
                  <td className="py-2 pr-3">{item.teacherId?.subject || "-"}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => editSubject(item)}>
                        Edit
                      </button>
                      <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => removeSubject(item._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!subjects.length && (
                <tr>
                  <td className="py-3 text-sm text-gray-500" colSpan={4}>
                    No subjects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FormCard>
    </div>
  );
}

export default SubjectManagementPage;
