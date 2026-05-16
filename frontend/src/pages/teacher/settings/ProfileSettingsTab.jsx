import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Briefcase, Link2, Mail, MapPin, Phone, Save, User, X } from "lucide-react";
import { teacherService } from "../../../services/teacherService";
import { resolveUploadUrl } from "../../../utils/apiOrigin";
import { preloadImageUrl } from "../../../utils/preloadImage";
import { useTeacherProfile } from "../../../hooks/useTeacherProfile";
import { setTeacherAvatarPreview } from "../../../store/teacherProfileSlice";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import { SettingsCard, SettingsSkeleton, inputClass, labelClass } from "./settingsUi";
import { BLOOD_GROUPS, DRAFT_STORAGE_KEY, EMPLOYMENT_TYPES, GENDER_OPTIONS } from "./teacherSettingsConstants";

function toDateInput(d) {
  if (!d) return "";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  return x.toISOString().slice(0, 10);
}

function emptyForm() {
  return {
    name: "",
    email: "",
    phone: "",
    gender: "OTHER",
    dateOfBirth: "",
    qualification: "",
    experience: "",
    bloodGroup: "",
    addressLine: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    employmentType: "",
    bio: "",
    linkedin: "",
    facebook: "",
    twitter: "",
    website: "",
  };
}

function mapProfileToForm(p) {
  if (!p) return emptyForm();
  return {
    name: p.name || "",
    email: p.email || "",
    phone: p.phone || "",
    gender: p.gender || "OTHER",
    dateOfBirth: toDateInput(p.dateOfBirth),
    qualification: p.qualification || "",
    experience: p.experience != null ? String(p.experience) : "",
    bloodGroup: p.bloodGroup || "",
    addressLine: p.addressLine || "",
    city: p.city || "",
    state: p.state || "",
    country: p.country || "",
    pincode: p.pincode || "",
    employmentType: p.employmentType || "",
    bio: p.bio || "",
    linkedin: p.socialLinks?.linkedin || "",
    facebook: p.socialLinks?.facebook || "",
    twitter: p.socialLinks?.twitter || "",
    website: p.socialLinks?.website || "",
  };
}

