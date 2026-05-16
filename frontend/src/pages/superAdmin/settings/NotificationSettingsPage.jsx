import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Divider, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { superAdminSettingsService } from "../../../services/superAdminSettingsService";
import { fetchSuperAdminSettings } from "../../../store/superAdminSettingsSlice";
import { SaveButton, SettingsSectionCard } from "./settingsShared";

const TOGGLES = [
  { key: "email", label: "Email notifications", desc: "System emails for critical updates" },
  { key: "sms", label: "SMS notifications", desc: "Text alerts when SMS gateway is configured" },
  { key: "inquiryAlerts", label: "Inquiry alerts", desc: "Notify when new inquiries are created" },
  { key: "securityAlerts", label: "Security alerts", desc: "Failed logins and security events" },
  { key: "paymentAlerts", label: "Payment alerts", desc: "Subscription and payment activity" },
];

export default function NotificationSettingsPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.superAdminSettings);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: true,
    sms: false,
    inquiryAlerts: true,
    securityAlerts: true,
    paymentAlerts: true,
  });

  useEffect(() => {
    if (!data?.notifications) return;
    setForm({ ...form, ...data.notifications });
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await superAdminSettingsService.updateNotifications(form);
      await dispatch(fetchSuperAdminSettings());
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSectionCard
      title="Notification settings"
      subtitle="Choose which alerts the platform should send."
      actions={<SaveButton loading={saving} onClick={handleSave}>Save Preferences</SaveButton>}
    >
      <Stack spacing={0} divider={<Divider flexItem />}>
        {TOGGLES.map((t) => (
          <FormControlLabel
            key={t.key}
            control={
              <Switch
                checked={Boolean(form[t.key])}
                onChange={(e) => setForm((f) => ({ ...f, [t.key]: e.target.checked }))}
              />
            }
            label={
              <Stack>
                <Typography variant="body2" fontWeight={600}>
                  {t.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.desc}
                </Typography>
              </Stack>
            }
            sx={{ alignItems: "flex-start", ml: 0, py: 1 }}
          />
        ))}
      </Stack>
    </SettingsSectionCard>
  );
}
