import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

function generateUsername() {
  return `User_${Math.floor(1000 + Math.random() * 9000)}`
}

export async function POST(req: NextRequest) {
  try {
    const { userId, experience, domain, target_role } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const db = getSupabaseAdmin()

    // Return existing profile if present
    const { data: existing } = await db.from('users').select('*').eq('id', userId).maybeSingle()
    if (existing) return NextResponse.json({ user: existing })

    // Generate unique username
    let username = generateUsername()
    for (let i = 0; i < 5; i++) {
      const { data: taken } = await db.from('users').select('id').eq('username', username).maybeSingle()
      if (!taken) break
      username = generateUsername()
    }

    const { data: newUser, error } = await db
      .from('users')
      .insert({
        id: userId,
        username,
        experience: experience || 'Fresher',
        domain: domain || 'Software / IT',
        target_role: target_role || '',
        coffee_balance: 1,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Welcome coffee transaction
    await db.from('transactions').insert({ user_id: userId, type: 'credit', amount: 1, reason: 'topup' })

    return NextResponse.json({ user: newUser })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH — update profile fields
export async function PATCH(req: NextRequest) {
  try {
    const { userId, experience, domain, target_role, username } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const db = getSupabaseAdmin()
    const updates: Record<string, string> = {}
    if (experience) updates.experience = experience
    if (domain) updates.domain = domain
    if (target_role !== undefined) updates.target_role = target_role
    if (username) updates.username = username

    const { data, error } = await db.from('users').update(updates).eq('id', userId).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ user: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
