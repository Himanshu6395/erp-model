import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Box, FormControl, FormControlLabel, Grid, Paper, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import { DEFAULT_ERP_THEME } from "../../../theme/erpThemeConstants";
import { applyErpTheme } from "../../../theme/applyErpTheme";
import { schoolAdminSettingsService } from "../../../services/schoolAdminSettingsService";
import { fetchSchoolAdminSettings, applySchoolThemePreview } from "../../../store/schoolAdminSettingsSlice";
import { ColorField, SaveButton, SecondaryButton, SettingsGridItem, SettingsSectionCard, SettingsSelect } from "../../superAdmin/settings/settingsShared";

const FONT_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const RADIUS_OPTIONS = [
  { value: "small", label: "Compact (8px)" },
  { value: "medium", label: "Default (12px)" },
  { value: "large", label: "Rounded (16px)" },
];

export default function SchoolThemeSettingsPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.schoolAdminSettings);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_ERP_THEME });

  useEffect(() => {
    if (data?.theme) setForm({ ...DEFAULT_ERP_THEME, ...data.theme });
  }, [data?.theme]);

  const patch = (partial) => {
    const next = { ...form, ...partial };
    setForm(next);
    dispatch(applySchoolThemePreview(next));
    applyErpTheme(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await schoolAdminSettingsService.updateTheme(form);
      await dispatch(fetchSchoolAdminSettings());
      toast.success("Theme saved");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaults = { ...DEFAULT_ERP_THEME };
    setForm(defaults);
    dispatch(applySchoolThemePreview(defaults));
    toast.success("Reset to defaults — click Save to apply");
  };

  return (
    <SettingsSectionCard
      title="Theme & appearance"
      subtitle="Colors and typography for your school admin panel."
      actions={
        <>
          <SecondaryButton onClick={handleReset}>Reset</SecondaryButton>
          <SaveButton loading={saving} onClick={handleSave}>Save Theme</SaveButton>
        </>
      }
    >
      <FormControl component="fieldset">
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Color mode</Typography>
        <RadioGroup row value={form.mode} onChange={(e) => patch({ mode: e.target.value })}>
          <FormControlLabel value="light" control={<Radio size="small" />} label="Light" />
          <FormControlLabel value="dark" control={<Radio size="small" />} label="Dark" />
        </RadioGroup>
      </FormControl>
      <Grid container spacing={3}>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <ColorField label="Sidebar color" value={form.sidebarColor} onChange={(v) => patch({ sidebarColor: v })} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <ColorField label="Header color" value={form.headerColor} onChange={(v) => patch({ headerColor: v })} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <ColorField label="Primary theme color" value={form.primaryColor} onChange={(v) => patch({ primaryColor: v })} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <SettingsSelect label="Font size" options={FONT_OPTIONS} value={form.fontSize} onChange={(e) => patch({ fontSize: e.target.value })} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <SettingsSelect label="Border radius" options={RADIUS_OPTIONS} value={form.borderRadius} onChange={(e) => patch({ borderRadius: e.target.value })} />
        </SettingsGridItem>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Preview</Typography>
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Stack direction="row" sx={{ minHeight: 100 }}>
            <Box sx={{ width: 56, bgcolor: form.sidebarColor }} />
            <Stack sx={{ flex: 1 }}>
              <Box sx={{ height: 32, bgcolor: form.headerColor, borderBottom: 1, borderColor: "divider" }} />
              <Box sx={{ flex: 1, bgcolor: form.mode === "dark" ? "#1e293b" : "#f8fafc", p: 1.5 }}>
                <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: form.primaryColor, color: "#fff", fontSize: 12, fontWeight: 600 }}>Button</Box>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </SettingsSectionCard>
  );
}
