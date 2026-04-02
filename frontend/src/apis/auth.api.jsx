import axios from "axios";
import {API_ENDPOINTS} from "../api/axiosInstance.jsx"

export const userRegister = async (data) => {
  try {
    console.log("data:", data);

    const res = await axios.post(`${API_ENDPOINTS.AUTH}/register`, data);

    return res.data;
  } catch (error) {
    console.error("Register API Error:", error);
    throw error;
  }
};

export const userLogin=async(data)=>{
  try{
    console.log("njnjnjj",data)
    const res = await axios.post(`${API_ENDPOINTS.AUTH}/login`, data);
    return res.data;
  }
  catch (error) {
    console.error("Register API Error:", error);
    throw error;
  }}