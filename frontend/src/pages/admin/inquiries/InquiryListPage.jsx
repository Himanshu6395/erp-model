import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchInquiries, setPage, setLimit, setFilters, fetchInquiryOne } from "../../../store/inquiriesSlice";
import { usePlatformSettings } from "../../../hooks/usePlatformSettings";
import { inquiryAdminApi } from "../../../services/inquiryApi";
import { adminService } from "../../../services/adminService";
import { INQUIRY_STATUS_OPTIONS, statusChipColor, formatTeacherLabel } from "./inquiryConstants";
import { FILTER_FIELD_SX, TABLE_CONTAINER_SX } from "./inquiryUiShared";
import InquiryDetailDrawer from "./InquiryDetailDrawer";

export default function InquiryListPage() {
  const { formatDate } = usePlatformSettings();
  const dispatch = useDispatch();
  const { items, loading, total, page, limit, filters } = useSelector((s) => s.inquiries);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachersSel, setTeachersSel] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const reload = useCallback(() => {
    dispatch(fetchInquiries());
  }, [dispatch]);

  useEffect(() => {
    reload();
  }, [reload, page, limit]);

  useEffect(() => {
    adminService.getClasses().then((data) => setClasses(Array.isArray(data) ? data : data?.items || []));
    adminService.getTeachers({ page: 1, limit: 500 }).then((d) => setTeachersSel(d.items || []));
  }, []);

  const openDetail = async (row) => {
    try {
      const full = await inquiryAdminApi.getOne(row._id);
      setDetailRow(full);
      dispatch(fetchInquiryOne(row._id));
      setDrawerOpen(true);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await inquiryAdminApi.exportCsv(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "inquiries.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const openEdit = (row) => {
    setEditForm({
      studentFullName: row.studentFullName || "",
      fatherName: row.fatherName || "",
      motherName: row.motherName || "",
      mobileNumber: row.mobileNumber || "",
      alternateNumber: row.alternateNumber || "",
      email: row.email || "",
      gender: row.gender || "OTHER",
      address: row.address || "",
      city: row.city || "",
      state: row.state || "",
      pincode: row.pincode || "",
      interestedClass: row.interestedClass || "",
      previousSchool: row.previousSchool || "",
      source: row.source || "WALK_IN",
      counselorNotes: row.counselorNotes || "",
    });
    setEditOpen(true);
    setDetailRow(row);
  };

  const saveEdit = async () => {
    try {
      await inquiryAdminApi.update(detailRow._id, editForm);
      toast.success("Saved");
      setEditOpen(false);
      reload();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <>
      <Card sx={{ p: 0, overflow: "hidden" }}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: "1px solid rgba(15,23,42,0.08)",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} spacing={1.5}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                All inquiries
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search, filter, and manage the full pipeline. Export matches current filters.
              </Typography>
            </Box>
            <Chip
              label={`${total.toLocaleString()} total`}
              size="small"
              sx={{ alignSelf: { xs: "flex-start", sm: "center" }, fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText" }}
            />
          </Stack>
        </Box>

        <Box sx={{ p: 2.5, pb: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: "grey.50",
              borderColor: "rgba(15,23,42,0.08)",
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.06, display: "block", mb: 1.5 }}>
              Filters
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.75} flexWrap="wrap" useFlexGap>
              <TextField
                size="small"
                label="Search"
                value={filters.search}
                onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                sx={{ flex: "1 1 200px", minWidth: 180, ...FILTER_FIELD_SX }}
              />
              <TextField
                size="small"
                select
                label="Status"
                sx={{ flex: "1 1 140px", minWidth: 140, ...FILTER_FIELD_SX }}
                value={filters.status || ""}
                onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                {INQUIRY_STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Class filter"
                value={filters.interestedClass || ""}
                onChange={(e) => dispatch(setFilters({ interestedClass: e.target.value }))}
                sx={{ flex: "1 1 120px", minWidth: 100, ...FILTER_FIELD_SX }}
              />
              <TextField
                size="small"
                select
                label="Teacher"
                sx={{ flex: "1 1 180px", minWidth: 160, ...FILTER_FIELD_SX }}
                value={filters.teacherId || ""}
                onChange={(e) => dispatch(setFilters({ teacherId: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                {teachersSel.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {formatTeacherLabel(t)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="From"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.fromDate || ""}
                onChange={(e) => dispatch(setFilters({ fromDate: e.target.value }))}
                sx={{ flex: "1 1 150px", minWidth: 140, ...FILTER_FIELD_SX }}
              />
              <TextField
                size="small"
                label="To"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.toDate || ""}
                onChange={(e) => dispatch(setFilters({ toDate: e.target.value }))}
                sx={{ flex: "1 1 150px", minWidth: 140, ...FILTER_FIELD_SX }}
              />
              <Stack direction="row" spacing={1} sx={{ flex: "1 1 100%", flexWrap: "wrap", pt: { xs: 0.5, md: 0 } }}>
                <Button variant="contained" onClick={() => reload()}>
                  Apply filters
                </Button>
                <Button
                  startIcon={<Download className="h-[18px] w-[18px]" aria-hidden />}
                  variant="outlined"
                  onClick={handleExport}
                  sx={{ borderColor: "rgba(15,23,42,0.15)" }}
                >
                  Export CSV
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Box sx={{ position: "relative" }}>
            {loading && (
              <LinearProgress
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                  height: 3,
                  borderRadius: "2px 2px 0 0",
                }}
              />
            )}
            <TableContainer component={Paper} variant="outlined" sx={TABLE_CONTAINER_SX}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Inquiry ID</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Class</TableCell>
                    <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>Teacher</TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Follow-up</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading &&
                    items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} sx={{ py: 6, textAlign: "center", borderBottom: "none" }}>
                          <Typography color="text.secondary" variant="body2">
                            No inquiries match these filters. Try adjusting dates or clearing status.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  {!loading &&
                    items.map((r) => (
                      <TableRow key={r._id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "primary.dark" }}>
                          {r.inquiryId}
                        </TableCell>
                        <TableCell>{r.studentFullName}</TableCell>
                        <TableCell>{r.mobileNumber}</TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.interestedClass}</TableCell>
                        <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>{formatTeacherLabel(r.assignedTeacherId)}</TableCell>
                        <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                          {formatDate(r.followUpDate)}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={r.status?.replace(/_/g, " ")} color={statusChipColor(r.status)} />
                        </TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" }, color: "text.secondary" }}>
                          {formatDate(r.createdAt)}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => openDetail(r)} sx={{ color: "primary.main" }}>
                              <Eye className="h-[18px] w-[18px]" aria-hidden strokeWidth={1.75} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(r)}>
                              <Pencil className="h-[18px] w-[18px]" aria-hidden strokeWidth={1.75} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              disabled={r.status === "CONVERTED_TO_ADMISSION"}
                              onClick={async () => {
                                if (!confirm("Delete inquiry?")) return;
                                try {
                                  await inquiryAdminApi.remove(r._id);
                                  toast.success("Deleted");
                                  reload();
                                } catch (e) {
                                  toast.error(e.response?.data?.message || e.message);
                                }
                              }}
                            >
                              <Trash2 className="h-[18px] w-[18px]" aria-hidden strokeWidth={1.75} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            rowsPerPage={limit}
            onPageChange={(_, p) => dispatch(setPage(p + 1))}
            onRowsPerPageChange={(e) => {
              dispatch(setLimit(parseInt(e.target.value, 10)));
              dispatch(setPage(1));
            }}
            sx={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}
          />
        </Box>
      </Card>

      <InquiryDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        row={detailRow}
        isTeacher={false}
        onRefresh={async () => {
          reload();
          if (detailRow?._id) {
            const full = await inquiryAdminApi.getOne(detailRow._id);
            setDetailRow(full);
          }
        }}
        classesForConvert={classes}
      />

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Edit inquiry</DialogTitle>
        <DialogContent dividers>
          {editForm && (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <TextField fullWidth label="Student full name" value={editForm.studentFullName} onChange={(e) => setEditForm({ ...editForm, studentFullName: e.target.value })} />
              <TextField fullWidth label="Mobile" value={editForm.mobileNumber} onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })} />
              <TextField fullWidth label="Father name" value={editForm.fatherName} onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })} />
              <TextField fullWidth label="Mother name" value={editForm.motherName} onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })} />
              <TextField fullWidth label="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <TextField fullWidth label="Interested class (label)" value={editForm.interestedClass} onChange={(e) => setEditForm({ ...editForm, interestedClass: e.target.value })} />
              <TextField fullWidth multiline rows={3} label="Counselor notes" value={editForm.counselorNotes} onChange={(e) => setEditForm({ ...editForm, counselorNotes: e.target.value })} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
