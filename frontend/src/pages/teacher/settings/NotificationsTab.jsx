import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Bell, Save } from "lucide-react";
import { teacherService } from "../../../services/teacherService";
import { patchTeacherProfile } from "../../../store/teacherProfileSlice";
import { SettingsCard, SettingsSkeleton, ToggleRow } from "./settingsUi";

export default function NotificationsTab() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    leaveApproval: true,
    leaveAlerts: true,
    announcements: true,
    attendance: true,
    examAlerts: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profile = await teacherService.getProfileSettings();
        setPrefs({ ...prefs, ...profile.notificationPrefs });
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await teacherService.updateNotificationPrefs(prefs);
      setPrefs(updated);
      dispatch(patchTeacherProfile({ notificationPrefs: updated }));
      toast.success("Notification preferences saved");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <SettingsCard title="Channels" subtitle="How you receive alerts" icon={Bell}>
        <div className="space-y-3">
          <ToggleRow label="Email alerts" description="Updates in your inbox" checked={prefs.email} onChange={(email) => setPrefs((p) => ({ ...p, email }))} />
          <ToggleRow label="SMS alerts" description="Text messages for urgent items" checked={prefs.sms} onChange={(sms) => setPrefs((p) => ({ ...p, sms }))} />
        </div>
      </SettingsCard>

      <SettingsCard title="Alert types" subtitle="Choose what matters to you">
        <div className="space-y-3">
          <ToggleRow label="Leave approval alerts" checked={prefs.leaveApproval} onChange={(leaveApproval) => setPrefs((p) => ({ ...p, leaveApproval }))} />
          <ToggleRow label="Student leave alerts" checked={prefs.leaveAlerts} onChange={(leaveAlerts) => setPrefs((p) => ({ ...p, leaveAlerts }))} />
          <ToggleRow label="Announcement alerts" checked={prefs.announcements} onChange={(announcements) => setPrefs((p) => ({ ...p, announcements }))} />
          <ToggleRow label="Attendance alerts" checked={prefs.attendance} onChange={(attendance) => setPrefs((p) => ({ ...p, attendance }))} />
          <ToggleRow label="Exam & marks alerts" checked={prefs.examAlerts} onChange={(examAlerts) => setPrefs((p) => ({ ...p, examAlerts }))} />
        </div>
      </SettingsCard>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving…" : "Save notification settings"}
      </button>
    </div>
  );
}
