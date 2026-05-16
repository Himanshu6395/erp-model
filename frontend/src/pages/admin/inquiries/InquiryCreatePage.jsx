import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  Grid,
  Box,
  Divider,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import toast from "react-hot-toast";
import { inquiryAdminApi } from "../../../services/inquiryApi";
import { adminService } from "../../../services/adminService";
import { INQUIRY_SOURCE_OPTIONS, INQUIRY_STATUS_OPTIONS } from "./inquiryConstants";
import { parseDobString, parseFollowUpString } from "./inquiryCreateDateHelpers";

const INPUT_H = 56;

const outlinedRootBase = {
  borderRadius: 1.25,
  bgcolor: "#fff",
  minHeight: INPUT_H,
  "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" },
  "&:hover fieldset": { borderColor: "rgba(29, 78, 216, 0.32)" },
  "&.Mui-focused fieldset": { borderWidth: 1 },
};

/** Single-line TextField, Select, and DatePicker / DateTimePicker text field */
const uniformFieldSx = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  "& .MuiOutlinedInput-root": {
    ...outlinedRootBase,
  },
  /* Use input-only selector so :not(...) does not confuse tooling; textarea uses multilineFieldSx */
  "& input.MuiOutlinedInput-input": {
    boxSizing: "border-box",
    height: INPUT_H,
    py: 0,
    px: 1.75,
    display: "flex",
    alignItems: "center",
    lineHeight: 1.4375,
    fontSize: "1rem",
  },
  "& .MuiSelect-select": {
    boxSizing: "border-box !important",
    height: `${INPUT_H}px !important`,
    minHeight: `${INPUT_H}px !important`,
    display: "flex !important",
    alignItems: "center",
    py: "0 !important",
    px: "14px !important",
    lineHeight: 1.4375,
    fontSize: "1rem",
  },
  "& .MuiInputLabel-root": {
    lineHeight: 1.2,
  },
};

const multilineFieldSx = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  "& .MuiOutlinedInput-root": {
    ...outlinedRootBase,
    height: "auto",
    minHeight: 104,
    alignItems: "flex-start",
    py: 0.75,
    "& fieldset": outlinedRootBase["& fieldset"],
    "&:hover fieldset": outlinedRootBase["&:hover fieldset"],
    "&.Mui-focused fieldset": outlinedRootBase["&.Mui-focused fieldset"],
  },
  "& .MuiOutlinedInput-input": {
    height: "auto !important",
    minHeight: 72,
    py: "12px !important",
    px: "14px !important",
    lineHeight: 1.5,
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  "& .MuiInputLabel-root": {
    lineHeight: 1.2,
  },
};

const pickerTextFieldSlots = {
  fullWidth: true,
  variant: "outlined",
  sx: uniformFieldSx,
};

function Section({ title, subtitle, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 0.08, display: "block", mb: subtitle ? 0.5 : 1.25 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.75 }}>
          {subtitle}
        </Typography>
      )}
      <PaperSection>{children}</PaperSection>
    </Box>
  );
}

function PaperSection({ children }) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        bgcolor: "grey.50",
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {children}
    </Box>
  );
}

/** Grid item: 4 col desktop (md), 2 col tablet (sm), stack mobile (xs) */
function FormCell({ children }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      {children}
    </Grid>
  );
}

