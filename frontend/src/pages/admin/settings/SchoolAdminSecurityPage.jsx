import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Alert, Button, Grid, Stack, Typography } from "@mui/material";
import { schoolAdminSettingsService } from "../../../services/schoolAdminSettingsService";
import {
  PasswordField,
  PasswordStrengthBar,
  SaveButton,
  SettingsGridItem,
  SettingsSectionCard,
} from "../../superAdmin/settings/settingsShared";

export default function SchoolAdminSecurityPage() {
  const { data } = useSelector((s) => s.schoolAdminSettings);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const meta = data?.securityMeta;

  const validate = () => {
    const next = {};
    if (!form.currentPassword) next.currentPassword = "Required";
    if (!form.newPassword) next.newPassword = "Required";
    else if (form.newPassword.length < 8) next.newPassword = "At least 8 characters";
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await schoolAdminSettingsService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoggingOut(true);
    try {
      await schoolAdminSettingsService.logoutAllDevices();
      toast.success("Logout signal sent for all devices");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Stack spacing={3}>
      <SettingsSectionCard title="Session info" subtitle="Recent authentication activity.">
        <Grid container spacing={3}>
          <SettingsGridItem xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary">Last login</Typography>
            <Typography variant="body2" fontWeight={600}>
              {meta?.lastLoginAt ? new Date(meta.lastLoginAt).toLocaleString() : "—"}
            </Typography>
          </SettingsGridItem>
        </Grid>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Change password"
        subtitle="Use a strong password with mixed characters."
        actions={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <SaveButton loading={saving} onClick={handleChangePassword}>Change Password</SaveButton>
            <Button variant="outlined" color="warning" disabled={loggingOut} onClick={handleLogoutAll}>
              {loggingOut ? "Processing…" : "Logout From All Devices"}
            </Button>
          </Stack>
        }
      >
        <Alert severity="info" sx={{ mb: 1 }}>Password must be at least 8 characters.</Alert>
        <Grid container spacing={3}>
          <SettingsGridItem xs={12} md={4}>
            <PasswordField label="Current password" value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} error={errors.currentPassword} helperText={errors.currentPassword} />
          </SettingsGridItem>
          <SettingsGridItem xs={12} sm={6} md={4}>
            <PasswordField label="New password" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} error={errors.newPassword} helperText={errors.newPassword} />
            <PasswordStrengthBar password={form.newPassword} />
          </SettingsGridItem>
          <SettingsGridItem xs={12} sm={6} md={4}>
            <PasswordField label="Confirm password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} error={errors.confirmPassword} helperText={errors.confirmPassword} />
          </SettingsGridItem>
        </Grid>
      </SettingsSectionCard>
    </Stack>
  );
}
