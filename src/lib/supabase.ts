import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const FALLBACK_URL = 'https://ysofjeniptffnxfrddns.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb2ZqZW5pcHRmZm54ZnJkZG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzg2NjksImV4cCI6MjA4ODk1NDY2OX0.Ou51cYwBSuF5YIDjSHwX7TA_5YneYIGlzFtkXrlt8O8'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL).trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY).trim()

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = true
