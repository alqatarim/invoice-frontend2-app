const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7005').replace(/\/+$/, '')

const toErrorMessage = (payload, fallback) => {
  if (payload?.data?.message) {
    return Array.isArray(payload.data.message) ? payload.data.message.join(', ') : payload.data.message
  }

  if (payload?.message) {
    return Array.isArray(payload.message) ? payload.message.join(', ') : payload.message
  }

  return fallback
}

const request = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers = {} } = options

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  let payload = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || payload?.code !== 200) {
    throw new Error(toErrorMessage(payload, `Request failed: ${response.status}`))
  }

  return payload?.data
}

export const authApi = {
  login: payload => request('/auth/login', { method: 'POST', body: payload }),
}
