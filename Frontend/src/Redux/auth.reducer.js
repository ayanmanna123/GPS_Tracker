import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loding: false,
    usere: null,
    path: null,
    darktheme: false,
  },
  reducers: {
    setLoding: (state, action) => {
      state.loding = action.payload;
    },
    setuser: (state, action) => {
      state.usere = action.payload;
    },
    setpath: (state, action) => {
      state.path = action.payload;
    },
    setdarktheme: (state, action) => {
      state.darktheme = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setLoding, setuser, setpath, setdarktheme } = authSlice.actions;

export default authSlice.reducer;
