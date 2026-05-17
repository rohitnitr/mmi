import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const db = getSupabaseAdmin()

  // Read current views
  const { data } = await db
    .from('blog_posts')
    .select('views')
    .eq('slug', slug)
    .single()

  if (!data) return NextResponse.json({ ok: false }, { status: 404 })

  // Increment
  await db
    .from('blog_posts')
    .update({ views: (data.views || 0) + 1 })
    .eq('slug', slug)

  return NextResponse.json({ ok: true })
}
