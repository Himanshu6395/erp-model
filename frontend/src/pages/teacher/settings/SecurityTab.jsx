import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Monitor, Shield } from "lucide-react";
import { teacherService } from "../../../services/teacherService";
import { SettingsCard, SettingsSkeleton, inputClass, labelClass } from "./settingsUi";

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "Enter a password", color: "bg-slate-200" };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];
  const idx = Math.max(0, Math.min(score - 1, 3));
  return { score, label: labels[idx] || "Weak", color: colors[idx] || colors[0], width: `${(score / 4) * 100}%` };
}

function PasswordField({ label, value, onChange, show, onToggle }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          className={`${inputClass} pr-11`}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function SecurityTab() {
  const [loading, setLoading] = useState(true);
  const [security, setSecurity] = useState(null);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const strength = passwordStrength(form.newPassword);

  useEffect(() => {
    (async () => {
      try {
        setSecurity(await teacherService.getSecurityInfo());
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submit = async () => {
    if (!form.currentPassword || !form.newPassword) {
      toast.error("Fill all password fields");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await teacherService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Password updated");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <SettingsCard title="Change password" subtitle="Use a strong unique password" icon={Lock}>
        <div className="grid max-w-lg gap-4">
          <PasswordField
            label="Current password"
            value={form.currentPassword}
            onChange={(v) => setForm((p) => ({ ...p, currentPassword: v }))}
            show={show.current}
            onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
          />
          <PasswordField
            label="New password"
            value={form.newPassword}
            onChange={(v) => setForm((p) => ({ ...p, newPassword: v }))}
            show={show.next}
            onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
          />
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold text-slate-600">Strength</span>
              <span className="font-bold text-slate-800">{strength.label}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
            </div>
          </div>
          <PasswordField
            label="Confirm new password"
            value={form.confirmPassword}
            onChange={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
            show={show.confirm}
            onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
          />
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow disabled:opacity-60"
          >
            <Shield className="h-4 w-4" />
            {saving ? "Updating…" : "Update password"}
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="Session info" subtitle="Account activity overview" icon={Monitor}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Last activity</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {security?.lastLogin ? new Date(security.lastLogin).toLocaleString() : "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Account created</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {security?.accountCreated ? new Date(security.accountCreated).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Logged-in devices" subtitle="Sessions connected to your account">
        <ul className="space-y-2">
          {(security?.devices || []).map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{d.label}</p>
                <p className="text-xs text-slate-500">{d.location}</p>
              </div>
              {d.current ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                  Current
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </SettingsCard>
    </div>
  );
}
