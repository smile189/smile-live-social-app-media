/**
 * supabase.tsx - Supabase client configuration for Smile Live App
 * authored by BM, responsible for setting up the connection to Supabase for both client-side and server-side operations.
 * This file exports a Supabase client instance configured with the appropriate URL and keys, allowing for seamless integration with the Supabase backend for authentication,
 *  database interactions, and real-time features.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
