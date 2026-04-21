const PREVIEW_USER_KEY = "smartcampus.previewUser";

const TECHNICIAN_PREVIEW_USER = {
  id: "preview-tech-1",
  name: "Mike Thompson",
  email: "tech1@northridge.edu",
  role: "TECHNICIAN",
  faculty: "Facilities Management",
  picture: null,
  profileComplete: true,
  isPreview: true,
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getPreviewUser() {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(PREVIEW_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isPreviewModeEnabled() {
  return Boolean(getPreviewUser());
}

export function enableTechnicianPreview() {
  if (!canUseStorage()) return TECHNICIAN_PREVIEW_USER;
  window.localStorage.setItem(PREVIEW_USER_KEY, JSON.stringify(TECHNICIAN_PREVIEW_USER));
  return TECHNICIAN_PREVIEW_USER;
}

export function clearPreviewMode() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(PREVIEW_USER_KEY);
}
