import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Box, Card, CardContent, Grid, Paper, Stack, Typography } from "@mui/material";
import { schoolAdminSettingsService } from "../../../services/schoolAdminSettingsService";
import { fetchSchoolAdminSettings, applySchoolBrandingPreview } from "../../../store/schoolAdminSettingsSlice";
import { CURRENCIES, DATE_FORMATS, TIMEZONES, ACADEMIC_SESSIONS } from "./schoolSettingsConstants";
import PlatformBrandingUpload from "../../superAdmin/settings/PlatformBrandingUpload";
import { ColorField, SaveButton, SettingsGridItem, SettingsSelect, SettingsTextField } from "../../superAdmin/settings/settingsShared";

const DEFAULT = {
  schoolName: "",
  logoUrl: "",
  faviconUrl: "",
  address: "",
  contactNumber: "",
  supportEmail: "",
  websiteUrl: "",
  timezone: "Asia/Kolkata",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  academicSession: "",
  primaryColor: "#2563eb",
};

export default function SchoolSettingsPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.schoolAdminSettings);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT });

  useEffect(() => {
    if (data?.school) setForm((f) => ({ ...f, ...data.school }));
  }, [data?.school]);

  const patch = (updates) => {
    const next = { ...form, ...updates };
    setForm(next);
    dispatch(applySchoolBrandingPreview(next));
  };

  const handleSave = async () => {
    if (!form.schoolName?.trim()) {
      toast.error("School name is required");
      return;
    }
    setSaving(true);
    try {
      await schoolAdminSettingsService.updateSchoolSettings(form);
      await dispatch(fetchSchoolAdminSettings());
      toast.success("School settings saved and applied");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={0} sx={{ position: "sticky", top: 0, zIndex: 3, mb: 3, px: { xs: 2, sm: 2.5 }, py: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", boxShadow: "0 4px 20px -8px rgba(15,23,42,0.12)", display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>School settings</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>Branding and regional defaults for your school portal.</Typography>
        </Box>
        <SaveButton loading={saving} onClick={handleSave} sx={{ width: { xs: "100%", sm: "auto" } }}>Save settings</SaveButton>
      </Paper>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ height: "100%", borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Branding</Typography>
              <Stack spacing={3}>
                <PlatformBrandingUpload label="School logo" hint="Recommended 160×160 px." value={form.logoUrl} onChange={(v) => patch({ logoUrl: v })} size={160} maxDim={320} />
                <PlatformBrandingUpload label="Favicon" hint="Recommended 64×64 px." value={form.faviconUrl} onChange={(v) => patch({ faviconUrl: v })} size={64} maxDim={128} maxBytes={512 * 1024} />
                <ColorField label="Primary color" value={form.primaryColor} onChange={(v) => patch({ primaryColor: v })} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ height: "100%", borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Grid container spacing={3}>
                <SettingsGridItem xs={12}>
                  <SettingsTextField label="School name" value={form.schoolName} onChange={(e) => patch({ schoolName: e.target.value })} required />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={4}>
                  <SettingsSelect label="Timezone" value={form.timezone} onChange={(e) => patch({ timezone: e.target.value })} options={TIMEZONES.map((z) => ({ value: z, label: z }))} />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={4}>
                  <SettingsSelect label="Currency" value={form.currency} onChange={(e) => patch({ currency: e.target.value })} options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={4}>
                  <SettingsSelect label="Date format" value={form.dateFormat} onChange={(e) => patch({ dateFormat: e.target.value })} options={DATE_FORMATS.map((d) => ({ value: d, label: d }))} />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={4}>
                  <SettingsSelect label="Academic session" value={form.academicSession} onChange={(e) => patch({ academicSession: e.target.value })} options={[{ value: "", label: "Not set" }, ...ACADEMIC_SESSIONS.map((s) => ({ value: s, label: s }))]} />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={4}>
                  <SettingsTextField label="Contact number" value={form.contactNumber} onChange={(e) => patch({ contactNumber: e.target.value })} />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={4}>
                  <SettingsTextField label="Support email" type="email" value={form.supportEmail} onChange={(e) => patch({ supportEmail: e.target.value })} />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={4}>
                  <SettingsTextField label="Website URL" value={form.websiteUrl} onChange={(e) => patch({ websiteUrl: e.target.value })} placeholder="https://" />
                </SettingsGridItem>
                <SettingsGridItem xs={12}>
                  <SettingsTextField label="Address" value={form.address} onChange={(e) => patch({ address: e.target.value })} multiline minRows={2} sx={{ "& .MuiOutlinedInput-root": { minHeight: "auto" } }} />
                </SettingsGridItem>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
