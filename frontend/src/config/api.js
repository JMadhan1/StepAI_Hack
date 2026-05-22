// Central API base URL
// - Production backend: https://eduaiagent.vercel.app/
// - Local dev falls back to localhost:8000
const API = import.meta.env.VITE_API_URL || 'https://eduaiagent.vercel.app/'

export default API
