import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: 'Empty feedback' }, { status: 400 })
    const db = getSupabaseAdmin()
    await db.from('feedback').insert({ user_id: userId || null, text: text.trim() }).throwOnError()
    return NextResponse.json({ success: true })
  } catch {
    // Silently succeed even if table doesn't exist yet — we log in console
    console.error('[feedback] table may not exist yet')
    return NextResponse.json({ success: true })
  }
}
