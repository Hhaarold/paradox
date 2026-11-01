const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('paradox-token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('No fue posible conectar con el servidor. Comprueba que el backend esté activo.', 0);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.message || payload.errors?.map((item) => item.message).join('. ') || 'La solicitud no pudo completarse.';
    if (response.status === 401) localStorage.removeItem('paradox-token');
    throw new ApiError(message, response.status, payload);
  }
  return payload;
}

export const api = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body }),
  me: () => apiRequest('/auth/me'),
  paradoxes: () => apiRequest('/paradoxes'),
  paradox: (id) => apiRequest(`/paradoxes/${id}`),
  createParadox: (body) => apiRequest('/paradoxes', { method: 'POST', body }),
  addResponse: (id, layerIndex, body) => apiRequest(`/paradoxes/${id}/layers/${layerIndex}/responses`, { method: 'POST', body }),
  vote: (id, responseId, vote) => apiRequest(`/paradoxes/${id}/responses/${responseId}/vote`, { method: 'POST', body: { vote } }),
  updateParadox: (id, body) => apiRequest(`/paradoxes/${id}`, { method: 'PUT', body }),
  deleteParadox: (id) => apiRequest(`/paradoxes/${id}`, { method: 'DELETE' }),
  ranking: () => apiRequest('/users/ranking'),
  profile: (username) => apiRequest(username ? `/users/profile/${encodeURIComponent(username)}` : '/users/profile'),
  updateProfile: (body) => apiRequest('/users/profile', { method: 'PATCH', body }),
  duels: () => apiRequest('/duels'),
  createDuel: (body) => apiRequest('/duels', { method: 'POST', body }),
};
