import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  myInfo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMyInfo(state, action) {
      state.myInfo = action.payload;
    },
    logout(state) {
      state.myInfo = null;
    },
  },
});

export const { setMyInfo, logout } = authSlice.actions;

export const selectMyInfo = (state) => state.auth.myInfo;

export default authSlice.reducer;