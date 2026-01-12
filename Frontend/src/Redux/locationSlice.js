// store/locationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const locationSlice = createSlice({
  name: "location",
  initialState: {
    activeBusIDs: [],
  },
  reducers: {
    addActiveBus(state, action) {
      const busId = action.payload;
      if (!state.activeBusIDs.includes(busId)) {
        state.activeBusIDs.push(busId);
      }
    },
    removeActiveBus(state, action) {
      state.activeBusIDs = state.activeBusIDs.filter(
        (id) => id !== action.payload
      );
    },
    clearAllActiveBuses(state) {
      state.activeBusIDs = [];
    },
  },
});

export const { addActiveBus, removeActiveBus, clearAllActiveBuses } =
  locationSlice.actions;

export default locationSlice.reducer;
