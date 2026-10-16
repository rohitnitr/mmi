'use client'

import GuestHomepage from '@/components/marketing/GuestHomepage'

// Server-renderable copy of the guest homepage. Its sign-in buttons do nothing until the
// interactive version (GuestHomeWithAuth) takes over a moment later.
export default function GuestHomeStatic() {
  return <GuestHomepage onAuth={() => {}} />
}
