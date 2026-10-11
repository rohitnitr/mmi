import { redirect } from 'next/navigation'

// Kept so old links still work. The real home after sign-in is the dashboard.
export default function Welcome() {
  redirect('/jee/dashboard')
}
