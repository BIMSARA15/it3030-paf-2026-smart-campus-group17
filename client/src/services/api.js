import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

const RESOURCE_STORAGE_KEY = 'smart-campus-resources';
const UTILITY_STORAGE_KEY = 'smart-campus-utilities';

// Mock interceptor to add Basic Auth header for Admin demo
api.interceptors.request.use((config) => {
  config.headers.Authorization = 'Basic ' + btoa('admin:admin');
  return config;
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const makeResponse = (data) => Promise.resolve({ data: clone(data) });

const getStoredResources = () => {
  const raw = localStorage.getItem(RESOURCE_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setStoredResources = (resources) => {
  localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(resources));
};

const getStoredUtilities = () => {
  const raw = localStorage.getItem(UTILITY_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setStoredUtilities = (utilities) => {
  localStorage.setItem(UTILITY_STORAGE_KEY, JSON.stringify(utilities));
};

const normalizeResource = (resource, existingResource = {}) => {
  const timestamp = new Date().toISOString();

  return {
    id: existingResource.id || resource.id || crypto.randomUUID(),
    name: resource.name?.trim() || '',
    resourceCode: resource.resourceCode?.trim() || '',
    type: resource.type || 'LECTURE_HALL',
    capacity: Number.parseInt(resource.capacity, 10) || 0,
    location: resource.location?.trim() || '',
    building: resource.building?.trim() || '',
    floor: resource.floor?.toString().trim() || '',
    status: resource.status || 'ACTIVE',
    description: resource.description?.trim() || '',
    createdAt: existingResource.createdAt || timestamp,
    updatedAt: timestamp,
  };
};

const normalizeUtility = (utility, existingUtility = {}) => {
  const timestamp = new Date().toISOString();

  return {
    id: existingUtility.id || utility.id || crypto.randomUUID(),
    name: utility.name?.trim() || '',
    utilityCode: utility.utilityCode?.trim() || '',
    category: utility.category || 'PROJECTOR',
    assignedLocation: utility.assignedLocation?.trim() || '',
    quantity: Number.parseInt(utility.quantity, 10) || 1,
    status: utility.status || 'ACTIVE',
    description: utility.description?.trim() || '',
    createdAt: existingUtility.createdAt || timestamp,
    updatedAt: timestamp,
  };
};

const matchesFilters = (resource, params = {}) => {
  const locationQuery = params.location?.trim().toLowerCase();
  const minCapacity = params.minCapacity ? Number.parseInt(params.minCapacity, 10) : null;

  if (params.type && resource.type !== params.type) {
    return false;
  }

  if (params.status && resource.status !== params.status) {
    return false;
  }

  if (locationQuery) {
    const haystack = `${resource.location} ${resource.building}`.toLowerCase();
    if (!haystack.includes(locationQuery)) {
      return false;
    }
  }

  if (minCapacity !== null && resource.capacity < minCapacity) {
    return false;
  }

  return true;
};

const matchesUtilityFilters = (utility, params = {}) => {
  const locationQuery = params.assignedLocation?.trim().toLowerCase();

  if (params.category && utility.category !== params.category) {
    return false;
  }

  if (params.status && utility.status !== params.status) {
    return false;
  }

  if (locationQuery && !utility.assignedLocation.toLowerCase().includes(locationQuery)) {
    return false;
  }

  return true;
};

const createHttpError = (message, status = 400) => {
  const error = new Error(message);
  error.response = {
    status,
    data: {
      message,
    },
  };
  return error;
};

const shouldUseLocalFallback = (error) => {
  if (!error) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  return [404, 405, 500, 501, 502, 503, 504].includes(error.response.status);
};

const localResourceApi = {
  async getResources(params) {
    const resources = getStoredResources()
      .filter((resource) => matchesFilters(resource, params))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return makeResponse(resources);
  },

  async getResourceById(id) {
    const resource = getStoredResources().find((item) => item.id === id);

    if (!resource) {
      throw createHttpError('Resource not found', 404);
    }

    return makeResponse(resource);
  },

  async createResource(data) {
    if (!data.name?.trim() || !data.resourceCode?.trim()) {
      throw createHttpError('Resource name and code are required.');
    }

    const resources = getStoredResources();
    const duplicate = resources.find(
      (resource) => resource.resourceCode.toLowerCase() === data.resourceCode.trim().toLowerCase()
    );

    if (duplicate) {
      throw createHttpError('A resource with this code already exists.');
    }

    const resource = normalizeResource(data);
    resources.push(resource);
    setStoredResources(resources);

    return makeResponse(resource);
  },

  async updateResource(id, data) {
    const resources = getStoredResources();
    const resourceIndex = resources.findIndex((item) => item.id === id);

    if (resourceIndex === -1) {
      throw createHttpError('Resource not found', 404);
    }

    const duplicate = resources.find(
      (resource) =>
        resource.id !== id &&
        resource.resourceCode.toLowerCase() === data.resourceCode?.trim().toLowerCase()
    );

    if (duplicate) {
      throw createHttpError('A resource with this code already exists.');
    }

    const updatedResource = normalizeResource(data, resources[resourceIndex]);
    resources[resourceIndex] = updatedResource;
    setStoredResources(resources);

    return makeResponse(updatedResource);
  },

  async patchResourceStatus(id, status) {
    const resources = getStoredResources();
    const resourceIndex = resources.findIndex((item) => item.id === id);

    if (resourceIndex === -1) {
      throw createHttpError('Resource not found', 404);
    }

    resources[resourceIndex] = {
      ...resources[resourceIndex],
      status,
      updatedAt: new Date().toISOString(),
    };
    setStoredResources(resources);

    return makeResponse(resources[resourceIndex]);
  },

  async deleteResource(id) {
    const resources = getStoredResources();
    const filteredResources = resources.filter((item) => item.id !== id);

    if (filteredResources.length === resources.length) {
      throw createHttpError('Resource not found', 404);
    }

    setStoredResources(filteredResources);
    return makeResponse({ success: true });
  },
};

const localUtilityApi = {
  async getUtilities(params) {
    const utilities = getStoredUtilities()
      .filter((utility) => matchesUtilityFilters(utility, params))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return makeResponse(utilities);
  },

  async createUtility(data) {
    if (!data.name?.trim() || !data.utilityCode?.trim()) {
      throw createHttpError('Utility name and code are required.');
    }

    const utilities = getStoredUtilities();
    const duplicate = utilities.find(
      (utility) => utility.utilityCode.toLowerCase() === data.utilityCode.trim().toLowerCase()
    );

    if (duplicate) {
      throw createHttpError('A utility with this code already exists.');
    }

    const utility = normalizeUtility(data);
    utilities.push(utility);
    setStoredUtilities(utilities);

    return makeResponse(utility);
  },
};

const withResourceFallback = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    return fallback();
  }
};

export const getResources = (params) =>
  withResourceFallback(() => api.get('/resources', { params }), () => localResourceApi.getResources(params));

export const getResourceById = (id) =>
  withResourceFallback(() => api.get(`/resources/${id}`), () => localResourceApi.getResourceById(id));

export const createResource = (data) =>
  withResourceFallback(() => api.post('/resources', data), () => localResourceApi.createResource(data));

export const updateResource = (id, data) =>
  withResourceFallback(() => api.put(`/resources/${id}`, data), () => localResourceApi.updateResource(id, data));

export const patchResourceStatus = (id, status) =>
  withResourceFallback(
    () => api.patch(`/resources/${id}/status`, null, { params: { status } }),
    () => localResourceApi.patchResourceStatus(id, status)
  );

export const deleteResource = (id) =>
  withResourceFallback(() => api.delete(`/resources/${id}`), () => localResourceApi.deleteResource(id));

export const getUtilities = (params) =>
  withResourceFallback(() => api.get('/utilities', { params }), () => localUtilityApi.getUtilities(params));

export const createUtility = (data) =>
  withResourceFallback(() => api.post('/utilities', data), () => localUtilityApi.createUtility(data));

export default api;
