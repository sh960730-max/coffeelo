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

    // 1) 기존 계정으로 로그인 시도
    let session = null
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      // 기사 역할: 관리자가 미리 등록해둔 경우 첫 로그인 시 계정 자동 생성
      if (loginRole === 'driver' && (signInError.message.includes('Invalid login credentials') || signInError.message.includes('invalid_credentials'))) {
        // 전화번호로 관리자 등록 기사가 있는지 확인
        const { data: preRegistered } = await (supabase as any)
          .from('drivers')
          .select('id')
          .eq('phone', phone)
          .is('auth_id', null)
          .maybeSingle()

        if (!preRegistered) {
          return { error: '등록되지 않은 기사이거나 비밀번호가 올바르지 않습니다.' }
        }

        // 계정 생성 시도 (첫 로그인)
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) {
          // 이미 auth 계정이 있지만 비밀번호가 다른 경우
          if (signUpError.message.toLowerCase().includes('already registered') || signUpError.message.toLowerCase().includes('already been registered')) {
            return { error: '이미 가입된 전화번호입니다. 가입 시 설정한 비밀번호를 입력해주세요.' }
          }
          return { error: '계정 생성에 실패했습니다: ' + signUpError.message }
        }

        // 생성 후 바로 로그인
        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password })
        if (retryError) return { error: retryError.message }
      } else {
        return { error: '전화번호 또는 비밀번호가 올바르지 않습니다.' }
      }
    }

    const { data: { session: currentSession } } = await supabase.auth.getSession()
    session = currentSession

    if (!session) return { error: '로그인에 실패했습니다.' }

    localStorage.setItem('coffeelo_role', loginRole)

    // 2) auth_id로 기존 사용자 조회
    const table = loginRole === 'driver' ? 'drivers' : loginRole === 'cafe' ? 'cafes' : 'companies'
    const { data: existingUser } = await (supabase as any)
      .from(table)
      .select('*')
      .eq('auth_id', session.user.id)
      .maybeSingle()

    if (existingUser) {
      setUser(existingUser)
      setRole(loginRole)
      setIsLoading(false)
      return {}
    }

    // 3) 기사 역할: 전화번호로 관리자 등록 기사와 매칭 후 auth_id 업데이트
    if (loginRole === 'driver') {
      const { data: driverByPhone } = await (supabase as any)
        .from('drivers')
        .select('*')
        .eq('phone', phone)
        .maybeSingle()

      if (driverByPhone) {
        // auth_id 연결 (최초 로그인 시 한 번만)
        await (supabase as any)
          .from('drivers')
          .update({ auth_id: session.user.id })
          .eq('id', driverByPhone.id)

        setUser({ ...driverByPhone, auth_id: session.user.id })
        setRole('driver')
        setIsLoading(false)
        return {}
      }
      return { error: '등록된 기사 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.' }
    }

    setIsLoading(false)
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
