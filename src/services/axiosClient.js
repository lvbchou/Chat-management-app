import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "", // nếu bạn có API REST
  timeout: 30000,
});

axiosClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // throw message gọn
    throw err?.response?.data || err;
  }
);