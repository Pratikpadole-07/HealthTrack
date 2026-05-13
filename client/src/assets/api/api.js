import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔒 Attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔁 Auto redirect if unauthorized
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ➤ Predict symptoms
export const predictSymptoms = async (data) => {
  return await api.post("/symptoms/predict", data);
};

// ➤ Save symptom report
export const saveSymptomsReport = async (data) => {
  return await api.post("/symptoms", data);
};

// ➤ Get ALL doctors
export const getDoctors = async () => {
  return await api.get("/doctors");
};

// ➤ Get doctors filtered by condition
export const getDoctorsByCondition = async (condition) => {
  return await api.get(`/doctors/by-condition/${condition}`);
};

// 🆕 ➤ Create appointment
export const createAppointment = async (data) => {
  return await api.post("/appointments", data);
};

// 🆕 ➤ Get patient’s own appointments
export const getMyAppointments = async () => {
  return await api.get("/appointments/my");
};

// 🆕 ➤ Get doctor's appointments
export const getDoctorAppointments = async () => {
  return await api.get("/appointments/doctor");
};

export const updateAppointmentStatus = async (appointmentId, status) =>
  api.patch(`/appointments/${appointmentId}/status`, { status });

export const getNotifications = async () => {
  return await api.get("/notifications");
};

export const markAsRead = async (id) => {
  return await api.put(`/notifications/${id}/read`);
};

export const getUnreadCount = async () => {
  const res = await api.get("/notifications");
  return res.data.filter(n => !n.isRead).length;
};

export default api;
