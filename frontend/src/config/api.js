// Central API base URL
// - In monorepo deployment (same domain), use relative /api
// - In separate deployment, use VITE_API_URL env var
// - Local dev falls back to localhost:8000
const isSameOrigin = !import.meta.env.VITE_API_URL && typeof window !== 'undefined'
const API = import.meta.env.VITE_API_URL || (isSameOrigin ? '/api' : 'http://localhost:8000')

export default API
