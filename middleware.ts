import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Supabase middleware — refreshes the session on every request.
// This is the recommended pattern for Next.js + Supabase SSR.
// Without this, session cookies set during OAuth may not sync to the browser client.
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // First update the request cookies so downstream code can read them
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Then rebuild the response and set cookies on it (this is what the browser receives)
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: This getUser() call is required — it refreshes the session and writes
  // fresh session cookies back to the response. Do not remove it.
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