export default function ProfileSettingsTab() {
  const dispatch = useDispatch();
  const { applyProfileDto, refreshProfile, profile: globalProfile } = useTeacherProfile();
  const reduxLoaded = useSelector((s) => s.teacherProfile?.loaded);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const avatarVersion = useSelector((s) => s.teacherProfile?.avatarVersion || 0);
  const initialRef = useRef("");

  const hydrateForm = useCallback((data) => {
    setProfile(data);
    const mapped = mapProfileToForm(data);
    setForm(mapped);
    initialRef.current = JSON.stringify(mapped);
    setPhotoPreview(data.profileImage || "");
    setCoverPreview(data.coverImage || "");
    setDirty(false);
    setPhotoFile(null);
    setCoverFile(null);
    setRemovePhoto(false);
    setRemoveCover(false);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await refreshProfile();
      hydrateForm(data);
    } catch (e) {
      toast.error(e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [refreshProfile, hydrateForm]);

  useEffect(() => {
    if (reduxLoaded && globalProfile?.full) {
      hydrateForm(globalProfile.full);
      setLoading(false);
      return;
    }
    load();
  }, [reduxLoaded, globalProfile?.full, hydrateForm, load]);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft && !loading && profile) {
      try {
        const parsed = JSON.parse(draft);
        setForm((f) => ({ ...f, ...parsed }));
        setDirty(true);
      } catch {
        /* ignore */
      }
    }
  }, [loading, profile]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (dirty) localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
    }, 800);
    return () => clearTimeout(t);
  }, [form, dirty]);

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const completion = profile?.completionPercent ?? 0;

  const coverDisplay = useMemo(() => {
    if (coverPreview?.startsWith("blob:")) return coverPreview;
    if (coverPreview) return resolveUploadUrl(coverPreview);
    return "";
  }, [coverPreview]);

  const validate = () => {
    if (!form.name.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (photoFile) fd.append("profileImage", photoFile);
      if (coverFile) fd.append("coverImage", coverFile);
      if (removePhoto) fd.append("removeProfileImage", "true");
      if (removeCover) fd.append("removeCoverImage", "true");
      const updated = await teacherService.updateProfileSettings(fd);
      const version = updated.profileImage ? Date.now() : 0;
      if (updated.profileImage) {
        await preloadImageUrl(`${resolveUploadUrl(updated.profileImage)}?v=${version}`);
      }
      applyProfileDto({ ...updated, avatarVersion: version });
      hydrateForm(updated);
      dispatch(setTeacherAvatarPreview(""));
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      toast.success("Profile updated — changes synced across the app");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setForm(JSON.parse(initialRef.current || JSON.stringify(emptyForm())));
    setPhotoPreview(profile?.profileImage || "");
    setCoverPreview(profile?.coverImage || "");
    setPhotoFile(null);
    setCoverFile(null);
    setRemovePhoto(false);
    setRemoveCover(false);
    setDirty(false);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-lg ring-1 ring-slate-100">
        <div className="relative h-36 bg-gradient-to-br from-slate-900 via-brand-800 to-indigo-900 sm:h-44">
          {coverDisplay ? <img src={coverDisplay} alt="" className="h-full w-full object-cover" /> : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 text-white">
            <p className="text-xl font-bold sm:text-2xl">{form.name || profile?.name}</p>
            <p className="text-sm text-white/90">{profile?.role}</p>
            <p className="mt-0.5 text-xs text-white/75">
              {profile?.department || profile?.subject} · ID {profile?.employeeId || "—"}
            </p>
          </div>
          <div className="absolute bottom-4 right-5 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-center backdrop-blur-md">
            <p className="text-[0.65rem] font-bold uppercase text-white/80">Complete</p>
            <p className="text-2xl font-bold text-white">{completion}%</p>
            <div className="mx-auto mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-white/30">
              <div className="h-full rounded-full bg-white" style={{ width: `${completion}%` }} />
            </div>
          </div>
          <label className="absolute right-4 top-4 z-10 cursor-pointer rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-lg hover:bg-white">
            Change cover
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setCoverFile(f);
                setCoverPreview(URL.createObjectURL(f));
                setRemoveCover(false);
                setDirty(true);
              }}
            />
          </label>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/40 px-5 pb-6 pt-5 sm:px-8">

          <ProfilePhotoUpload
            name={form.name}
            previewUrl={photoPreview}
            cacheBust={avatarVersion}
            disabled={saving || uploadingPhoto}
            uploading={uploadingPhoto}
            onFileSelect={async (file) => {
              let blobUrl = "";
              try {
                blobUrl = URL.createObjectURL(file);
                setPhotoPreview(blobUrl);
                dispatch(setTeacherAvatarPreview(blobUrl));
                setRemovePhoto(false);
                setDirty(true);
                setUploadingPhoto(true);

                const updated = await teacherService.uploadProfilePhoto(file);
                const version = Date.now();
                const serverUrl = updated.profileImage
                  ? `${resolveUploadUrl(updated.profileImage)}?v=${version}`
                  : "";

                if (serverUrl) await preloadImageUrl(serverUrl);

                applyProfileDto({ ...updated, avatarVersion: version });
                setPhotoFile(null);
                setPhotoPreview(updated.profileImage || "");
                dispatch(setTeacherAvatarPreview(""));

                if (blobUrl) URL.revokeObjectURL(blobUrl);
                toast.success("Profile photo updated");
              } catch (e) {
                if (blobUrl) URL.revokeObjectURL(blobUrl);
                setPhotoFile(file);
                toast.error(e.message || "Photo upload failed. Try Save changes.");
              } finally {
                setUploadingPhoto(false);
              }
            }}
            onRemove={() => {
              setPhotoFile(null);
              setPhotoPreview("");
              dispatch(setTeacherAvatarPreview(""));
              setRemovePhoto(true);
              setDirty(true);
            }}
          />
        </div>
      </div>

      <SettingsCard title="Personal information" subtitle="Contact and identity details" icon={User}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Full name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input className={inputClass} type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select className={inputClass} value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Date of birth</label>
            <input className={inputClass} type="date" value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Qualification</label>
            <input className={inputClass} value={form.qualification} onChange={(e) => setField("qualification", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Experience (years)</label>
            <input className={inputClass} type="number" min={0} value={form.experience} onChange={(e) => setField("experience", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Blood group</label>
            <select className={inputClass} value={form.bloodGroup} onChange={(e) => setField("bloodGroup", e.target.value)}>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg || "none"} value={bg}>
                  {bg || "Select"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Address" subtitle="Residential details" icon={MapPin}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={form.addressLine} onChange={(e) => setField("addressLine", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={form.city} onChange={(e) => setField("city", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input className={inputClass} value={form.state} onChange={(e) => setField("state", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input className={inputClass} value={form.country} onChange={(e) => setField("country", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>ZIP code</label>
            <input className={inputClass} value={form.pincode} onChange={(e) => setField("pincode", e.target.value)} />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Professional information" subtitle="Read-only assignment details from school admin" icon={Briefcase}>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Employee ID", profile?.employeeId],
            ["Department", profile?.department],
            ["Subject", profile?.subject],
            ["Joining date", profile?.joiningDate ? toDateInput(profile.joiningDate) : "—"],
            ["Employment type", profile?.employmentType || "—"],
            ["Class assigned", profile?.classAssigned],
            ["Section assigned", profile?.sectionAssigned],
          ].map(([label, val]) => (
            <div key={label}>
              <label className={labelClass}>{label}</label>
              <input className={inputClass} value={val || "—"} disabled readOnly />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className={labelClass}>Employment type (editable)</label>
            <select className={inputClass} value={form.employmentType} onChange={(e) => setField("employmentType", e.target.value)}>
              {EMPLOYMENT_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Social links" subtitle="Optional public profiles" icon={Link2}>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["linkedin", "LinkedIn URL"],
            ["facebook", "Facebook URL"],
            ["twitter", "Twitter / X URL"],
            ["website", "Website"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input className={inputClass} value={form[key]} onChange={(e) => setField(key, e.target.value)} placeholder="https://" />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Bio / about" subtitle="Short introduction for coordinators and parents">
        <textarea
          className={`${inputClass} min-h-[120px] resize-y`}
          value={form.bio}
          onChange={(e) => setField("bio", e.target.value)}
          placeholder="Write a brief professional introduction…"
        />
      </SettingsCard>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:from-brand-700 hover:to-indigo-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={cancel}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
