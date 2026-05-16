import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Activity, LogOut, ShieldAlert, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { teacherService } from "../../../services/teacherService";
import { SettingsCard, SettingsSkeleton, ToggleRow } from "./settingsUi";

export default function AccountSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [privacy, setPrivacy] = useState({ showEmail: false, showPhone: false });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const data = await teacherService.getActivities();
        setLogs(Array.isArray(data) ? data.slice(0, 15) : []);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <SettingsCard title="Privacy" subtitle="Control visibility of your contact details" icon={ShieldAlert}>
        <div className="space-y-3">
          <ToggleRow label="Show email on profile" checked={privacy.showEmail} onChange={(showEmail) => setPrivacy((p) => ({ ...p, showEmail }))} />
          <ToggleRow label="Show phone on profile" checked={privacy.showPhone} onChange={(showPhone) => setPrivacy((p) => ({ ...p, showPhone }))} />
        </div>
        <p className="mt-3 text-xs text-slate-500">Privacy toggles are stored locally until admin profile sharing is enabled.</p>
      </SettingsCard>

      <SettingsCard title="Account actions" subtitle="Security and session controls">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => toast("Contact your school administrator to sign out all devices.", { icon: "ℹ️" })}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout all devices
          </button>
          <button
            type="button"
            onClick={() => toast.error("Account deletion must be requested through your school admin.")}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="Activity log" subtitle="Recent actions on your teacher account" icon={Activity}>
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {logs.length ? (
            logs.map((log, i) => (
              <li key={log._id || i} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-900">{log.action || "Activity"}</p>
                <p className="text-xs text-slate-500">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                  {log.ipAddress ? ` · ${log.ipAddress}` : ""}
                </p>
              </li>
            ))
          ) : (
            <li className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">No activity recorded yet.</li>
          )}
        </ul>
      </SettingsCard>
    </div>
  );
}
