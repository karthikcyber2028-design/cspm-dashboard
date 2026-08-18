import axios from "axios";
import * as mock from "./mockApi";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

let backendAvailable = null;

async function checkBackend() {
  if (backendAvailable !== null) return backendAvailable;
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 3000 });
    backendAvailable = true;
  } catch {
    backendAvailable = false;
  }
  return backendAvailable;
}

const api = axios.create({ baseURL: API_BASE, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cspm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cspm_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

async function withFallback(realFn, mockFn, ...args) {
  const isLive = await checkBackend();
  if (isLive) return realFn(...args);
  return mockFn(...args);
}

export const authAPI = {
  login: (data) => withFallback((d) => api.post("/auth/login", d), mock.authAPI.login, data),
  register: (data) => withFallback((d) => api.post("/auth/register", d), mock.authAPI.register, data),
  me: () => withFallback(() => api.get("/auth/me"), mock.authAPI.me),
};

export const awsAPI = {
  getCredentials: () => withFallback(() => api.get("/aws/credentials"), mock.awsAPI.getCredentials),
  addCredential: (data) => withFallback((d) => api.post("/aws/credentials", d), mock.awsAPI.addCredential, data),
  deleteCredential: (id) => withFallback((i) => api.delete(`/aws/credentials/${i}`), mock.awsAPI.deleteCredential, id),
};

export const scanAPI = {
  run: (data) => withFallback((d) => api.post("/scans/run", d), mock.scanAPI.run, data),
  list: () => withFallback(() => api.get("/scans"), mock.scanAPI.list),
  getById: (id) => withFallback((i) => api.get(`/scans/${i}`), mock.scanAPI.getById, id),
  getFindings: (id, params) => withFallback((i, p) => api.get(`/scans/${i}/findings`, { params: p }), mock.scanAPI.getFindings, id, params),
};

export const dashboardAPI = {
  overview: () => withFallback(() => api.get("/dashboard/overview"), mock.dashboardAPI.overview),
  resources: (params) => withFallback((p) => api.get("/dashboard/resources", { params: p }), mock.dashboardAPI.resources, params),
  services: () => withFallback(() => api.get("/dashboard/services"), mock.dashboardAPI.services),
};

export const alertAPI = {
  list: (params) => withFallback((p) => api.get("/alerts", { params: p }), mock.alertAPI.list, params),
  unreadCount: () => withFallback(() => api.get("/alerts/unread-count"), mock.alertAPI.unreadCount),
  markRead: (id) => withFallback((i) => api.put(`/alerts/${i}/read`), mock.alertAPI.markRead, id),
  markAllRead: () => withFallback(() => api.put("/alerts/read-all"), mock.alertAPI.markAllRead),
};

export default api;
