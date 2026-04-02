import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { adminService } from "../../services/adminService";

function CreateTeacherPage() {
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    subject: "",
    qualification: "",
    experience: "",
    salary: "",
    joiningDate: "",
    address: "",
    profileImage: "",
  });

  const fetchTeachers = async (searchText = "") => {
    setListLoading(true);
    try {
      const data = await adminService.getTeachers({ page: 1, limit: 100, search: searchText });
      setTeachers(data.items || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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
      subject: "",
      qualification: "",
      experience: "",
      salary: "",
      joiningDate: "",
      address: "",
      profileImage: "",
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await adminService.updateTeacher(editingId, form);
        toast.success("Teacher updated");
      } else {
        await adminService.createTeacher(form);
        toast.success("Teacher created");
      }
      resetForm();
      fetchTeachers(search);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const editTeacher = (teacher) => {
    setEditingId(teacher._id);
    setForm({
      name: teacher.userId?.name || "",
      email: teacher.userId?.email || "",
      password: "",
      phone: teacher.phone || "",
      subject: teacher.subject || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      salary: teacher.salary || "",
      joiningDate: teacher.joiningDate ? teacher.joiningDate.slice(0, 10) : "",
      address: teacher.address || "",
      profileImage: teacher.profileImage || "",
    });
  };

  const removeTeacher = async (teacherId) => {
    if (!window.confirm("Delete this teacher?")) return;
    try {
      await adminService.deleteTeacher(teacherId);
      toast.success("Teacher deleted");
      fetchTeachers(search);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title={editingId ? "Edit Teacher" : "Add Teacher"} subtitle="Teacher management with complete profile fields.">
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          <input className="input" name="name" placeholder="Name" value={form.name} onChange={onChange} required />
          <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
          <input className="input" name="password" type="password" placeholder={editingId ? "Password (optional)" : "Password"} value={form.password} onChange={onChange} required={!editingId} />
          <input className="input" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
          <input className="input" name="subject" placeholder="Subject" value={form.subject} onChange={onChange} />
          <input className="input" name="qualification" placeholder="Qualification" value={form.qualification} onChange={onChange} />
          <input className="input" name="experience" type="number" placeholder="Experience (years)" value={form.experience} onChange={onChange} />
          <input className="input" name="salary" type="number" placeholder="Salary" value={form.salary} onChange={onChange} />
          <input className="input" name="joiningDate" type="date" value={form.joiningDate} onChange={onChange} />
          <input className="input" name="profileImage" placeholder="Profile Image URL" value={form.profileImage} onChange={onChange} />
          <input className="input sm:col-span-2" name="address" placeholder="Address" value={form.address} onChange={onChange} />
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn-primary w-fit" type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Teacher" : "Create Teacher"}
            </button>
            {editingId && (
              <button className="btn-secondary w-fit" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </FormCard>

      <FormCard title="Teachers" subtitle="Search, update and delete teacher records.">
        <div className="mb-3 flex gap-2">
          <input className="input" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn-secondary" type="button" onClick={() => fetchTeachers(search)}>
            Search
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Subject</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!listLoading &&
                teachers.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2 pr-3">{item.userId?.name}</td>
                    <td className="py-2 pr-3">{item.userId?.email}</td>
                    <td className="py-2 pr-3">{item.subject || "-"}</td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-2">
                        <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => editTeacher(item)}>
                          Edit
                        </button>
                        <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => removeTeacher(item._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {listLoading && <div className="py-3 text-sm text-gray-500">Loading teachers...</div>}
          {!listLoading && !teachers.length && <div className="py-3 text-sm text-gray-500">No teachers found.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default CreateTeacherPage;
