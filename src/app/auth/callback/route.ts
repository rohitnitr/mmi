import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Handles Supabase OTP/OAuth redirect.
// Exchanges the auth code for a session via PKCE — this is the required step.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next') ?? '/'

  if (error) {
    console.error('[auth/callback] error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const forwardedHost = req.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    // Create the response object FIRST so we can attach cookies to it
    let supabaseResponse: NextResponse
    if (isLocalEnv) {
      supabaseResponse = NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      supabaseResponse = NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      supabaseResponse = NextResponse.redirect(`${origin}${next}`)
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              // Set on the request
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
              // Set on the response
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            } catch (error) {
              console.error('Cookie set error in callback:', error)
            }
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return supabaseResponse
    }
    console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message)
  }

  // Fallback — redirect home and let client-side handle it
  return NextResponse.redirect(`${origin}/`)
}
