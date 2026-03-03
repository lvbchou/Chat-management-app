import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { conversationApi } from "../services/conversationApi";

const normalizeId = (raw) =>
  String(raw?.id ?? raw?._id ?? raw?.conversation_id ?? raw?.conversationId ?? "");

const normalizeName = (raw, fallbackName) =>
  raw?.name ?? raw?.title ?? raw?.conversation_name ?? fallbackName ?? "Conversation";

const mapListItems = (res) => res?.items ?? res?.data ?? res ?? [];
const mapCreatedItem = (res) => res?.item ?? res?.data ?? res;

// fetch
export const fetchConversations = createAsyncThunk(
  "conversations/fetch",
  async ({ page = 1, limit = 50, q } = {}, { rejectWithValue }) => {
    try {
      const res = await conversationApi.list({ page, limit, q });
      const items = mapListItems(res);

      const normalized = items
        .map((raw) => {
          const id = normalizeId(raw);
          if (!id) return null;

          const ms =
            Date.parse(
              raw?.updatedAt ??
                raw?.updated_at ??
                raw?.createdAt ??
                raw?.created_at ??
                ""
            ) || 0;

          return {
            id,
            name: normalizeName(raw, `Conversation ${id}`),
            lastBotReplyAt: ms ? new Date(ms).toLocaleString() : "-",
            lastBotReplyAtMs: ms,
            raw,
          };
        })
        .filter(Boolean)
        .sort((a, b) => (b.lastBotReplyAtMs || 0) - (a.lastBotReplyAtMs || 0));

      return normalized;
    } catch (e) {
      return rejectWithValue("fetch conversations failed");
    }
  }
);

/* ===============================
   CREATE
================================ */
export const createConversation = createAsyncThunk(
  "conversations/create",
  async ({ name }, { rejectWithValue }) => {
    try {
      if (typeof conversationApi.create !== "function") {
        throw new Error("No create API");
      }

      const res = await conversationApi.create({ name });
      const created = mapCreatedItem(res);

      const id = normalizeId(created);
      if (!id) throw new Error("create returned empty id");

      const ms =
        Date.parse(created?.updatedAt ?? created?.updated_at ?? "") ||
        Date.now();

      return {
        id,
        name: normalizeName(created, name),
        lastBotReplyAt: "-",
        lastBotReplyAtMs: ms,
        raw: created,
      };
    } catch (e) {
      return rejectWithValue("create failed");
    }
  }
);

// rename API
export const renameConversation = createAsyncThunk(
  "conversations/rename",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      if (typeof conversationApi.update !== "function") {
        // nếu backend chưa có API rename thì chỉ local
        return { id, name };
      }

      await conversationApi.update(id, { name });
      return { id, name };
    } catch (e) {
      return rejectWithValue("rename failed");
    }
  }
);

/* ===============================
   OPTIONAL: DELETE API
================================ */
export const deleteConversation = createAsyncThunk(
  "conversations/delete",
  async (id, { rejectWithValue }) => {
    try {
      if (typeof conversationApi.delete !== "function") {
        return id;
      }

      await conversationApi.delete(id);
      return id;
    } catch (e) {
      return rejectWithValue("delete failed");
    }
  }
);

// slice
const conversationSlice = createSlice({
  name: "conversations",
  initialState: {
    items: [],
    loading: false,
    error: null,
    query: "",
  },
  reducers: {
    setQuery(state, action) {
      state.query = action.payload ?? "";
    },

    addLocalConversation(state, action) {
      const conv = action.payload;
      state.items = [conv, ...state.items].sort(
        (a, b) => (b.lastBotReplyAtMs || 0) - (a.lastBotReplyAtMs || 0)
      );
    },

    updateLastBotReply(state, action) {
      const { convId, lastBotReplyAt, lastBotReplyAtMs } = action.payload;

      state.items = state.items
        .map((c) =>
          String(c.id) !== String(convId)
            ? c
            : {
                ...c,
                lastBotReplyAt: lastBotReplyAt ?? c.lastBotReplyAt,
                lastBotReplyAtMs: lastBotReplyAtMs ?? c.lastBotReplyAtMs,
              }
        )
        .sort((a, b) => (b.lastBotReplyAtMs || 0) - (a.lastBotReplyAtMs || 0));
    },

    // local rename
    updateConversationName(state, action) {
      const { id, name } = action.payload;

      state.items = state.items.map((c) =>
        String(c.id) === String(id)
          ? { ...c, name: name ?? c.name }
          : c
      );
    },

    /* ✅ LOCAL DELETE */
    removeConversation(state, action) {
      const id = String(action.payload);
      state.items = state.items.filter((c) => String(c.id) !== id);
    },

    mergeFromApi(state, action) {
      const apiList = action.payload || [];
      const prevMap = new Map(state.items.map((c) => [String(c.id), c]));

      const merged = apiList.map((n) => {
        const old = prevMap.get(String(n.id));
        if (!old) return n;

        if ((old.lastBotReplyAtMs || 0) > (n.lastBotReplyAtMs || 0))
          return { ...n, ...old };

        return { ...old, ...n };
      });

      const ids = new Set(merged.map((x) => String(x.id)));
      state.items.forEach((c) => {
        if (!ids.has(String(c.id))) merged.push(c);
      });

      state.items = merged.sort(
        (a, b) => (b.lastBotReplyAtMs || 0) - (a.lastBotReplyAtMs || 0)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        conversationSlice.caseReducers.mergeFromApi(state, action);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "error";
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items].sort(
          (a, b) => (b.lastBotReplyAtMs || 0) - (a.lastBotReplyAtMs || 0)
        );
      })
      .addCase(renameConversation.fulfilled, (state, action) => {
        conversationSlice.caseReducers.updateConversationName(
          state,
          action
        );
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        conversationSlice.caseReducers.removeConversation(
          state,
          action
        );
      });
  },
});

export const {
  setQuery,
  addLocalConversation,
  updateLastBotReply,
  mergeFromApi,
  updateConversationName,
  removeConversation,
} = conversationSlice.actions;

export const selectConversations = (state) =>
  state.conversations.items;

export const selectConversationsLoading = (state) =>
  state.conversations.loading;

export const selectConversationQuery = (state) =>
  state.conversations.query;

export default conversationSlice.reducer;