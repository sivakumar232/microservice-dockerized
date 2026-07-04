import axios from 'axios';

const BASE = '/api';

// Create axios instance
const api = axios.create({ baseURL: BASE });

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth service calls (port 3001 via proxy /api/auth)
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

// User service calls (port 3002 via proxy /api/users)
export const userService = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  getAddresses: (id) => api.get(`/users/${id}/addresses`),
  addAddress: (id, data) => api.post(`/users/${id}/addresses`, data),
  deleteAddress: (id, addrId) => api.delete(`/users/${id}/addresses/${addrId}`),
  getAllUsers: () => api.get('/users'),
};

// Product service calls (port 3003 via proxy /api/products)
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  createCategory: (data) => api.post('/products/categories', data),
  updateStock: (id, quantity) => api.patch(`/products/${id}/stock`, { quantity }),
};

// Order service calls (port 3004 via proxy /api/orders)
export const orderService = {
  getCart: () => api.get('/orders/cart'),
  addToCart: (data) => api.post('/orders/cart', data),
  updateCart: (productId, quantity) => api.put(`/orders/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/orders/cart/${productId}`),
  placeOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  getStats: () => api.get('/orders/stats'),
};

export default api;
