import { useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherProfilePage() {
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", profileImage: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const updateProfile = async () => {
    try {
      await teacherService.updateProfile(profileForm);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changePassword = async () => {
    try {
      await teacherService.changePassword(passwordForm);
      toast.success("Password changed");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Profile Management" subtitle="Update profile and upload profile image URL.">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Name" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="input" placeholder="Email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} />
          <input className="input" placeholder="Phone" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
          <input className="input" placeholder="Profile Image URL" value={profileForm.profileImage} onChange={(e) => setProfileForm((p) => ({ ...p, profileImage: e.target.value }))} />
        </div>
        <button className="btn-primary mt-3 w-fit" type="button" onClick={updateProfile}>
          Save Profile
        </button>
      </FormCard>

      <FormCard title="Change Password" subtitle="Secure password update with current password verification.">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          <input className="input" type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
        </div>
        <button className="btn-secondary mt-3 w-fit" type="button" onClick={changePassword}>
          Change Password
        </button>
      </FormCard>
    </div>
  );
}

export default TeacherProfilePage;
