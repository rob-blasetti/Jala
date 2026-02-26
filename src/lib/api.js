const request = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed (${response.status})`)
  }

  return response.json()
}

export const api = {
  getMusicians: () => request('/api/musicians'),
  createMusician: (payload) => request('/api/musicians', { method: 'POST', body: JSON.stringify(payload) }),

  getRequests: () => request('/api/requests'),
  createRequest: (payload) => request('/api/requests', { method: 'POST', body: JSON.stringify(payload) }),
  patchRequest: (payload) => request('/api/requests', { method: 'PATCH', body: JSON.stringify(payload) }),
  createCheckoutSession: (payload) => request('/api/payments/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  verifyCheckoutSession: (payload) => request('/api/payments/verify', { method: 'POST', body: JSON.stringify(payload) }),

  getResponses: () => request('/api/responses'),
  createResponse: (payload) => request('/api/responses', { method: 'POST', body: JSON.stringify(payload) }),

  getMatches: () => request('/api/matches'),
  createMatch: (payload) => request('/api/matches', { method: 'POST', body: JSON.stringify(payload) }),
  patchMatch: (payload) => request('/api/matches', { method: 'PATCH', body: JSON.stringify(payload) }),
}
