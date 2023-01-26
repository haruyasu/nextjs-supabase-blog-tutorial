// Supabase Client
import { headers, cookies } from 'next/headers'
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../utils/database.types'

export const createClient = () =>
  createServerComponentSupabaseClient<Database>({
    headers,
    cookies,
  })
