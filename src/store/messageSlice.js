import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  byConvId: {}, // { [convId]: Message[] }
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    appendMessage(state, action) {
      const { convId, message } = action.payload;
      const key = String(convId);
      if (!state.byConvId[key]) state.byConvId[key] = [];
      state.byConvId[key].push(message);
    },
    setMessages(state, action) {
      const { convId, messages } = action.payload;
      state.byConvId[String(convId)] = messages || [];
    },
    clearConversationMessages(state, action) {
      delete state.byConvId[String(action.payload)];
    },
  },
});

export const { appendMessage, setMessages, clearConversationMessages } = messageSlice.actions;

export const selectMessagesByConvId = (state, convId) =>
  state.messages.byConvId[String(convId)] || [];

export default messageSlice.reducer;