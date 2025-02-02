// src/api.js
import axios from "axios";
devUrl="http://localhost:4000/api"
prodUrl="https://smart-ocr-document-extraction-1e8k.vercel.app/api"
// Create an instance of Axios with the base URL
export const api = axios.create({
  baseURL: prodUrl,  // Replace with your backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// // Request interceptor to add authorization token to each request if it exists
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

