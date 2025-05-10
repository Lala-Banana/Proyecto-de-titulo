import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Añade automáticamente el token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intenta refrescar el token si hay 401 (no autorizado)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const tokenRes = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh,
        });

        const newAccess = tokenRes.data.access;
        localStorage.setItem('access_token', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
