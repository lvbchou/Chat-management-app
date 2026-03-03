import { axiosClient } from "./axiosClient";

export const conversationApi = {
  async list({ page = 1, limit = 50, q } = {}) {
    if (!axiosClient.defaults.baseURL) return []; // no REST API -> empty

    return await axiosClient.get("/conversations", { params: { page, limit, q } });
  },

  // backend have API create -> call API
  // if no -> ConversationDetailPage will fallback local.
  async create({ name }) {
    if (!axiosClient.defaults.baseURL) {
      throw new Error("No REST API");
    }
    return await axiosClient.post("/conversations", { name });
  },
};