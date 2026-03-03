import { axiosClient } from "./axiosClient";

export const authApi = {
  // have API -> create endpoint
  async login({ username, password }) {
    // try auth API
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