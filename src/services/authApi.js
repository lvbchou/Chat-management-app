import { axiosClient } from "./axiosClient";

export const authApi = {
  // Nếu bạn có API thật thì sửa endpoint tại đây
  async login({ username, password }) {
    // thử call API thật
    try {
      if (axiosClient.defaults.baseURL) {
        return await axiosClient.post("/login", { username, password });
      }
    } catch (e) {
      // ignore -> fallback fake
    }

    // FAKE login
    return {
      name: username || "User",
      username: username || "user",
      email: `${username || "user"}@gmail.com`,
      role: "admin",
    };
  },
};