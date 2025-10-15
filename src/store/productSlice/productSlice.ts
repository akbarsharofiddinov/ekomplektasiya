import { createSlice } from "@reduxjs/toolkit";

interface ProductState {
  products: IProductList[];
  product_types: IDimension[];
  product_models: IDimension[];
  product_sizes: IDimension[];
  inputsList: ProductInputData[];
  product_units: IDimension[];
  order_types: IDimension[];
}

const initialState: ProductState = {
  products: [],
  product_types: [],
  product_models: [],
  product_sizes: [],
  inputsList: [],
  product_units: [],
  order_types: [],
};

const productSlice = createSlice({
  name: "productSlice",
  initialState,
  reducers: {
    setProducts(state, action) {
      state.products = action.payload;
    },

    setProductTypes(state, action) {
      state.product_types = action.payload;
    },

    setProductModels(state, action) {
      state.product_models = action.payload;
    },

    setProductSizes(state, action) {
      state.product_sizes = action.payload;
    },

    setInputList(state, action) {
      state.inputsList = action.payload;
    },

    setProductUnits(state, action) {
      state.product_units = action.payload;
    },

    setOrderTypes(state, action) {
      state.order_types = action.payload;
    },

    // Remove from list by id
    removeFromListByID(state, action) {
      state.inputsList = state.inputsList.filter(
        (item) => item.id !== action.payload
      );
    },
  },
});

export const {
  setProducts,
  setProductTypes,
  setProductModels,
  setProductSizes,
  setInputList,
  removeFromListByID,
  setProductUnits,
  setOrderTypes,
} = productSlice.actions;
export default productSlice.reducer;
