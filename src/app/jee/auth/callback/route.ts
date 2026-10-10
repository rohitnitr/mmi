import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Google sign-in lands here: create the session, save the Google name to the JEE profile, go to /jee/welcome.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  if (code) {
    const sb = await createClient()
    const { data, error } = await sb.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>
      const name = [meta.full_name, meta.name].find((v) => typeof v === 'string' && v.trim()) as string | undefined
      try {
        // ignoreDuplicates: a returning student keeps any name edits already saved.
        await getSupabaseAdmin().from('jee_students').upsert(
          { user_id: data.user.id, email: data.user.email ?? '', full_name: name?.trim().slice(0, 80) ?? null },
          { onConflict: 'user_id', ignoreDuplicates: true }
        )
      } catch (e) {
        console.error('[jee callback] profile upsert failed', e)
      }
      return NextResponse.redirect(`${origin}/jee/welcome`)
    }
  }
  return NextResponse.redirect(`${origin}/jee?signin=failed`)
}