export default function InquiryCreatePage() {
  const nav = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    studentFullName: "",
    fatherName: "",
    motherName: "",
    mobileNumber: "",
    alternateNumber: "",
    email: "",
    gender: "OTHER",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    interestedClass: "",
    interestedClassId: "",
    previousSchool: "",
    source: "WALK_IN",
    counselorNotes: "",
    followUpDate: "",
    assignedTeacherId: "",
    status: "PENDING",
  });

  useEffect(() => {
    adminService.getTeachers({ page: 1, limit: 200 }).then((d) => setTeachers(d.items || []));
    adminService.getClasses().then((data) => setClasses(Array.isArray(data) ? data : data?.items || []));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await inquiryAdminApi.create({
        ...form,
        interestedClassId: form.interestedClassId || undefined,
        assignedTeacherId: form.assignedTeacherId || undefined,
        followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : undefined,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
      });
      toast.success("Inquiry created");
      nav("/admin/inquiries/all");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed");
    }
  };

  const btnSx = {
    minHeight: INPUT_H,
    px: 3,
    width: { xs: "100%", sm: "auto" },
    alignSelf: { xs: "stretch", sm: "center" },
  };

  return (
    <Card sx={{ p: 0, overflow: "hidden", maxWidth: "100%" }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, borderBottom: "1px solid rgba(15,23,42,0.08)", bgcolor: "grey.50" }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Create inquiry
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Capture prospect details once; counselors can enrich status and notes from the detail panel.
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 }, maxWidth: "100%", overflowX: "hidden" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form onSubmit={submit} style={{ width: "100%", maxWidth: "100%", margin: 0 }}>
            <Section title="Student & contact" subtitle="Required fields are marked with an asterisk.">
              <Grid container spacing={2} sx={{ margin: 0, width: "100%" }}>
                <FormCell>
                  <TextField
                    required
                    fullWidth
                    size="medium"
                    label="Student full name"
                    value={form.studentFullName}
                    onChange={(e) => setForm({ ...form, studentFullName: e.target.value })}
                    sx={uniformFieldSx}
                  />
                </FormCell>
                <FormCell>
                  <TextField
                    required
                    fullWidth
                    size="medium"
                    label="Mobile number"
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    sx={uniformFieldSx}
                  />
                </FormCell>
                <FormCell>
                  <TextField fullWidth size="medium" label="Father name" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} sx={uniformFieldSx} />
                </FormCell>
                <FormCell>
                  <TextField fullWidth size="medium" label="Mother name" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} sx={uniformFieldSx} />
                </FormCell>
                <FormCell>
                  <TextField fullWidth size="medium" label="Alternate number" value={form.alternateNumber} onChange={(e) => setForm({ ...form, alternateNumber: e.target.value })} sx={uniformFieldSx} />
                </FormCell>
                <FormCell>
                  <TextField fullWidth size="medium" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} sx={uniformFieldSx} />
                </FormCell>
                <FormCell>
                  <TextField select fullWidth size="medium" label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} sx={uniformFieldSx}>
                    {["MALE", "FEMALE", "OTHER"].map((g) => (
                      <MenuItem key={g} value={g}>{g}</MenuItem>
                    ))}
                  </TextField>
                </FormCell>
                <FormCell>
                  <DatePicker
                    format="DD-MM-YYYY"
                    label="Date of birth"
                    value={parseDobString(form.dateOfBirth)}
                    onChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        dateOfBirth: v && v.isValid() ? v.format("YYYY-MM-DD") : "",
                      }))
                    }
                    slotProps={{
                      textField: {
                        ...pickerTextFieldSlots,
                        placeholder: "dd-mm-yyyy",
                        slotProps: {
                          htmlInput: { "aria-label": "Date of birth" },
                        },
                      },
                    }}
                  />
                </FormCell>
                <FormCell>
                  <TextField select fullWidth size="medium" label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} sx={uniformFieldSx} SelectProps={{ displayEmpty: true }}>
                    {INQUIRY_SOURCE_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                  </TextField>
                </FormCell>
              </Grid>
            </Section>

            <Section title="Address">
              <Grid container spacing={2} sx={{ margin: 0, width: "100%" }}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address" multiline rows={2} size="medium" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} sx={multilineFieldSx} />
                </Grid>
                <FormCell>
                  <TextField fullWidth size="medium" label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} sx={uniformFieldSx} />
                </FormCell>
                <FormCell>
                  <TextField fullWidth size="medium" label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} sx={uniformFieldSx} />
                </FormCell>
                <FormCell>
                  <TextField fullWidth size="medium" label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} sx={uniformFieldSx} />
                </FormCell>
              </Grid>
            </Section>

            <Section title="Program interest & history">
              <Grid container spacing={2} sx={{ margin: 0, width: "100%" }}>
                <FormCell>
                  <TextField
                    select
                    fullWidth
                    size="medium"
                    label="Interested class (from master)"
                    value={form.interestedClassId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const c = classes.find((x) => x._id === id);
                      setForm({ ...form, interestedClassId: id, interestedClass: c ? `${c.name} ${c.section}` : form.interestedClass });
                    }}
                    sx={uniformFieldSx}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">—</MenuItem>
                    {classes.map((c) => (
                      <MenuItem key={c._id} value={c._id}>{c.name} — {c.section}</MenuItem>
                    ))}
                  </TextField>
                </FormCell>
                <FormCell>
                  <TextField fullWidth size="medium" label="Interested class (free text)" value={form.interestedClass} onChange={(e) => setForm({ ...form, interestedClass: e.target.value })} sx={uniformFieldSx} />
                </FormCell>
                <FormCell>
                  <TextField fullWidth size="medium" label="Previous school" value={form.previousSchool} onChange={(e) => setForm({ ...form, previousSchool: e.target.value })} sx={uniformFieldSx} />
                </FormCell>
                <FormCell>
                  <DateTimePicker
                    format="DD-MM-YYYY HH:mm"
                    label="Follow-up date"
                    ampm={false}
                    value={parseFollowUpString(form.followUpDate)}
                    onChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        followUpDate: v && v.isValid() ? v.format("YYYY-MM-DDTHH:mm") : "",
                      }))
                    }
                    slotProps={{
                      textField: {
                        ...pickerTextFieldSlots,
                        placeholder: "dd-mm-yyyy hh:mm",
                      },
                      actionBar: { actions: ["clear", "accept"] },
                    }}
                  />
                </FormCell>
                <FormCell>
                  <TextField select fullWidth size="medium" label="Assigned teacher" value={form.assignedTeacherId} onChange={(e) => setForm({ ...form, assignedTeacherId: e.target.value })} sx={uniformFieldSx} SelectProps={{ displayEmpty: true }}>
                    <MenuItem value="">—</MenuItem>
                    {teachers.map((t) => (
                      <MenuItem key={t._id} value={t._id}>{t.userId?.name || `${t.firstName || ""} ${t.lastName || ""}`}</MenuItem>
                    ))}
                  </TextField>
                </FormCell>
                <FormCell>
                  <TextField select fullWidth size="medium" label="Initial status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} sx={uniformFieldSx}>
                    {INQUIRY_STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                  </TextField>
                </FormCell>
                <Grid item xs={12}>
                  <TextField fullWidth size="medium" label="Counselor notes" multiline rows={3} value={form.counselorNotes} onChange={(e) => setForm({ ...form, counselorNotes: e.target.value })} sx={multilineFieldSx} />
                </Grid>
              </Grid>
            </Section>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <Button type="submit" variant="contained" sx={btnSx}>
                Create inquiry
              </Button>
              <Button type="button" variant="outlined" sx={btnSx} onClick={() => nav("/admin/inquiries/all")}>
                Cancel
              </Button>
            </Stack>
          </form>
        </LocalizationProvider>
      </Box>
    </Card>
  );
}
