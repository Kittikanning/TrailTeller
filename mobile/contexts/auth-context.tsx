"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, authService } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const loadUser = async () => {
    setIsLoading(true)
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }
  loadUser()
}, [])


  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password)
    if (user) {
      authService.setCurrentUser(user)
      setUser(user)
    } else {
      setUser(null)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    const user = await authService.register(email, password, name)
    if (user) {
      authService.setCurrentUser(user)
      setUser(user)
    } else {
      setUser(null)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
