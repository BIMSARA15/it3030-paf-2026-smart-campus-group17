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
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
});

// ==========================================
// NOTIFICATION API CALLS
// ==========================================

export const getUserNotifications = async () => {
  try {
    const response = await api.get('/api/notifications');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await api.patch(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    console.error("Failed to mark notification as read", error);
  }
};

// --- NEW FUNCTION APPENDED HERE ---
export const markAllNotificationsAsRead = async () => {
  try {
    await api.patch('/api/notifications/read-all');
  } catch (error) {
    console.error("Failed to mark all notifications as read", error);
  }
};

// Add this to the BOTTOM of your src/services/api.js file
export const deleteNotification = async (notificationId) => {
  try {
    await api.delete(`/api/notifications/${notificationId}`);
  } catch (error) {
    console.error("Failed to delete notification", error);
    throw error;
  }
};

export const deleteMultipleNotifications = async (ids) => {
  try {
    await api.delete('/api/notifications/bulk', { data: ids });
  } catch (error) {
    console.error("Failed to delete multiple notifications", error);
    throw error;
  }
};

export default api;