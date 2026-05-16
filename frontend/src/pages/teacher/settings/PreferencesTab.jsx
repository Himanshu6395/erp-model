import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Palette, Save } from "lucide-react";
import { teacherService } from "../../../services/teacherService";
import { applyTeacherPreferences } from "../../../utils/applyTeacherPreferences";
import { patchTeacherProfile } from "../../../store/teacherProfileSlice";
import { SettingsCard, SettingsSkeleton, ToggleRow, inputClass, labelClass } from "./settingsUi";

const THEMES = [
  { value: "brand", label: "Brand blue" },
  { value: "indigo", label: "Indigo" },
  { value: "emerald", label: "Emerald" },
  { value: "slate", label: "Slate" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];

const FONT_SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export default function PreferencesTab() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({
    theme: "brand",
    language: "en",
    sidebarMode: "expanded",
    notificationSound: true,
    darkMode: false,
    fontSize: "medium",
    compactMode: false,
    animationsEnabled: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profile = await teacherService.getProfileSettings();
        const p = profile.preferences || prefs;
        setPrefs(p);
        applyTeacherPreferences(p);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updatePref = (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    applyTeacherPreferences(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await teacherService.updatePreferences(prefs);
      setPrefs(updated);
      applyTeacherPreferences(updated);
      dispatch(patchTeacherProfile({ preferences: updated }));
      toast.success("Preferences saved and applied");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <SettingsCard title="Appearance" subtitle="Changes apply instantly across the teacher portal" icon={Palette}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Theme accent</label>
            <select className={inputClass} value={prefs.theme} onChange={(e) => updatePref("theme", e.target.value)}>
              {THEMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Language</label>
            <select className={inputClass} value={prefs.language} onChange={(e) => updatePref("language", e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Sidebar mode</label>
            <select
              className={inputClass}
              value={prefs.sidebarMode}
              onChange={(e) => updatePref("sidebarMode", e.target.value)}
            >
              <option value="expanded">Expanded</option>
              <option value="compact">Compact</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Font size</label>
            <select className={inputClass} value={prefs.fontSize} onChange={(e) => updatePref("fontSize", e.target.value)}>
              {FONT_SIZES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <ToggleRow
            label="Dark mode"
            description="Reduce eye strain in low light"
            checked={prefs.darkMode}
            onChange={(v) => updatePref("darkMode", v)}
          />
          <ToggleRow
            label="Compact layout"
            description="Tighter spacing in lists and cards"
            checked={prefs.compactMode}
            onChange={(v) => updatePref("compactMode", v)}
          />
          <ToggleRow
            label="UI animations"
            description="Smooth transitions and motion"
            checked={prefs.animationsEnabled}
            onChange={(v) => updatePref("animationsEnabled", v)}
          />
          <ToggleRow
            label="Notification sounds"
            description="Play sound for in-app alerts"
            checked={prefs.notificationSound}
            onChange={(v) => updatePref("notificationSound", v)}
          />
        </div>
      </SettingsCard>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving…" : "Save preferences"}
      </button>
    </div>
  );
}
