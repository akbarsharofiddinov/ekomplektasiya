import { createSlice } from "@reduxjs/toolkit";

interface ProductState {
  products: {
    count: number;
    offset: number;
    limit: number;
    results: IProductList[];
  };
  product_types: {
    count: number;
    offset: number;
    limit: number;
    results: IDimension[];
  };
  product_models: {
    count: number;
    offset: number;
    limit: number;
    results: IDimension[];
  };
  product_sizes: {
    count: number;
    offset: number;
    limit: number;
    results: IDimension[];
  };
  product_units: {
    count: number;
    offset: number;
    limit: number;
    results: IDimension[];
  };
  order_types: IDimension[];
  inputsList: ProductInputData[];
}

const initialState: ProductState = {
  products: {
    count: 0,
    offset: 0,
    limit: 200,
    results: [],
  },
  product_types: {
    count: 0,
    offset: 0,
    limit: 200,
    results: [],
  },
  product_models: {
    count: 0,
    offset: 0,
    limit: 200,
    results: [],
  },
  product_sizes: {
    count: 0,
    offset: 0,
    limit: 200,
    results: [],
  },
  product_units: {
    count: 0,
    offset: 0,
    limit: 200,
    results: [],
  },
  order_types: [],
  inputsList: [],
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

    setProductUnits(state, action) {
      state.product_units = action.payload;
    },

    setOrderTypes(state, action) {
      state.order_types = action.payload;
    },

    setInputList(state, action) {
      state.inputsList = action.payload;
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
} = productSlice.actions;
export default productSlice.reducer;
