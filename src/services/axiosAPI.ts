import axios from "axios";

const axiosAPI = axios.create({
  baseURL: "https://ekomplektasiya.uz/ekomplektasiya_backend/hs/",
  paramsSerializer: {
    encode: (param: string | number) => param,
  },
});

axiosAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("eEquipmentM@rC");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const fetchProductPaginationData = async (
  limit: number,
  offset: number,
  product_type?: string
) => {
  try {
    const response = await axiosAPI.get(
      `products/list/?limit=${limit}&offset=${offset}&product_type=${product_type}`
    );
    if (response.status === 200) return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchProductTypesPaginationData = async (
  limit: number,
  offset: number
) => {
  try {
    const response = await axiosAPI.get(
      `product_types/list/?limit=${limit}&offset=${offset}`
    );
    if (response.status === 200) return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchProductModelsPaginationData = async (
  limit: number,
  offset: number,
  product_type?: string
) => {
  console.log(product_type)
  try {
    const response = await axiosAPI.get(
      `models/list/?limit=${limit}&offset=${offset}${
        product_type ? `&product_type=${product_type}` : ""
      }`
    );
    if (response.status === 200) return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchProductSizesPaginationData = async (
  limit: number,
  offset: number,
  product_type?: string,
  product_model?: string
) => {
  try {
    const response = await axiosAPI.get(
      `sizes/list/?limit=${limit}&offset=${offset}${
        product_type ? `&product_type=${product_type}` : ""
      }${product_model ? `&product_model=${product_model}` : ""}`
    );
    if (response.status === 200) return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchProductUnitsPaginationData = async (
  limit: number,
  offset: number
) => {
  try {
    const response = await axiosAPI.get(
      `units/list/?limit=${limit}&offset=${offset}`
    );
    if (response.status === 200) return response.data;
  } catch (error) {
    console.log(error);
  }
};

export {
  axiosAPI,
  fetchProductPaginationData,
  fetchProductTypesPaginationData,
  fetchProductModelsPaginationData,
  fetchProductSizesPaginationData,
  fetchProductUnitsPaginationData,
};
