import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Users
export const getUserProfile = (id) => API.get(`/users/profile/${id}`);
export const updateProfile = (data) => API.put('/users/profile', data);
export const searchUsers = (params) => API.get('/users/search', { params });

// Swaps
export const sendSwapRequest = (data) => API.post('/swaps', data);
export const getSwapRequests = () => API.get('/swaps');
export const acceptSwap = (id) => API.put(`/swaps/${id}/accept`);
export const rejectSwap = (id) => API.put(`/swaps/${id}/reject`);

// Chat
export const getConversations = () => API.get('/chat/conversations');
export const getMessages = (conversationId) => API.get(`/chat/${conversationId}/messages`);
export const sendMessage = (conversationId, text) => API.post(`/chat/${conversationId}/messages`, { text });

// Sessions
export const createSession = (data) => API.post('/sessions', data);
export const getSessions = () => API.get('/sessions');
export const completeSession = (id) => API.put(`/sessions/${id}/complete`);
export const cancelSession = (id) => API.put(`/sessions/${id}/cancel`);

// Reviews
export const createReview = (data) => API.post('/reviews', data);
export const getUserReviews = (userId) => API.get(`/reviews/user/${userId}`);

// Upload
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return API.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
