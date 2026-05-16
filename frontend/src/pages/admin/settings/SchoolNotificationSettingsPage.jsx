import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Divider, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { schoolAdminSettingsService } from "../../../services/schoolAdminSettingsService";
import { fetchSchoolAdminSettings } from "../../../store/schoolAdminSettingsSlice";
import { SaveButton, SettingsSectionCard } from "../../superAdmin/settings/settingsShared";

const TOGGLES = [
  { key: "email", label: "Email notifications", desc: "System emails for critical updates" },
  { key: "sms", label: "SMS notifications", desc: "Text alerts when SMS gateway is configured" },
  { key: "inquiryAlerts", label: "Inquiry alerts", desc: "Notify when new inquiries are created" },
  { key: "attendanceAlerts", label: "Attendance alerts", desc: "Daily attendance summary alerts" },
  { key: "feeAlerts", label: "Fee alerts", desc: "Payment and fee reminder notifications" },
];

export default function SchoolNotificationSettingsPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.schoolAdminSettings);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: true,
    sms: false,
    inquiryAlerts: true,
    attendanceAlerts: true,
    feeAlerts: true,
  });

  useEffect(() => {
    if (data?.notifications) setForm((f) => ({ ...f, ...data.notifications }));
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await schoolAdminSettingsService.updateNotifications(form);
      await dispatch(fetchSchoolAdminSettings());
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
      subtitle="Choose which alerts your school should receive."
      actions={<SaveButton loading={saving} onClick={handleSave}>Save Preferences</SaveButton>}
    >
      <Stack spacing={0} divider={<Divider flexItem />}>
        {TOGGLES.map((t) => (
          <FormControlLabel
            key={t.key}
            control={<Switch checked={Boolean(form[t.key])} onChange={(e) => setForm((f) => ({ ...f, [t.key]: e.target.checked }))} />}
            label={
              <Stack>
                <Typography variant="body2" fontWeight={600}>{t.label}</Typography>
                <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
              </Stack>
            }
            sx={{ alignItems: "flex-start", ml: 0, py: 1 }}
          />
        ))}
      </Stack>
    </SettingsSectionCard>
  );
}
