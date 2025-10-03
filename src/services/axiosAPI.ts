import axios from "axios";

export const axiosAPI = axios.create({
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
