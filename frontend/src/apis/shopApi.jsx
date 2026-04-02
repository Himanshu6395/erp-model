import axios from "axios";
import { API_ENDPOINTS } from "../api/axiosInstance";

/**
 * 🔹 Get Filters (category, price, search config)
 */
export const getShopFilters = async () => {
  try {
    const res = await axios.get(`${API_ENDPOINTS.PRODUCTS}/filters`);
    return res.data;
  } catch (error) {
    console.error("Get Filters API Error:", error);
    throw error;
  }
};

/**
 * 🔹 Get Products (with filters)
 * @param {Object} params { search, category, price }
 */
export const getShopProducts = async (params) => {
  try {
    const res = await axios.get(
      `${API_ENDPOINTS.PRODUCTS}`,
      { params }
    );
    return res.data;
  } catch (error) {
    console.error("Get Products API Error:", error);
    throw error;
  }
};
