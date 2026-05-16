import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Box,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { DEFAULT_ERP_THEME } from "../../../theme/erpThemeConstants";
import { saveErpTheme } from "../../../store/erpThemeSlice";
import {
  ColorField,
  SaveButton,
  SecondaryButton,
  SettingsGridItem,
  SettingsSectionCard,
  SettingsSelect,
} from "./settingsShared";

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

export default function ThemeSettingsPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.superAdminSettings);
  const { theme: savedTheme, saving } = useSelector((s) => s.erpTheme);
  const [form, setForm] = useState({ ...DEFAULT_ERP_THEME });

  useEffect(() => {
    const source = data?.theme || savedTheme;
    if (source) setForm({ ...DEFAULT_ERP_THEME, ...source });
  }, [data?.theme, savedTheme]);

  const patch = (partial) => setForm((f) => ({ ...f, ...partial }));

  const handleSave = async () => {
    try {
      await dispatch(saveErpTheme(form)).unwrap();
      toast.success("Theme saved");
    } catch (error) {
      toast.error(error || "Failed to save theme");
    }
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_ERP_THEME });
    toast.success("Reset to defaults — click Save to apply");
  };

  return (
    <SettingsSectionCard
      title="Theme & appearance"
      subtitle="Colors and typography for the dashboard."
      actions={
        <>
          <SecondaryButton onClick={handleReset}>Reset</SecondaryButton>
          <SaveButton loading={saving} onClick={handleSave}>Save Theme</SaveButton>
        </>
      }
    >
      <FormControl component="fieldset">
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Color mode
        </Typography>
        <RadioGroup row value={form.mode} onChange={(e) => patch({ mode: e.target.value })}>
          <FormControlLabel value="light" control={<Radio size="small" />} label="Light" />
          <FormControlLabel value="dark" control={<Radio size="small" />} label="Dark" />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={3}>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <ColorField label="Sidebar" value={form.sidebarColor} onChange={(v) => patch({ sidebarColor: v })} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <ColorField label="Header" value={form.headerColor} onChange={(v) => patch({ headerColor: v })} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <ColorField label="Primary" value={form.primaryColor} onChange={(v) => patch({ primaryColor: v })} />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <SettingsSelect
            label="Font size"
            options={FONT_OPTIONS}
            value={form.fontSize}
            onChange={(e) => patch({ fontSize: e.target.value })}
          />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6} md={4}>
          <SettingsSelect
            label="Border radius"
            options={RADIUS_OPTIONS}
            value={form.borderRadius}
            onChange={(e) => patch({ borderRadius: e.target.value })}
          />
        </SettingsGridItem>
      </Grid>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Preview
        </Typography>
        <ThemePreview form={form} />
      </Box>
    </SettingsSectionCard>
  );
}

function ThemePreview({ form }) {
  const isDark = form.mode === "dark";
  const radius = form.borderRadius === "large" ? 16 : form.borderRadius === "small" ? 8 : 12;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Stack direction="row" sx={{ minHeight: 120 }}>
        <Box sx={{ width: 64, bgcolor: form.sidebarColor }} />
        <Stack sx={{ flex: 1 }}>
          <Box sx={{ height: 36, bgcolor: form.headerColor, borderBottom: 1, borderColor: "divider" }} />
          <Box sx={{ flex: 1, bgcolor: isDark ? "#1e293b" : "#f8fafc", p: 1.5 }}>
            <Box
              sx={{
                display: "inline-block",
                px: 1.5,
                py: 0.5,
                borderRadius: `${radius}px`,
                bgcolor: form.primaryColor,
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Button
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
