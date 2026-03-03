import { axiosClient } from "./axiosClient";

/**
 * Bạn đang dùng "Kết nối API lấy danh sách conversation thật"
 * => list() sẽ call API nếu có baseURL, nếu không có thì trả []
 */
export const conversationApi = {
  async list({ page = 1, limit = 50, q } = {}) {
    if (!axiosClient.defaults.baseURL) return []; // không có REST API thì empty

    // chỉnh endpoint tuỳ backend của bạn
    return await axiosClient.get("/conversations", { params: { page, limit, q } });
  },

  // Nếu backend của bạn có create thì bật lại.
  // Nếu không có -> ConversationDetailPage sẽ fallback local.
  async create({ name }) {
    if (!axiosClient.defaults.baseURL) {
      throw new Error("No REST API");
    }
    return await axiosClient.post("/conversations", { name });
  },
};