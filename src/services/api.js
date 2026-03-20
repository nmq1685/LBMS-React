import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const booksAPI = {
    getAll: (params = {}) => api.get('/books', { params }),
    getById: (id) => api.get(`/books/${id}`),
    create: (data) => api.post('/books', data),
    update: (id, data) => api.put(`/books/${id}`, data),
    delete: (id) => api.delete(`/books/${id}`),
};

export const usersAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    getByEmail: (email) => api.get(`/users?email=${encodeURIComponent(email)}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export const cartAPI = {
    getByUser: (userId) => api.get(`/cart?userId=${userId}`),
    add: (data) => api.post('/cart', data),
    update: (id, data) => api.put(`/cart/${id}`, data),
    remove: (id) => api.delete(`/cart/${id}`),
};

export const wishlistAPI = {
    getByUser: (userId) => api.get(`/wishlist?userId=${userId}`),
    add: (data) => api.post('/wishlist', data),
    remove: (id) => api.delete(`/wishlist/${id}`),
};

export const borrowsAPI = {
    getAll: (params = {}) => api.get('/borrows', { params }),
    getByUser: (userId) => api.get(`/borrows?userId=${userId}`),
    create: (data) => api.post('/borrows', data),
    update: (id, data) => api.put(`/borrows/${id}`, data),
};

export default api;
