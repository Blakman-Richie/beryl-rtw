import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The app remains usable locally without credentials. Add the two public env
// values to turn on hosted auth, catalogue sync, and storage.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
