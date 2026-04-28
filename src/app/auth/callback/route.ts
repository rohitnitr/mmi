import { NextRequest, NextResponse } from 'next/server'

// Handles Supabase OAuth redirect (Google etc.)
// After OAuth, Supabase redirects here with a code, then we send user home.
export async function GET(req: NextRequest) {
  const { origin } = new URL(req.url)
  // Supabase JS client handles token exchange automatically via detectSessionInUrl
  // Just redirect to home — the client-side code picks up the session from URL hash
  return NextResponse.redirect(origin)
}
