import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auth
export const loginUser          = (data: { email: string; password: string }) => api.post('/auth/login', data);
export const startRegistration = (data: { name: string; email: string }) =>   api.post('/auth/register-start', data);
export const completeRegistration = (data: { token: string; password: string }) =>   api.post('/auth/register-complete', data);
export const getMe              = () => api.get('/auth/me');
export const doctorRegisterReq  = (data: { name: string; email: string; address: string; specialization: string }) => api.post('/auth/doctor-register-request', data);
export const setupDoctorAccount = (token: string, data: { password: string; confirmPassword: string }) => api.post(`/auth/doctor-setup/${token}`, data);

// admin
export const getDashboardStats  = () => api.get('/admin/dashboard');
export const getAllUsers         = () => api.get('/admin/users');
export const getDoctorRequests  = () => api.get('/admin/doctor-request');
export const approveDoctor      = (id: string) => api.post(`/admin/doctor-request/${id}/approve`);
export const rejectDoctor       = (id: string, reason: string) => api.post(`/admin/doctor-request/${id}/reject`, { reason });
export const toggleUserStatus   = (id: string) => api.put(`/admin/users/${id}/toggle`);

// doctors
export const getAllDoctors      = () => api.get('/doctors');
export const getDoctorProfile = () => api.get('/doctors/me');
export const updateDoctorProfile = (id: string, data: object) => api.put(`/doctors/${id}/profile`, data);

// appointments
export const bookAppointment    = (data: object) => api.post('/appointments', data);
export const getAppointments    = () => api.get('/appointments');
export const updateApptStatus   = (id: string, status: string) => api.put(`/appointments/${id}/status`, { status });
export const cancelAppointment  = (id: string) => api.delete(`/appointments/${id}`);

// patients
export const getAllPatients      = () => api.get('/patients');
export const updatePatientProfile = (profileData: Record<string, any>) => api.put('/patients/me', profileData);
// departments
export const getAllDepartments   = () => api.get('/departments');
export const createDepartment   = (data: object) => api.post('/departments', data);