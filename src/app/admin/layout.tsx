import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, PenLine, BookOpen, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL

  if (!user || !adminEmail || user.email !== adminEmail) redirect('/')

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif]">
      {/* Top nav */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo + badge */}
            <Link href="/admin/blog" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-500/30">
                <BookOpen size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">MMI CMS</span>
            </Link>
            <div className="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-xl p-1">
              <Link href="/admin/blog" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white transition-all">
                <LayoutDashboard size={13} /> Posts
              </Link>
              <Link href="/admin/blog/new" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white transition-all">
                <PenLine size={13} /> New Post
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-black">
                {user.email?.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-gray-500 font-medium">{user.email}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              <LogOut size={13} /> Exit
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-5 py-8">
        {children}
      </main>
    </div>
  )
}
