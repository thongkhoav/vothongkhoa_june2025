import axios from "axios";

export const getBaseURL = () => {
  let url;
  switch (import.meta.env.NODE_ENV) {
    case "development":
      url = import.meta.env.VITE_API_URL + "/api/v1";
      break;
    case "production":
      url = import.meta.env.VITE_API_URL + "/api/v1";
      break;
    default:
      url = import.meta.env.VITE_API_URL + "/api/v1";
  }
  return url;
};

export const axiosBase = axios.create({
  baseURL: getBaseURL(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
