import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Grid } from "@mui/material";
import { superAdminSettingsService } from "../../../services/superAdminSettingsService";
import { fetchSuperAdminSettings } from "../../../store/superAdminSettingsSlice";
import { CURRENCIES } from "./settingsConstants";
import { SaveButton, SettingsGridItem, SettingsSectionCard, SettingsSelect, SettingsTextField } from "./settingsShared";

export default function BillingSettingsPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.superAdminSettings);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    defaultTrialDays: 14,
    gstPercentage: 18,
    currency: "INR",
    invoicePrefix: "INV",
  });

  useEffect(() => {
    if (!data?.billing) return;
    setForm((f) => ({ ...f, ...data.billing }));
  }, [data?.billing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await superAdminSettingsService.updateBilling(form);
      await dispatch(fetchSuperAdminSettings());
      toast.success("Billing settings saved");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSectionCard
      title="Billing & subscription"
      subtitle="Defaults for trials, tax, and invoicing."
      actions={<SaveButton loading={saving} onClick={handleSave}>Save Billing Settings</SaveButton>}
    >
      <Grid container spacing={3}>
        <SettingsGridItem xs={12} sm={6}>
          <SettingsTextField
            label="Default trial days"
            type="number"
            value={form.defaultTrialDays}
            onChange={(e) => setForm((f) => ({ ...f, defaultTrialDays: Number(e.target.value) }))}
          />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6}>
          <SettingsTextField
            label="GST percentage"
            type="number"
            value={form.gstPercentage}
            onChange={(e) => setForm((f) => ({ ...f, gstPercentage: Number(e.target.value) }))}
          />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6}>
          <SettingsSelect
            label="Currency"
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </SettingsGridItem>
        <SettingsGridItem xs={12} sm={6}>
          <SettingsTextField
            label="Invoice prefix"
            value={form.invoicePrefix}
            onChange={(e) => setForm((f) => ({ ...f, invoicePrefix: e.target.value }))}
          />
        </SettingsGridItem>
      </Grid>
    </SettingsSectionCard>
  );
}
