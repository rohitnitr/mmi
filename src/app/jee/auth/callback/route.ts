import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Email sign-in link lands here: sign the student in, create their JEE profile row, send them to /jee/welcome.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  if (code) {
    const sb = await createClient()
    const { data, error } = await sb.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      await getSupabaseAdmin().from('jee_students').upsert(
        { user_id: data.user.id, email: data.user.email ?? '' },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )
      return NextResponse.redirect(`${origin}/jee/welcome`)
    }
  }
  return NextResponse.redirect(`${origin}/jee?signin=failed`)
}
