import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { adminService } from "../../services/adminService";

function CreateClassPage() {
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    section: "",
    classTeacherId: "",
  });

  const fetchData = async () => {
    setListLoading(true);
    try {
      const [classData, teacherData] = await Promise.all([adminService.getClasses(), adminService.getTeachers({ page: 1, limit: 200 })]);
      setClasses(classData);
      setTeachers(teacherData.items || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", section: "", classTeacherId: "" });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await adminService.updateClass(editingId, form);
        toast.success("Class updated");
      } else {
        await adminService.createClass(form);
        toast.success("Class created");
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const editClass = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name, section: item.section, classTeacherId: item.classTeacherId?._id || "" });
  };

  const deleteClass = async (classId) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await adminService.deleteClass(classId);
      toast.success("Class deleted");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title={editingId ? "Edit Class & Section" : "Create Class & Section"} subtitle="Create classes and assign class teachers.">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <input className="input" name="name" placeholder="Class Name (e.g., 10)" value={form.name} onChange={onChange} required />
          <input className="input" name="section" placeholder="Section (e.g., A)" value={form.section} onChange={onChange} required />
          <select className="input sm:col-span-2" name="classTeacherId" value={form.classTeacherId} onChange={onChange}>
            <option value="">Assign Class Teacher (optional)</option>
            {teachers.map((item) => (
              <option key={item._id} value={item._id}>
                {item.userId?.name} ({item.subject || "No subject"})
              </option>
            ))}
          </select>
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn-primary w-fit" type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Class" : "Create Class"}
            </button>
            {editingId && (
              <button className="btn-secondary w-fit" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </FormCard>

      <FormCard title="Class & Section List" subtitle="Manage class structure for your school.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Class</th>
                <th className="py-2 pr-3">Section</th>
                <th className="py-2 pr-3">Class Teacher</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!listLoading &&
                classes.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2 pr-3">{item.name}</td>
                    <td className="py-2 pr-3">{item.section}</td>
                    <td className="py-2 pr-3">{item.classTeacherId?.userId?.name || "-"}</td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-2">
                        <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => editClass(item)}>
                          Edit
                        </button>
                        <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => deleteClass(item._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {listLoading && <div className="py-3 text-sm text-gray-500">Loading classes...</div>}
          {!listLoading && !classes.length && <div className="py-3 text-sm text-gray-500">No classes found.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default CreateClassPage;
