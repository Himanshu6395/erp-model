import axios from "axios";
import {store} from "../store/store.js";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://43.205.113.119:5000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});