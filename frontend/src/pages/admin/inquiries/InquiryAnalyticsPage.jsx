import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Typography, Box, Stack, Skeleton, LinearProgress } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchInquiryAnalytics } from "../../../store/inquiriesSlice";
import { CHART_CARD_SX } from "./inquiryUiShared";

const COLORS = ["#1d4ed8", "#0ea5e9", "#f97316", "#22c55e", "#a855f7", "#64748b"];

const STAT_ACCENTS = {
  total: "#1d4ed8",
  pending: "#f59e0b",
  followUp: "#0284c7",
  dropped: "#dc2626",
  converted: "#16a34a",
};

function StatCard({ title, value, sub, accent }) {
  return (
    <Card sx={{ p: 2.25, height: "100%", position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent, borderRadius: "0 2px 2px 0" }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.02 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em", mt: 0.5 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
          {sub}
        </Typography>
      )}
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" useFlexGap>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} sx={{ flex: "1 1 140px", minWidth: 140 }}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Stack>
      <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
    </Stack>
  );
}

export default function InquiryAnalyticsPage() {
  const dispatch = useDispatch();
  const analytics = useSelector((s) => s.inquiries.analytics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    dispatch(fetchInquiryAnalytics())
      .unwrap()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          Inquiry analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 620 }}>
          Funnel snapshot, intake trends by month, pipeline mix by source, and assignment outcomes.
        </Typography>
      </Box>

      {loading && (
        <>
          <LinearProgress sx={{ mb: 2, height: 3, borderRadius: 2 }} />
          <AnalyticsSkeleton />
        </>
      )}
      {!loading && !analytics && (
        <Typography color="text.secondary" sx={{ py: 4 }}>
          Could not load analytics. Refresh or try again later.
        </Typography>
      )}
      {!loading && analytics && (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
            <Box sx={{ flex: "1 1 140px", minWidth: 140 }}>
              <StatCard title="Total" value={analytics.total} accent={STAT_ACCENTS.total} />
            </Box>
            <Box sx={{ flex: "1 1 140px", minWidth: 140 }}>
              <StatCard title="Pending" value={analytics.pending} accent={STAT_ACCENTS.pending} />
            </Box>
            <Box sx={{ flex: "1 1 140px", minWidth: 140 }}>
              <StatCard title="Follow up" value={analytics.followUp} accent={STAT_ACCENTS.followUp} />
            </Box>
            <Box sx={{ flex: "1 1 140px", minWidth: 140 }}>
              <StatCard title="Dropped" value={analytics.dropped} accent={STAT_ACCENTS.dropped} />
            </Box>
            <Box sx={{ flex: "1 1 160px", minWidth: 160 }}>
              <StatCard
                title="Converted"
                value={analytics.converted}
                sub={`Conversion rate ${analytics.conversionRatio}%`}
                accent={STAT_ACCENTS.converted}
              />
            </Box>
          </Stack>

          <Stack spacing={2}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
              }}
            >
              <Card sx={CHART_CARD_SX}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Monthly inquiries
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  New inquiries recorded per calendar month.
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analytics.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(15,23,42,0.12)" }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(15,23,42,0.12)" }} />
                    <RTooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#1d4ed8" name="Count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card sx={CHART_CARD_SX}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Source split
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  Where leads originated.
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={analytics.bySource || []}
                      dataKey="count"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      labelLine={{ stroke: "rgba(15,23,42,0.2)" }}
                      label={({ source, percent }) =>
                        source != null && percent != null ? `${source} ${(percent * 100).toFixed(0)}%` : ""
                      }
                    >
                      {(analytics.bySource || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
                      ))}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Box>

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              <Card sx={CHART_CARD_SX}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Inquiry volume trend
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  Same monthly series as a line view for pacing.
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={analytics.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                    <RTooltip />
                    <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: "#16a34a" }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card sx={CHART_CARD_SX}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Teacher performance (assigned)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  Assigned load versus successful conversions.
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.teacherPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <RTooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#64748b" name="Assigned" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="converted" fill="#22c55e" name="Converted" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Box>
          </Stack>
        </>
      )}
    </Box>
  );
}
