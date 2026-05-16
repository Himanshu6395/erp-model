import {
  Drawer,
  Box,
  Typography,
  Divider,
  Stack,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { X } from "lucide-react";
import { INQUIRY_STATUS_OPTIONS, formatTeacherLabel } from "./inquiryConstants";
import { inquiryAdminApi } from "../../../services/inquiryApi";
import { inquiryTeacherApi } from "../../../services/inquiryApi";
import toast from "react-hot-toast";
import { useState } from "react";
import { adminService } from "../../../services/adminService";
import { FILTER_FIELD_SX } from "./inquiryUiShared";
import { usePlatformSettings } from "../../../hooks/usePlatformSettings";

function headerStatusChipSx(status) {
  switch (status) {
    case "PENDING":
      return { bgcolor: "rgba(251,191,36,0.95)", color: "#0f172a", borderColor: "rgba(15,23,42,0.12)" };
    case "FOLLOW_UP":
      return { bgcolor: "rgba(125,211,252,0.95)", color: "#0f172a", borderColor: "rgba(15,23,42,0.12)" };
    case "DROPPED":
      return { bgcolor: "rgba(252,165,165,0.98)", color: "#450a0a", borderColor: "rgba(185,28,28,0.25)" };
    case "CONVERTED_TO_ADMISSION":
      return { bgcolor: "rgba(134,239,172,0.98)", color: "#052e16", borderColor: "rgba(22,163,74,0.3)" };
    default:
      return { bgcolor: "rgba(255,255,255,0.22)", color: "#fff", borderColor: "rgba(255,255,255,0.45)" };
  }
}

function SectionCard({ title, children }) {
  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 0.06, display: "block", mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function InquiryDetailDrawer({
  open,
  onClose,
  row,
  isTeacher,
  onRefresh,
  classesForConvert = [],
}) {
  const { formatDate, formatDateTime } = usePlatformSettings();
  const [statusDlg, setStatusDlg] = useState(false);
  const [assignDlg, setAssignDlg] = useState(false);
  const [convertDlg, setConvertDlg] = useState(false);
  const [fuDlg, setFuDlg] = useState(false);
  const [cmt, setCmt] = useState("");
  const [nextStatus, setNextStatus] = useState("PENDING");
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [classIdConvert, setClassIdConvert] = useState("");
  const [followForm, setFollowForm] = useState({ followUpDate: "", remarks: "", nextAction: "" });

  if (!row) return null;

  const patchStatus = isTeacher ? inquiryTeacherApi.patchStatus : inquiryAdminApi.patchStatus;
  const addFollowUp = isTeacher ? inquiryTeacherApi.followUp : inquiryAdminApi.followUp;
  const addComment = isTeacher ? inquiryTeacherApi.comment : inquiryAdminApi.comment;

  const openAssign = async () => {
    if (!isTeacher) {
      try {
        const data = await adminService.getTeachers({ page: 1, limit: 200 });
        setTeachers(data.items || data || []);
      } catch {
        setTeachers([]);
      }
    }
    setAssignTeacherId(row.assignedTeacherId?._id || row.assignedTeacherId || "");
    setAssignDlg(true);
  };

  const timeline = [...(row.statusHistory || [])].reverse();

  const printInquiry = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Inquiry ${row.inquiryId}</title></head><body style="font-family:sans-serif;padding:24px">`);
    w.document.write(`<h1>Inquiry ${row.inquiryId}</h1>`);
    w.document.write(`<p><strong>Student:</strong> ${row.studentFullName}</p>`);
    w.document.write(`<p><strong>Mobile:</strong> ${row.mobileNumber}</p><p><strong>Status:</strong> ${row.status}</p>`);
    w.document.write(`<pre>${JSON.stringify(row, null, 2)}</pre>`);
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    w.print();
  };

  const handleAssignSave = async () => {
    try {
      await inquiryAdminApi.assignTeacher(row._id, assignTeacherId);
      toast.success("Teacher assigned");
      setAssignDlg(false);
      onRefresh?.();
    } catch (e) {
      toast.error(e.message || "Failed");
    }
  };

  const handleConvertSave = async () => {
    try {
      const res = await inquiryAdminApi.convert(row._id, { classId: classIdConvert });
      const em = res?.studentCredentials?.email || "";
      const pw = res?.studentCredentials?.temporaryPassword || "";
      toast.success(
        pw && pw !== "***" ? `Converted. Login ${em} / temp password: ${pw}` : `Converted. Student login: ${em}`
      );
      setConvertDlg(false);
      onRefresh?.();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Conversion failed");
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 480, md: 540 },
            display: "flex",
            flexDirection: "column",
            bgcolor: "#eef2f7",
          },
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 52%, #2563eb 100%)",
            color: "#fff",
            px: 2.5,
            py: 2.25,
            boxShadow: "0 10px 30px rgba(29,78,216,0.25)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box sx={{ minWidth: 0, pr: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.85, letterSpacing: 0.06, fontWeight: 700 }}>
                INQUIRY
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 0.25 }}>
                {row.studentFullName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mt: 0.5 }}>
                {row.inquiryId}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Chip
                size="small"
                label={row.status?.replace(/_/g, " ")}
                variant="outlined"
                sx={{ fontWeight: 700, "& .MuiChip-label": { px: 1 }, ...headerStatusChipSx(row.status) }}
              />
              <IconButton size="small" onClick={onClose} sx={{ color: "#fff", opacity: 0.95 }} aria-label="Close">
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto", px: 2, py: 2 }}>
          <SectionCard title="Parents & contact">
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Father: <strong>{row.fatherName || "—"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Mother: <strong>{row.motherName || "—"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Mobile: <strong>{row.mobileNumber}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Alt: {row.alternateNumber || "—"}
            </Typography>
            <Typography variant="body2">Email: {row.email || "—"}</Typography>
          </SectionCard>

          <SectionCard title="Address & class">
            <Typography variant="body2" sx={{ mb: 0.75 }}>
              {row.address || "—"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              {[row.city, row.state, row.pincode].filter(Boolean).join(", ") || "—"}
            </Typography>
            <Typography variant="body2">Interested class: {row.interestedClass || "—"}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Previous school: {row.previousSchool || "—"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Source: {row.source}
            </Typography>
          </SectionCard>

          <SectionCard title="Counseling">
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {row.counselorNotes || "—"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.25, pt: 1.25, borderTop: "1px dashed rgba(15,23,42,0.12)" }}>
              Follow-up: {formatDateTime(row.followUpDate)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Assigned: {formatTeacherLabel(row.assignedTeacherId)}
            </Typography>
          </SectionCard>

          <SectionCard title="Follow-up history">
            {(row.followUps || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No follow-ups logged yet.
              </Typography>
            ) : (
              <List dense disablePadding sx={{ mt: -0.5 }}>
                {(row.followUps || []).map((f) => (
                  <ListItem key={f._id || f.createdAt} disableGutters sx={{ alignItems: "flex-start", py: 0.75 }}>
                    <ListItemText
                      primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: "caption", component: "div" }}
                      primary={formatDateTime(f.followUpDate)}
                      secondary={`${f.remarks || ""} ${f.nextAction ? `→ ${f.nextAction}` : ""}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>

          <SectionCard title="Status timeline">
            {(timeline.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No status changes recorded.
              </Typography>
            ) : (
              <List dense disablePadding>
                {timeline.map((h, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                    <ListItemText primary={h.status?.replace(/_/g, " ")} secondary={formatDateTime(h.changedAt)} />
                  </ListItem>
                ))}
              </List>
            ))}
          </SectionCard>

          <SectionCard title="Comments">
            {(row.comments || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No comments yet.
              </Typography>
            ) : (
              <List dense disablePadding>
                {(row.comments || []).map((c) => (
                  <ListItem key={c._id} disableGutters sx={{ py: 0.75 }}>
                    <ListItemText primary={c.text} secondary={formatDateTime(c.createdAt)} />
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            borderTop: "1px solid rgba(15,23,42,0.1)",
            bgcolor: "#fff",
            px: 2,
            py: 2,
            boxShadow: "0 -8px 24px rgba(15,23,42,0.06)",
          }}
        >
          <Stack spacing={1.25}>
            {!isTeacher && (
              <>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button fullWidth variant="contained" onClick={() => setStatusDlg(true)}>
                    Update status
                  </Button>
                  <Button fullWidth variant="outlined" onClick={openAssign} sx={{ borderColor: "rgba(15,23,42,0.15)" }}>
                    Assign teacher
                  </Button>
                </Stack>
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  disabled={row.status === "CONVERTED_TO_ADMISSION"}
                  onClick={() => setConvertDlg(true)}
                >
                  Convert to admission
                </Button>
              </>
            )}
            {isTeacher && (
              <Button fullWidth variant="contained" onClick={() => setStatusDlg(true)}>
                Update status
              </Button>
            )}
            <Button fullWidth variant="outlined" onClick={() => setFuDlg(true)} sx={{ borderColor: "rgba(15,23,42,0.15)" }}>
              Add follow-up
            </Button>
            <TextField
              size="small"
              label="Add a comment"
              fullWidth
              multiline
              rows={2}
              value={cmt}
              onChange={(e) => setCmt(e.target.value)}
              sx={FILTER_FIELD_SX}
            />
            <Button
              variant="text"
              onClick={async () => {
                try {
                  await addComment(row._id, cmt.trim());
                  setCmt("");
                  toast.success("Comment added");
                  onRefresh?.();
                } catch (e) {
                  toast.error(e.message || "Failed");
                }
              }}
            >
              Post comment
            </Button>
            <Stack direction="row" spacing={1} justifyContent="space-between">
              {!isTeacher && (
                <Button size="small" onClick={printInquiry}>
                  Print
                </Button>
              )}
              <Button size="small" onClick={onClose} sx={{ ml: !isTeacher ? "auto !important" : 0 }}>
                Close
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>

      <Dialog open={statusDlg} onClose={() => setStatusDlg(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Change status</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            sx={{ mt: 1, ...FILTER_FIELD_SX }}
            label="Status"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value)}
          >
            {(isTeacher ? INQUIRY_STATUS_OPTIONS.filter((o) => o.value !== "CONVERTED_TO_ADMISSION") : INQUIRY_STATUS_OPTIONS).map(
              (o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              )
            )}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDlg(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                await patchStatus(row._id, { status: nextStatus });
                toast.success("Status updated");
                setStatusDlg(false);
                onRefresh?.();
              } catch (e) {
                toast.error(e.response?.data?.message || e.message);
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignDlg} onClose={() => setAssignDlg(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign teacher</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            sx={{ mt: 2, ...FILTER_FIELD_SX }}
            label="Teacher"
            value={assignTeacherId}
            onChange={(e) => setAssignTeacherId(e.target.value)}
          >
            {teachers.map((t) => (
              <MenuItem key={t._id || t.id} value={t._id || t.id}>
                {t.userId?.name || `${t.firstName || ""} ${t.lastName || ""}` || t.email}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={convertDlg} onClose={() => setConvertDlg(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Convert to admission</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1, mb: 2, color: "text.secondary" }}>
            Select class (required if inquiry has no matched class). A student login will be created; share credentials from the success message.
          </Typography>
          <TextField select fullWidth label="Class" value={classIdConvert} onChange={(e) => setClassIdConvert(e.target.value)} sx={FILTER_FIELD_SX}>
            {classesForConvert.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name} — {c.section}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConvertDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConvertSave} disabled={!classIdConvert}>
            Convert
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={fuDlg} onClose={() => setFuDlg(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Follow-up</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Follow-up date"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={followForm.followUpDate}
              onChange={(e) => setFollowForm((p) => ({ ...p, followUpDate: e.target.value }))}
              sx={FILTER_FIELD_SX}
            />
            <TextField
              label="Remarks"
              fullWidth
              multiline
              rows={2}
              value={followForm.remarks}
              onChange={(e) => setFollowForm((p) => ({ ...p, remarks: e.target.value }))}
              sx={FILTER_FIELD_SX}
            />
            <TextField
              label="Next action"
              fullWidth
              value={followForm.nextAction}
              onChange={(e) => setFollowForm((p) => ({ ...p, nextAction: e.target.value }))}
              sx={FILTER_FIELD_SX}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFuDlg(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!followForm.followUpDate}
            onClick={async () => {
              try {
                await addFollowUp(row._id, {
                  followUpDate: new Date(followForm.followUpDate).toISOString(),
                  remarks: followForm.remarks,
                  nextAction: followForm.nextAction,
                });
                toast.success("Follow-up saved");
                setFuDlg(false);
                onRefresh?.();
              } catch (e) {
                toast.error(e.response?.data?.message || e.message);
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
