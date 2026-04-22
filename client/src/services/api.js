import axios from "axios";

/**
 * Shared axios instance for new modules. Uses VITE_API_BASE_URL when set so
 * the same build can target staging / prod without code changes; otherwise
 * falls back to the local Spring Boot dev server.
 *
 * `withCredentials: true` is required so the JSESSIONID cookie set by
 * Spring Security (manual login + OAuth2) is sent on every request.
 *
 * NOTE: AuthContext / Login / CompleteProfile still use the global axios
 * defaults from Module D/E — leave them as-is to avoid stepping on other
 * teams' modules. New code should import from this file instead.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: true,
});

// ==========================================
// NOTIFICATION API CALLS
// ==========================================

// src/services/api.js (Keep your existing axios config at the top)

// Notice we don't need to pass userId in the URL! 
// The backend securely figures it out from the session cookie.
// src/services/api.js

export const getUserNotifications = async () => {
  try {
    // FIXED: Added /api to the URL
    const response = await api.get('/api/notifications');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    // FIXED: Added /api to the URL
    await api.patch(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    console.error("Failed to mark notification as read", error);
  }
};

export default api;