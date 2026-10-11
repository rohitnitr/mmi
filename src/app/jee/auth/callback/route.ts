import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Google sign-in lands here: create the session, save the Google name, then send new students to onboarding and returning ones to the dashboard.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  if (code) {
    const sb = await createClient()
    const { data, error } = await sb.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>
      const name = [meta.full_name, meta.name].find((v) => typeof v === 'string' && v.trim()) as string | undefined
      let dest = '/jee/onboarding'
      try {
        const admin = getSupabaseAdmin()
        // ignoreDuplicates: a returning student keeps the name and number they already saved.
        await admin.from('jee_students').upsert(
          { user_id: data.user.id, email: data.user.email ?? '', full_name: name?.trim().slice(0, 80) ?? null },
          { onConflict: 'user_id', ignoreDuplicates: true }
        )
        const { data: stu } = await admin.from('jee_students').select('onboarded_at').eq('user_id', data.user.id).maybeSingle()
        if ((stu as { onboarded_at?: string | null } | null)?.onboarded_at) dest = '/jee/dashboard'
      } catch (e) {
        console.error('[jee callback] profile step failed', e)
      }
      // New students give name and mobile first, then land in the store. Returning students go to the dashboard.
      return NextResponse.redirect(`${origin}${dest}`)
    }
  }
  return NextResponse.redirect(`${origin}/jee?signin=failed`)
}
