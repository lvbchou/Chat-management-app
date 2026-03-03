import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../store/authSlice";
import conversationReducer from "../store/conversationSlice";
import messageReducer from "../store/messageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversations: conversationReducer,
    messages: messageReducer,
  },
});