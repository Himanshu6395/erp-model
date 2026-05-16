import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Box,
  Checkbox,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { superAdminSettingsService } from "../../../services/superAdminSettingsService";
import { fetchSuperAdminSettings } from "../../../store/superAdminSettingsSlice";
import { PERMISSION_MODULES, PERMISSION_ROLES } from "./settingsConstants";
import { SaveButton, SettingsSectionCard } from "./settingsShared";

const ACTIONS = ["view", "create", "edit", "delete"];

export default function PermissionsSettingsPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.superAdminSettings);
  const [saving, setSaving] = useState(false);
  const [roleTab, setRoleTab] = useState("SCHOOL_ADMIN");
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    if (!data?.permissions) return;
    setPermissions(JSON.parse(JSON.stringify(data.permissions)));
  }, [data]);

  const toggle = (role, module, action) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role]?.[module],
          [action]: !prev[role]?.[module]?.[action],
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await superAdminSettingsService.updatePermissions(permissions);
      await dispatch(fetchSuperAdminSettings());
      toast.success("Permissions saved");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSectionCard
      title="Roles & permissions"
      subtitle="Control module access and CRUD permissions by role."
      actions={<SaveButton loading={saving} onClick={handleSave}>Save Permissions</SaveButton>}
    >
      <Tabs value={roleTab} onChange={(_, v) => setRoleTab(v)} variant="scrollable" sx={{ mb: 2 }}>
        {PERMISSION_ROLES.map((r) => (
          <Tab key={r.key} label={r.label} value={r.key} />
        ))}
      </Tabs>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Module</TableCell>
              {ACTIONS.map((a) => (
                <TableCell key={a} align="center" sx={{ textTransform: "capitalize" }}>
                  {a}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {PERMISSION_MODULES.map((mod) => (
              <TableRow key={mod.key} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {mod.label}
                  </Typography>
                </TableCell>
                {ACTIONS.map((action) => (
                  <TableCell key={action} align="center">
                    <Checkbox
                      size="small"
                      checked={Boolean(permissions[roleTab]?.[mod.key]?.[action])}
                      onChange={() => toggle(roleTab, mod.key, action)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Changes apply to role-based access enforcement when integrated with the auth layer.
        </Typography>
      </Box>
    </SettingsSectionCard>
  );
}
