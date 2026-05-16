import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  savePlatformSettings,
  setPlatformSettingsPreview,
} from "../../../store/platformSettingsSlice";
import { DEFAULT_PLATFORM_SETTINGS } from "../../../theme/platformSettingsConstants";
import { CURRENCIES, DATE_FORMATS, TIMEZONES } from "./settingsConstants";
import { ACADEMIC_SESSIONS } from "../../../theme/platformSettingsConstants";
import PlatformBrandingUpload from "./PlatformBrandingUpload";
import {
  ColorField,
  SaveButton,
  SettingsGridItem,
  SettingsSelect,
  SettingsTextField,
} from "./settingsShared";

export default function PlatformSettingsPage() {
  const dispatch = useDispatch();
  const { settings, saving } = useSelector((s) => s.platformSettings);
  const superPlatform = useSelector((s) => s.superAdminSettings.data?.platform);
  const [form, setForm] = useState({ ...DEFAULT_PLATFORM_SETTINGS });

  useEffect(() => {
    const source = superPlatform || settings;
    if (source) setForm((f) => ({ ...f, ...source }));
  }, [superPlatform, settings]);

  const patch = (updates) => {
    const next = { ...form, ...updates };
    setForm(next);
    dispatch(setPlatformSettingsPreview(next));
  };

  const handleSave = async () => {
    if (!form.platformName?.trim()) {
      toast.error("Platform name is required");
      return;
    }
    try {
      await dispatch(savePlatformSettings(form)).unwrap();
      toast.success("Platform settings saved and applied across the app");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to save platform settings");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 3,
          mb: 3,
          px: { xs: 2, sm: 2.5 },
          py: 2,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 4px 20px -8px rgba(15,23,42,0.12)",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
            Platform settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.55 }}>
            Branding, regional defaults, and support details—reflected across the entire ERP after save.
          </Typography>
        </Box>
        <SaveButton
          loading={saving}
          onClick={handleSave}
          sx={{ width: { xs: "100%", sm: "auto" }, flexShrink: 0, alignSelf: { sm: "center" } }}
        >
          Save settings
        </SaveButton>
      </Paper>

      <Grid container spacing={4} alignItems="stretch">
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 12px 32px -20px rgba(15,23,42,0.12)",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Branding
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.55 }}>
                Logo and favicon appear in the sidebar, login screen, browser tab, and exports.
              </Typography>
              <Stack spacing={3.5}>
                <PlatformBrandingUpload
                  label="Platform logo"
                  hint={`Recommended ${160}×${160} px. PNG or SVG with transparent background.`}
                  value={form.logoUrl}
                  onChange={(v) => patch({ logoUrl: v })}
                  size={160}
                  maxDim={320}
                  maxBytes={2 * 1024 * 1024}
                />
                <PlatformBrandingUpload
                  label="Favicon"
                  hint={`Recommended ${64}×${64} px for browser tab and PWA icon.`}
                  value={form.faviconUrl}
                  onChange={(v) => patch({ faviconUrl: v })}
                  size={64}
                  maxDim={128}
                  maxBytes={512 * 1024}
                />
                <ColorField
                  label="Primary theme color"
                  value={form.primaryColor}
                  onChange={(v) => patch({ primaryColor: v })}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 12px 32px -20px rgba(15,23,42,0.12)",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.55 }}>
                Regional defaults and organization contact information.
              </Typography>

              <Grid container spacing={3}>
                <SettingsGridItem xs={12} sm={12} md={12}>
                  <SettingsTextField
                    label="Platform name"
                    value={form.platformName}
                    onChange={(e) => patch({ platformName: e.target.value })}
                    required
                  />
                </SettingsGridItem>

                <SettingsGridItem xs={12} sm={6} md={6}>
                  <SettingsSelect
                    label="Timezone"
                    value={form.timezone}
                    onChange={(e) => patch({ timezone: e.target.value })}
                    options={TIMEZONES.map((z) => ({ value: z, label: z }))}
                  />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={6}>
                  <SettingsSelect
                    label="Currency"
                    value={form.currency}
                    onChange={(e) => patch({ currency: e.target.value })}
                    options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                  />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={6}>
                  <SettingsSelect
                    label="Date format"
                    value={form.dateFormat}
                    onChange={(e) => patch({ dateFormat: e.target.value })}
                    options={DATE_FORMATS.map((d) => ({ value: d, label: d }))}
                  />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={6}>
                  <SettingsSelect
                    label="Default academic session"
                    value={form.academicSession}
                    onChange={(e) => patch({ academicSession: e.target.value })}
                    options={[
                      { value: "", label: "Not set" },
                      ...ACADEMIC_SESSIONS.map((s) => ({ value: s, label: s })),
                    ]}
                  />
                </SettingsGridItem>

                <SettingsGridItem xs={12} sm={6} md={6}>
                  <SettingsTextField
                    label="Support email"
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) => patch({ supportEmail: e.target.value })}
                  />
                </SettingsGridItem>
                <SettingsGridItem xs={12} sm={6} md={6}>
                  <SettingsTextField
                    label="Support contact"
                    value={form.supportContact}
                    onChange={(e) => patch({ supportContact: e.target.value })}
                  />
                </SettingsGridItem>

                <SettingsGridItem xs={12} sm={6} md={6}>
                  <SettingsTextField
                    label="Website URL"
                    value={form.websiteUrl}
                    onChange={(e) => patch({ websiteUrl: e.target.value })}
                    placeholder="https://"
                  />
                </SettingsGridItem>

                <SettingsGridItem xs={12} sm={12} md={12}>
                  <SettingsTextField
                    label="Organization address"
                    value={form.address}
                    onChange={(e) => patch({ address: e.target.value })}
                    multiline
                    minRows={3}
                    sx={{
                      "& .MuiOutlinedInput-root": { minHeight: "auto", py: 1.25 },
                    }}
                  />
                </SettingsGridItem>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
