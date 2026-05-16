import { useEffect, useState, useCallback } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  TablePagination,
  Chip,
  Box,
  Stack,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { Eye } from "lucide-react";
import { inquiryTheme } from "../../theme/inquiryMuiTheme";
import { inquiryTeacherApi } from "../../services/inquiryApi";
import toast from "react-hot-toast";
import { statusChipColor } from "../admin/inquiries/inquiryConstants";
import { TABLE_CONTAINER_SX } from "../admin/inquiries/inquiryUiShared";
import InquiryDetailDrawer from "../admin/inquiries/InquiryDetailDrawer";
import { usePlatformSettings } from "../../hooks/usePlatformSettings";

export default function TeacherInquiriesPage() {
  const { formatDate } = usePlatformSettings();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [detail, setDetail] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inquiryTeacherApi.list({ page, limit });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (row) => {
    try {
      const full = await inquiryTeacherApi.getOne(row._id);
      setDetail(full);
      setOpen(true);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <ThemeProvider theme={inquiryTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: "background.default", minHeight: "100%", pb: 4, px: { xs: 2, md: 3 }, maxWidth: 1320, mx: "auto" }}>
        {loading && <LinearProgress sx={{ mb: 2, height: 3, borderRadius: 2 }} />}
        <Card sx={{ p: 0, overflow: "hidden" }}>
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5} alignItems={{ sm: "center" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  My assigned inquiries
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Open a record to update status, log follow-ups, and add comments.
                </Typography>
              </Box>
              <Chip label={`${total.toLocaleString()} assigned`} size="small" sx={{ fontWeight: 700, alignSelf: { xs: "flex-start", sm: "center" } }} />
            </Stack>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ ...TABLE_CONTAINER_SX }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Class</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Follow-up</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading && items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 6, textAlign: "center", borderBottom: "none" }}>
                        <Typography variant="body2" color="text.secondary">
                          No inquiries assigned yet. When admin assigns leads, they will appear here.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    items.map((r) => (
                      <TableRow key={r._id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "primary.dark" }}>{r.inquiryId}</TableCell>
                        <TableCell>{r.studentFullName}</TableCell>
                        <TableCell>{r.mobileNumber}</TableCell>
                        <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{r.interestedClass}</TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" }, color: "text.secondary" }}>
                          {formatDate(r.followUpDate)}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={r.status?.replace(/_/g, " ")} color={statusChipColor(r.status)} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Open details">
                            <IconButton size="small" color="primary" onClick={() => openDetail(r)} aria-label="Open inquiry">
                              <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page - 1}
              rowsPerPage={limit}
              onPageChange={(_, p) => setPage(p + 1)}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              sx={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}
            />
          </Box>
        </Card>

        <InquiryDetailDrawer
          open={open}
          onClose={() => setOpen(false)}
          row={detail}
          isTeacher
          classesForConvert={[]}
          onRefresh={async () => {
            await load();
            if (detail?._id) {
              const full = await inquiryTeacherApi.getOne(detail._id);
              setDetail(full);
            }
          }}
        />
      </Box>
    </ThemeProvider>
  );
}
