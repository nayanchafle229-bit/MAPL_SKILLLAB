import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Bootstrap: verify stored token
  useEffect(() => {
    const token = localStorage.getItem('sq_token')
    const stored = localStorage.getItem('sq_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch { /* bad json */ }
    }
    // Verify with server
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data.user)
          localStorage.setItem('sq_user', JSON.stringify(data.user))
        })
        .catch(() => {
          localStorage.removeItem('sq_token')
          localStorage.removeItem('sq_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('sq_token', data.token)
    localStorage.setItem('sq_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/register', { email, password })
    localStorage.setItem('sq_token', data.token)
    localStorage.setItem('sq_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sq_token')
    localStorage.removeItem('sq_user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me')
    setUser(data.user)
    localStorage.setItem('sq_user', JSON.stringify(data.user))
    return data.user
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
