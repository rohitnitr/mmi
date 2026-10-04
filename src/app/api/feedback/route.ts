import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, text } = await req.json()
    const clean = typeof text === 'string' ? text.trim() : ''
    if (!clean) return NextResponse.json({ error: 'Empty feedback' }, { status: 400 })
    if (clean.length > 2000) {
      return NextResponse.json({ error: 'Feedback is too long (max 2000 characters).' }, { status: 400 })
    }
    const db = getSupabaseAdmin()
    const { error } = await db
      .from('feedback')
      .insert({ user_id: typeof userId === 'string' && userId ? userId : null, text: clean })
    if (error) {
      console.error('[feedback] insert failed:', error.message)
      return NextResponse.json({ error: 'Could not save feedback. Please try again.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[feedback] request failed:', e)
    return NextResponse.json({ error: 'Could not save feedback. Please try again.' }, { status: 500 })
  }
}
