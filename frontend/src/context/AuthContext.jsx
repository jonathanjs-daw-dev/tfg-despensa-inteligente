import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function tryRestore() {
      try {
        const res = await authApi.refresh()
        if (res && res.ok) {
          const data = await res.json()
          setAccessToken(data.accessToken)
        }
      } catch {
        // No hay sesión activa
      } finally {
        setLoading(false)
      }
    }
    tryRestore()
  }, [])

  function saveSession(token, userData) {
    setAccessToken(token)
    setUser(userData)
  }

  async function closeSession() {
    await authApi.logout()
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ accessToken, user, saveSession, closeSession, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
