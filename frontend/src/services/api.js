import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authService = {
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  register: (name, email, phone, password, otp, tenant_code) =>
    api.post('/auth/register', { name, email, phone, password, otp, tenant_code }),
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// Rooms endpoints
export const roomsService = {
  getAllRooms: () => api.get('/rooms'),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  bookRoom: (roomId) => api.post(`/rooms/${roomId}/book`),
  assignRoom: (roomId, userId) => api.post(`/rooms/${roomId}/assign/${userId}`),
  getUserBookings: (userId) => api.get(`/rooms/user/${userId}`),
};

// Complaints endpoints
export const complaintsService = {
  submitComplaint: (text, image) => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('image', image);
    return api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAllComplaints: () => api.get('/complaints'),
  getUserComplaints: (userId) => api.get(`/complaints/user/${userId}`),
  updateComplaintStatus: (id, status) =>
    api.patch(`/complaints/${id}/status`, { status }),
  upvoteComplaint: (id) => api.post(`/complaints/${id}/vote`),
  getComplaintVotes: (id) => api.get(`/complaints/${id}/votes`),
};

// Payments endpoints
export const paymentsService = {
  getPayments: () => api.get('/payments'),
  completePayment: (id) => api.post(`/payments/${id}/complete`),
  sendReminder: (id) => api.post(`/payments/${id}/remind`),
};

// Roommate endpoints
export const roommateService = {
  savePreferences: (course, year, sleep_schedule) =>
    api.post('/roommate/preferences', { course, year, sleep_schedule }),
  getSuggestions: () => api.get('/roommate/suggestions'),
};

export const adminService = {
  getStudents: () => api.get('/admin/students'),
  updateStudent: (id, data) => api.patch(`/admin/students/${id}`, data),
  getStudentComplaints: (id) => api.get(`/admin/students/${id}/complaints`),
  getStudentPayments: (id) => api.get(`/admin/students/${id}/payments`),
  getManagementUsers: () => api.get('/admin/management'),
  updateManagementUser: (id, data) => api.patch(`/admin/management/${id}`, data),
};

export const managementService = {
  getDashboard: () => api.get('/management/dashboard'),
  rebalanceStaff: (tenantId) => api.post(`/management/rebalance/${tenantId}`),
};

export const notificationsService = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};

export default api;
