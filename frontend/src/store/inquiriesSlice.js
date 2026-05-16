import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { inquiryAdminApi } from "../services/inquiryApi.js";

const initialState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  loading: false,
  error: null,
  filters: {
    search: "",
    status: "",
    interestedClass: "",
    teacherId: "",
    fromDate: "",
    toDate: "",
  },
  analytics: null,
  badge: 0,
  selected: null,
};

export const fetchInquiries = createAsyncThunk("inquiries/fetchList", async (_, { getState }) => {
  const { filters, page, limit } = getState().inquiries;
  return inquiryAdminApi.list({
    page,
    limit,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null)),
  });
});

export const fetchInquiryOne = createAsyncThunk("inquiries/fetchOne", async (id) => {
  return inquiryAdminApi.getOne(id);
});

export const fetchInquiryAnalytics = createAsyncThunk("inquiries/analytics", async () => {
  return inquiryAdminApi.analytics();
});

export const fetchInquiryBadge = createAsyncThunk("inquiries/badge", async () => {
  const data = await inquiryAdminApi.badge();
  return data.pendingFollowUps ?? 0;
});

const inquiriesSlice = createSlice({
  name: "inquiries",
  initialState,
  reducers: {
    setPage: (s, a) => {
      s.page = a.payload;
    },
    setLimit: (s, a) => {
      s.limit = a.payload;
    },
    setFilters: (s, a) => {
      s.filters = { ...s.filters, ...a.payload };
      s.page = 1;
    },
    clearSelected: (s) => {
      s.selected = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchInquiries.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(fetchInquiries.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.items || [];
        s.page = a.payload.page;
        s.limit = a.payload.limit;
        s.total = a.payload.total;
        s.totalPages = a.payload.totalPages;
      })
      .addCase(fetchInquiries.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })
      .addCase(fetchInquiryAnalytics.fulfilled, (s, a) => {
        s.analytics = a.payload;
      })
      .addCase(fetchInquiryBadge.fulfilled, (s, a) => {
        s.badge = a.payload;
      })
      .addCase(fetchInquiryOne.fulfilled, (s, a) => {
        s.selected = a.payload;
      });
  },
});

export const { setPage, setLimit, setFilters, clearSelected } = inquiriesSlice.actions;
export default inquiriesSlice.reducer;
