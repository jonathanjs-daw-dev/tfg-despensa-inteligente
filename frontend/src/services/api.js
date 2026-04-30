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
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refresh: () => apiFetch('/auth/refresh', { method: 'POST' }, null, false),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
}

export const productsApi = {
  getAll: (token) => apiFetch('/products', {}, token),

  create: (token, data) =>
    apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }, token),

  update: (token, id, data) =>
    apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  remove: (token, id) => apiFetch(`/products/${id}`, { method: 'DELETE' }, token),
}

export const recipesApi = {
  getSaved: (token) => apiFetch('/recipes/saved', {}, token),
  getById: (token, id) => apiFetch(`/recipes/saved/${id}`, {}, token),
  save: (token, recipe) => apiFetch('/recipes/saved', { method: 'POST', body: JSON.stringify(recipe) }, token),
  remove: (token, id) => apiFetch(`/recipes/saved/${id}`, { method: 'DELETE' }, token),
}

export const barcodesApi = {
  lookup: (token, code) => apiFetch(`/barcodes/${encodeURIComponent(code)}`, {}, token),
}

export const shoppingListApi = {
  getAll: (token) => apiFetch('/shopping-list', {}, token),

  create: (token, data) =>
    apiFetch('/shopping-list', { method: 'POST', body: JSON.stringify(data) }, token),

  update: (token, id, data) =>
    apiFetch(`/shopping-list/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  remove: (token, id) => apiFetch(`/shopping-list/${id}`, { method: 'DELETE' }, token),

  removeChecked: (token) => apiFetch('/shopping-list/checked', { method: 'DELETE' }, token),
}
