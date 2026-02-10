/**
 * signup/route.tsx - API route for user registration in Smile Live App
 * This route handles POST requests to create a new user account using Supabase authentication.
 * 
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase' // 

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ user: data.user }, { status: 200 })
}
