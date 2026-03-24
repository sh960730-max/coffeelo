import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { dummyDriver } from '../lib/dummyData'
import type { Driver } from '../lib/database.types'

interface AuthState {
  driver: Driver | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (phone: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // 더미 모드: 자동 로그인
      setDriver(dummyDriver)
      setIsLoading(false)
      return
    }

    // Supabase 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchDriver(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchDriver(session.user.id)
      } else {
        setDriver(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchDriver(authId: string) {
    const { data } = await supabase
      .from('drivers')
      .select('*')
      .eq('auth_id', authId)
      .single()
    setDriver(data)
    setIsLoading(false)
  }

  async function login(phone: string, password: string) {
    if (!isSupabaseConfigured) {
      setDriver(dummyDriver)
      return {}
    }

    const email = `${phone}@coffeelo.kr`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  async function logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setDriver(null)
  }

  return (
    <AuthContext.Provider value={{
      driver,
      isLoading,
      isAuthenticated: !!driver,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
