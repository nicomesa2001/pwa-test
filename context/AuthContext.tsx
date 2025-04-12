import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import authService, { UserData } from '@/services/authService'

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('authToken')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
      
      // Verificar si el token sigue siendo válido
      authService.getCurrentUser(storedToken)
        .catch(() => {
          // Si hay un error, el token probablemente expiró
          logout()
        })
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const authResponse = await authService.login(email, password)
      
      if (authResponse && authResponse.access_token) {
        // Obtener información del usuario con el token
        const userData = await authService.getCurrentUser(authResponse.access_token)
        
        const userObj = {
          id: userData.id,
          name: userData.full_name || email.split('@')[0],
          email: userData.email
        }
        
        setUser(userObj)
        setToken(authResponse.access_token)
        
        localStorage.setItem('user', JSON.stringify(userObj))
        localStorage.setItem('authToken', authResponse.access_token)
        
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Error en login:', error)
      setIsLoading(false)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Registrar al usuario
      const userData = await authService.register(name, email, password)
      
      if (userData) {
        // Iniciar sesión automáticamente después del registro
        return await login(email, password)
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Error en registro:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
