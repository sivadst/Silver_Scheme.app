import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey && 
         supabaseUrl !== 'https://your-project-id.supabase.co' &&
         supabaseAnonKey !== 'your-anon-key-here'
}

// Show warning if not configured
if (!isSupabaseConfigured()) {
  console.warn(
    '⚠️ Supabase is not configured. Please update your .env.local file with:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your-actual-project-url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key\n\n' +
    'Get these from: https://app.supabase.com -> Your Project -> Settings -> API'
  )
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
)
