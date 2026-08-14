import client from './client'

/** Thin, typed-ish wrappers around the backend REST API, grouped by module. */

export const authApi = {
  register: (body) => client.post('/auth/register', body),
  login: (body) => client.post('/auth/login', body),
  me: () => client.get('/auth/me'),
  mfaSetup: () => client.post('/auth/mfa/setup'),
  mfaEnable: (code) => client.post('/auth/mfa/enable', { code }),
  mfaDisable: () => client.post('/auth/mfa/disable'),
}

export const vaultApi = {
  list: (params) => client.get('/credentials', { params }),
  create: (body) => client.post('/credentials', body),
  update: (id, body) => client.put(`/credentials/${id}`, body),
  remove: (id) => client.delete(`/credentials/${id}`),
  reveal: (id) => client.get(`/credentials/${id}/reveal`),
  toggleFavorite: (id) => client.post(`/credentials/${id}/favorite`),
}

export const categoryApi = {
  list: () => client.get('/categories'),
  create: (body) => client.post('/categories', body),
  remove: (id) => client.delete(`/categories/${id}`),
}

export const passwordApi = {
  generate: (body) => client.post('/password/generate', body),
  strength: (password) => client.post('/password/strength', { password }),
}

export const shareApi = {
  share: (body) => client.post('/shares', body),
  withMe: () => client.get('/shares/with-me'),
  byMe: () => client.get('/shares/by-me'),
  revoke: (id) => client.delete(`/shares/${id}`),
}

export const securityApi = {
  alerts: () => client.get('/security/alerts'),
  resolve: (id) => client.post(`/security/alerts/${id}/resolve`),
  logins: () => client.get('/security/logins'),
  devices: () => client.get('/security/devices'),
  trustDevice: (id, trusted) =>
    client.post(`/security/devices/${id}/trust`, null, { params: { trusted } }),
  removeDevice: (id) => client.delete(`/security/devices/${id}`),
}

export const auditApi = {
  logs: (page = 0, size = 25) => client.get('/audit', { params: { page, size } }),
}

export const notificationApi = {
  list: () => client.get('/notifications'),
  unreadCount: () => client.get('/notifications/unread-count'),
  read: (id) => client.post(`/notifications/${id}/read`),
  readAll: () => client.post('/notifications/read-all'),
}

export const dashboardApi = {
  get: () => client.get('/dashboard'),
}

export const adminApi = {
  dashboard: () => client.get('/admin/dashboard'),
  users: () => client.get('/admin/users'),
  alerts: () => client.get('/admin/alerts'),
}

export const reportUrls = {
  passwordHealthPdf: '/api/reports/password-health.pdf',
  auditExcel: '/api/reports/audit-log.xlsx',
}
