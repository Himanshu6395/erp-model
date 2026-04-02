import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { superAdminService } from "../../services/superAdminService";

function CreateSchoolAdminPage() {
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    schoolId: "",
  });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await superAdminService.getSchools({ page: 1, limit: 100 });
        setSchools(response.data || []);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchSchools();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await superAdminService.createSchoolAdmin(form);
      toast.success("School admin created");
      setForm({ name: "", email: "", phone: "", password: "", schoolId: "" });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl">
      <h2 className="mb-1 text-2xl font-bold text-gray-900">Create School Admin</h2>
      <p className="mb-6 text-sm text-gray-500">Assign SCHOOL_ADMIN user to a school.</p>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input className="input" name="name" value={form.name} onChange={onChange} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input className="input" name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input className="input" name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input className="input" name="phone" value={form.phone} onChange={onChange} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">School</label>
          <select className="input" name="schoolId" value={form.schoolId} onChange={onChange} required>
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school._id} value={school._id}>
                {school.name} ({school.code})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary w-fit" disabled={loading}>
          {loading ? "Creating..." : "Create School Admin"}
        </button>
      </form>
    </div>
  );
}

export default CreateSchoolAdminPage;
