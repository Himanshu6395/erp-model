import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", parentPhone: "", profileImage: "" });

  const load = async () => {
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      setForm({
        name: data.userId?.name || "",
        phone: data.phone || "",
        address: data.address || "",
        parentPhone: data.parentPhone || "",
        profileImage: data.profileImage || "",
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await studentService.updateProfile(form);
      toast.success("Profile updated");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Student Details" subtitle="View full profile and update limited fields.">
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <span className="font-semibold">Student ID:</span> {profile?._id || "-"}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {profile?.userId?.email || "-"}
          </div>
          <div>
            <span className="font-semibold">Roll Number:</span> {profile?.rollNumber || "-"}
          </div>
          <div>
            <span className="font-semibold">Class:</span> {profile?.classId?.name || "-"}
          </div>
          <div>
            <span className="font-semibold">Section:</span> {profile?.section || "-"}
          </div>
          <div>
            <span className="font-semibold">DOB:</span> {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "-"}
          </div>
          <div>
            <span className="font-semibold">Gender:</span> {profile?.gender || "-"}
          </div>
          <div>
            <span className="font-semibold">Parent Name:</span> {profile?.parentName || "-"}
          </div>
          <div>
            <span className="font-semibold">Parent Email:</span> {profile?.parentEmail || "-"}
          </div>
        </div>
      </FormCard>

      <FormCard title="Update Limited Fields" subtitle="Only selected fields are editable by student.">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <input className="input sm:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          <input className="input" placeholder="Parent Phone" value={form.parentPhone} onChange={(e) => setForm((p) => ({ ...p, parentPhone: e.target.value }))} />
          <input className="input" placeholder="Profile Image URL" value={form.profileImage} onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))} />
        </div>
        <button className="btn-primary mt-3 w-fit" type="button" onClick={save}>
          Save Profile
        </button>
      </FormCard>
    </div>
  );
}

export default StudentProfilePage;
