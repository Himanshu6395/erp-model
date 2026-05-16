import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Button, Grid, Stack } from "@mui/material";
import { schoolAdminSettingsService } from "../../../services/schoolAdminSettingsService";
import { fetchSchoolAdminSettings } from "../../../store/schoolAdminSettingsSlice";
import { PasswordField, SaveButton, SettingsGridItem, SettingsSectionCard, SettingsTextField } from "../../superAdmin/settings/settingsShared";

export default function SchoolEmailSmtpPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.schoolAdminSettings);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState({ host: "", port: 587, email: "", password: "", senderEmail: "", senderName: "" });

  useEffect(() => {
    if (!data?.smtp) return;
    setForm({
      host: data.smtp.host || "",
      port: data.smtp.port || 587,
      email: data.smtp.email || "",
      password: data.smtp.password || "",
      senderEmail: data.smtp.senderEmail || "",
      senderName: data.smtp.senderName || "",
    });
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await schoolAdminSettingsService.updateSmtp(form);
      await dispatch(fetchSchoolAdminSettings());
      toast.success("SMTP settings saved");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await schoolAdminSettingsService.sendTestEmail();
      toast.success(res.message || "Test email sent");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <SettingsSectionCard
      title="Email / SMTP settings"
      subtitle="Configure outbound email for school notifications."
      actions={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <SaveButton loading={saving} onClick={handleSave}>Save SMTP Settings</SaveButton>
          <Button variant="outlined" disabled={testing} onClick={handleTest}>{testing ? "Sending…" : "Send Test Email"}</Button>
        </Stack>
      }
    >
      <Grid container spacing={3}>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <SettingsTextField label="SMTP host" value={form.host} onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <SettingsTextField label="SMTP port" type="number" value={form.port} onChange={(e) => setForm((f) => ({ ...f, port: Number(e.target.value) }))} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <SettingsTextField label="SMTP email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <PasswordField label="SMTP password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <SettingsTextField label="Sender email" value={form.senderEmail} onChange={(e) => setForm((f) => ({ ...f, senderEmail: e.target.value }))} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <SettingsTextField label="Sender name" value={form.senderName} onChange={(e) => setForm((f) => ({ ...f, senderName: e.target.value }))} />
        </SettingsGridItem>
      </Grid>
    </SettingsSectionCard>
  );
}
