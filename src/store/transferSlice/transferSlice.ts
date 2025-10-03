import { createSlice } from "@reduxjs/toolkit";

interface TransferState {
  warehouse_transfers: Transfer[];
}

const initialState: TransferState = {
  warehouse_transfers: [],
};

const transferSlice = createSlice({
  name: "transferSlice",
  initialState,
  reducers: {
    setWarehouseTransfers(state, action) {
      state.warehouse_transfers = action.payload;
    },
  },
});

export const { setWarehouseTransfers } = transferSlice.actions;
export default transferSlice.reducer;
