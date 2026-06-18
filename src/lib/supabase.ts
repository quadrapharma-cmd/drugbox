import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://eyyewrqtyevxmtsisopo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5eWV3cnF0eWV2eG10c2lzb3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NTM2NTUsImV4cCI6MjA5NzIyOTY1NX0.KeXghps_rRB9ASoqLcymolwlW9kafPmGqx9wp60BHo8'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const supabase = createClient()
