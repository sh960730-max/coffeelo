import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = 'https://ysofjeniptffnxfrddns.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb2ZqZW5pcHRmZm54ZnJkZG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzg2NjksImV4cCI6MjA4ODk1NDY2OX0.Ou51cYwBSuF5YIDjSHwX7TA_5YneYIGlzFtkXrlt8O8'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = true
