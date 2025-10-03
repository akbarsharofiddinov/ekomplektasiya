import { configureStore } from "@reduxjs/toolkit";
import infoSlice from "./infoSlice/infoSlice";
import productSlice from "./productSlice/productSlice";
import transferSlice from "./transferSlice/transferSlice";

export const store = configureStore({
  reducer: {
    // Add your reducers here
    info: infoSlice,
    transferSlice: transferSlice,
    product: productSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
