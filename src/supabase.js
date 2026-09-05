import { createClient } from '@supabase/supabase-js'

// The URL and anon key are public-by-design values protected by RLS. Environment
// variables are preferred; these fallbacks keep a preview functional if Vercel
// has not finished propagating project variables yet. Never put service_role here.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://sizrynbmhetayvyjivby.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpenJ5bmJtaGV0YXl2eWppdmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTU3NDcsImV4cCI6MjEwNDE5MTc0N30.MEzXzGUaKi6nk0BahtNa5fDv3hIRXuy8mHobffeDfA4'

// The app remains usable locally without credentials. Add the two public env
// values to turn on hosted auth, catalogue sync, and storage.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
