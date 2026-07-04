import axios from 'axios'

// Talk to the backend on the SAME host the page was served from, port 3001.
// Works for localhost, LAN IP, and public IP without hardcoding anything.
// Override with VITE_API_BASE in frontend/.env if the API lives elsewhere.
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  `${window.location.protocol}//${window.location.hostname}:3001/api`

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sq_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sq_token')
      localStorage.removeItem('sq_user')

      window.location.href = '/login'
    }

    return Promise.reject(err)
  }
)

export default api