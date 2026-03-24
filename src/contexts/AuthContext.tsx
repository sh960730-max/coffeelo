import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { dummyDriver } from '../lib/dummyData'
import type { Driver, Cafe } from '../lib/database.types'

export type UserRole = 'driver' | 'cafe' | 'company'

interface Company {
  id: string
  auth_id: string
  name: string
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

interface AuthState {
  user: Driver | Cafe | Company | null
  role: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (phone: string, password: string, role: UserRole) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Driver | Cafe | Company | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(dummyDriver)
      setRole('driver')
      setIsLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // 저장된 역할 복원
        const savedRole = localStorage.getItem('coffeelo_role') as UserRole | null
        if (savedRole) {
          fetchUserByRole(session.user.id, savedRole)
        } else {
          detectRole(session.user.id)
        }
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        setRole(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function detectRole(authId: string) {
    // drivers → cafes → companies 순으로 조회
    const { data: driver } = await supabase.from('drivers').select('*').eq('auth_id', authId).single()
    if (driver) { setUser(driver); setRole('driver'); localStorage.setItem('coffeelo_role', 'driver'); setIsLoading(false); return }

    const { data: cafe } = await supabase.from('cafes').select('*').eq('auth_id', authId).single()
    if (cafe) { setUser(cafe); setRole('cafe'); localStorage.setItem('coffeelo_role', 'cafe'); setIsLoading(false); return }

    const { data: company } = await supabase.from('companies').select('*').eq('auth_id', authId).single()
    if (company) { setUser(company); setRole('company'); localStorage.setItem('coffeelo_role', 'company'); setIsLoading(false); return }

    setIsLoading(false)
  }

  async function fetchUserByRole(authId: string, userRole: UserRole) {
    const table = userRole === 'driver' ? 'drivers' : userRole === 'cafe' ? 'cafes' : 'companies'
    const { data } = await supabase.from(table).select('*').eq('auth_id', authId).single()
    if (data) {
      setUser(data)
      setRole(userRole)
    }
    setIsLoading(false)
  }

  async function login(phone: string, password: string, loginRole: UserRole) {
    if (!isSupabaseConfigured) {
      setUser(dummyDriver)
      setRole('driver')
      return {}
    }

    const email = `${phone}@coffeelo.kr`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      localStorage.setItem('coffeelo_role', loginRole)
      await fetchUserByRole(session.user.id, loginRole)
    }
    return {}
  }

  async function logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('coffeelo_role')
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isLoading,
      isAuthenticated: !!user,
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
