import useAuthStore from '../stores/auth';

const BASE = import.meta.env.VITE_API_URL || '';

async function apiFetch(path, options = {}) {
  const { accessToken, refresh, _clear } = useAuthStore.getState();

  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && accessToken) {
    await refresh();
    const newToken = useAuthStore.getState().accessToken;
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers });
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => apiFetch(path, { method: 'DELETE' }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
};
