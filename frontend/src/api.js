import axios from "axios";

const API_BASE = "http://localhost:4000/api";

let authToken = localStorage.getItem("poll_token") || null;

export const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem("poll_token", token);
  } else {
    localStorage.removeItem("poll_token");
  }
};

export const getAuthToken = () => authToken;

export const clearAuth = () => {
  authToken = null;
  localStorage.removeItem("poll_token");
  localStorage.removeItem("poll_user");
};
