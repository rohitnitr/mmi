import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/jee/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUCKET = 'jee-figures'
const TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }
const MAX = 2 * 1024 * 1024

// Uploads a question figure to a public storage bucket and returns its https link.
export async function POST(req: NextRequest) {
  const { ok } = await getAdmin()
  if (!ok) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })
  let file: FormDataEntryValue | null = null
  try { file = (await req.formData()).get('file') } catch { /* handled below */ }
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'Choose an image file.' }, { status: 400 })
  const ext = TYPES[file.type]
  if (!ext) return NextResponse.json({ error: 'Only PNG, JPG or WebP images are allowed.' }, { status: 400 })
  if (file.size > MAX) return NextResponse.json({ error: 'Image must be under 2 MB. Crop it tighter or compress it.' }, { status: 400 })

  const admin = getSupabaseAdmin()
  const bucket = await admin.storage.getBucket(BUCKET)
  if (!bucket.data) {
    const made = await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX, allowedMimeTypes: Object.keys(TYPES) })
    if (made.error && !/already exists/i.test(made.error.message)) return NextResponse.json({ error: made.error.message }, { status: 500 })
  }
  const path = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const up = await admin.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false })
  if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 })
  return NextResponse.json({ ok: true, url: admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl })
}
