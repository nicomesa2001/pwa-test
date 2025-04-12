import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: string
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
    const storedToken = localStorage.getItem('belvoToken')
    
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    
    if (storedToken) {
      setToken(storedToken)
    } else {
      // Set a default Belvo sandbox token for demo purposes
      // In a real app, you would get this from your backend after authenticating with Belvo
      const defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZWx2by1hcGkiLCJpc3MiOiJiZWx2byIsImlhdCI6MTUxNjIzOTAyMn0.K8YV6Uv6wXB3QwYKqoLDmSdvE1wfLBUix_p8N3Z7Yj4'
      setToken(defaultToken)
      localStorage.setItem('belvoToken', defaultToken)
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock authentication - in a real app, this would be an API call
      if (email && password) {
        const mockUser = {
          id: '1',
          name: email.split('@')[0],
          email
        }
        setUser(mockUser)
        localStorage.setItem('user', JSON.stringify(mockUser))
        
        // In a real app, you would get a token from your backend after authenticating with Belvo
        // For demo purposes, we're using a static token
        const belvoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZWx2by1hcGkiLCJpc3MiOiJiZWx2byIsImlhdCI6MTUxNjIzOTAyMn0.K8YV6Uv6wXB3QwYKqoLDmSdvE1wfLBUix_p8N3Z7Yj4'
        setToken(belvoToken)
        localStorage.setItem('belvoToken', belvoToken)
        
        setIsLoading(false)
        return true
      }
      setIsLoading(false)
      return false
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock registration - in a real app, this would be an API call
      if (name && email && password) {
        const mockUser = {
          id: '1',
          name,
          email
        }
        setUser(mockUser)
        localStorage.setItem('user', JSON.stringify(mockUser))
        
        // In a real app, you would get a token from your backend after registering with Belvo
        // For demo purposes, we're using a static token
        const belvoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZWx2by1hcGkiLCJpc3MiOiJiZWx2byIsImlhdCI6MTUxNjIzOTAyMn0.K8YV6Uv6wXB3QwYKqoLDmSdvE1wfLBUix_p8N3Z7Yj4'
        setToken(belvoToken)
        localStorage.setItem('belvoToken', belvoToken)
        
        setIsLoading(false)
        return true
      }
      setIsLoading(false)
      return false
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    // We're not removing the token on logout for demo purposes
    // In a real app, you might want to invalidate the token on the server
    // localStorage.removeItem('belvoToken')
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
