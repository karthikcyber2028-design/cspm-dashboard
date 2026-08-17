import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

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

export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

export const awsAPI = {
  getCredentials: () => api.get("/aws/credentials"),
  addCredential: (data) => api.post("/aws/credentials", data),
  deleteCredential: (id) => api.delete(`/aws/credentials/${id}`),
};

export const scanAPI = {
  run: (data) => api.post("/scans/run", data),
  list: () => api.get("/scans"),
  getById: (id) => api.get(`/scans/${id}`),
  getFindings: (id, params) => api.get(`/scans/${id}/findings`, { params }),
};

export const dashboardAPI = {
  overview: () => api.get("/dashboard/overview"),
  resources: (params) => api.get("/dashboard/resources", { params }),
  services: () => api.get("/dashboard/services"),
};

export const alertAPI = {
  list: (params) => api.get("/alerts", { params }),
  unreadCount: () => api.get("/alerts/unread-count"),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put("/alerts/read-all"),
};

export default api;
