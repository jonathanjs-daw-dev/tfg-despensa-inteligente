const BASE_URL = import.meta.env.VITE_API_URL

async function apiFetch(endpoint, options = {}, token = null, redirectOn401 = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && redirectOn401) {
    window.location.href = '/login'
    return null
  }

  return res
}

export const authApi = {
  register: (data) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refresh: () =>
    apiFetch('/auth/refresh', { method: 'POST' }, null, false),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),
}

export const productsApi = {
  getAll: (token) =>
    apiFetch('/products', {}, token),

  create: (token, data) =>
    apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }, token),

  update: (token, id, data) =>
    apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  remove: (token, id) =>
    apiFetch(`/products/${id}`, { method: 'DELETE' }, token),
}
