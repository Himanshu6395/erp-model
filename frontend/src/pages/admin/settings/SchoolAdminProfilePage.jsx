import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Box, Grid } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { schoolAdminSettingsService } from "../../../services/schoolAdminSettingsService";
import { fetchSchoolAdminSettings } from "../../../store/schoolAdminSettingsSlice";
import { setSchoolAdminAvatar, setSchoolAdminProfile } from "../../../store/schoolAdminProfileSlice";
import { useAuth } from "../../../context/useAuth";
import ProfilePhotoCard from "../../superAdmin/settings/ProfilePhotoCard";
import { SaveButton, SettingsGridItem, SettingsSectionCard, SettingsTextField } from "../../superAdmin/settings/settingsShared";

export default function SchoolAdminProfilePage() {
  const dispatch = useDispatch();
  const { updateUser } = useAuth();
  const { data } = useSelector((s) => s.schoolAdminSettings);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", designation: "", avatarUrl: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.user?.name || "",
      email: data.user?.email || "",
      phone: data.user?.phone || "",
      designation: data.profile?.designation || "",
      avatarUrl: data.profile?.avatarUrl || "",
    });
  }, [data]);

  const handleAvatarChange = (url) => {
    setForm((f) => ({ ...f, avatarUrl: url }));
    dispatch(setSchoolAdminAvatar(url));
    updateUser?.({ avatarUrl: url, name: form.name || data?.user?.name });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await schoolAdminSettingsService.updateProfile(form);
      await dispatch(fetchSchoolAdminSettings());
      dispatch(
        setSchoolAdminProfile({
          avatarUrl: form.avatarUrl,
          name: form.name,
          designation: form.designation,
          email: form.email,
        })
      );
      updateUser?.({ name: form.name, email: form.email, avatarUrl: form.avatarUrl });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSectionCard
      title="Profile"
      subtitle="Manage your school admin account and photo."
      actions={
        <SaveButton
          loading={saving}
          onClick={handleSubmit}
          startIcon={!saving ? <SaveOutlinedIcon /> : undefined}
          sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 200 } }}
        >
          Update Profile
        </SaveButton>
      }
    >
      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <ProfilePhotoCard name={form.name} email={form.email} avatarUrl={form.avatarUrl} onChange={handleAvatarChange} />
        </Grid>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, border: "1px solid", borderColor: "divider", bgcolor: "grey.50", height: "100%" }}>
            <Grid container spacing={3}>
              <SettingsGridItem xs={12} sm={6} md={4}>
                <SettingsTextField label="School admin name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={Boolean(errors.name)} helperText={errors.name} required />
              </SettingsGridItem>
              <SettingsGridItem xs={12} sm={6} md={4}>
                <SettingsTextField label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={Boolean(errors.email)} helperText={errors.email} required />
              </SettingsGridItem>
              <SettingsGridItem xs={12} sm={6} md={4}>
                <SettingsTextField label="Mobile number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </SettingsGridItem>
              <SettingsGridItem xs={12} sm={6} md={4}>
                <SettingsTextField label="Designation" value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} />
              </SettingsGridItem>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </SettingsSectionCard>
  );
}
