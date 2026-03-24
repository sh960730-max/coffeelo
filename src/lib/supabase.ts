import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key').trim()

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/* 개발 환경에서 Supabase 미연결 시 더미 모드로 동작 */
export const isSupabaseConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'
