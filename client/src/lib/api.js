import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vyntra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('vyntra_token');
      localStorage.removeItem('vyntra_user');
      window.dispatchEvent(new Event('vyntra_session_expired'));
    }
    return Promise.reject(err);
  }
);
export const mediaUrl = url => !url ? '' : url.startsWith('http') ? url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '')}${url}`;
export default api;
