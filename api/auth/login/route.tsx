import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return NextResponse.json({ error: 'incorect data to login' }, { status: 401 })

  return NextResponse.json({ session: data.session }, { status: 200 })
}
