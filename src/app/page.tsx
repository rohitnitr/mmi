import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import HomeAuthApp from '@/components/HomeAuthApp'
import GuestHomeWithAuth from '@/components/marketing/GuestHomeWithAuth'
import GuestHomeStatic from '@/components/marketing/GuestHomeStatic'

export default async function Page() {
  let loggedIn = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    loggedIn = !!user
  } catch {
    loggedIn = false
  }

  if (loggedIn) return <HomeAuthApp />

  // The fallback is the real homepage, so the first HTML a search crawler receives
  // contains the actual headings, text and links instead of a loading message.
  return (
    <Suspense fallback={<GuestHomeStatic />}>
      <GuestHomeWithAuth />
    </Suspense>
  )
}
