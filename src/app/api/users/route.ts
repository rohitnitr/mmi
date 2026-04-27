import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

function generateUsername() {
  return `User_${Math.floor(1000 + Math.random() * 9000)}`
}

export async function POST(req: NextRequest) {
  try {
    const { userId, experience } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const db = getSupabaseAdmin()
    const { data: existing } = await db.from('users').select('*').eq('id', userId).single()
    if (existing) return NextResponse.json({ user: existing })

    let username = generateUsername()
    for (let i = 0; i < 5; i++) {
      const { data: check } = await db.from('users').select('id').eq('username', username).single()
      if (!check) break
      username = generateUsername()
    }

    const { data: newUser, error } = await db
      .from('users')
      .insert({ id: userId, username, experience: experience || '0-2 yrs', coffee_balance: 1 })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await db.from('transactions').insert({ user_id: userId, type: 'credit', amount: 1, reason: 'topup' })
    return NextResponse.json({ user: newUser })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
