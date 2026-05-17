'use client'

import dynamic from 'next/dynamic'
import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SEOFields } from '@/components/admin/SEOFields'
import { slugify } from '@/lib/slugify'
import { ArrowLeft, Save, Globe, Eye } from 'lucide-react'

const BlogEditor = dynamic(() => import('@/components/admin/BlogEditor').then(m => ({ default: m.BlogEditor })), {
  ssr: false,
  loading: () => <div className="min-h-[400px] rounded-xl bg-gray-100 animate-pulse" />,
})

interface FormState {
  title: string; slug: string; content: string; excerpt: string
  category: string; tags: string; author: string; cover_image: string; read_time: number
}

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // ✅ Fix: unwrap Promise params with React.use()
  const { slug } = use(params)

  const router = useRouter()
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetch(`/api/blog/posts/${slug}?admin=1`)
      .then(r => r.json())
      .then(data => {
        if (data.post) {
          const p = data.post
          setForm({
            title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt,
            category: p.category, tags: (p.tags || []).join(', '),
            author: p.author, cover_image: p.cover_image || '', read_time: p.read_time,
          })
        }
      })
  }, [slug])

  const handleField = useCallback((field: string, value: string | number) => {
    setForm(f => f ? { ...f, [field]: value } : f)
  }, [])

  const handleContent = useCallback((html: string) => {
    const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
    const read_time = Math.max(1, Math.ceil(words / 200))
    setForm(f => f ? { ...f, content: html, read_time } : f)
  }, [])

  const handleSave = async (publish?: boolean) => {
    if (!form) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        ...form,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      }
      if (publish !== undefined) {
        payload.status = publish ? 'published' : 'draft'
        if (publish) payload.published_at = new Date().toISOString()
      }
      const res = await fetch(`/api/blog/posts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) return showToast(data.error || 'Failed to save', 'err')
      showToast('Saved! ✓')
      router.push('/admin/blog')
    } catch {
      showToast('Something went wrong', 'err')
    } finally {
      setSaving(false)
    }
  }

  if (!form) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading post...</p>
    </div>
  )

  return (
    <div>
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-sm font-semibold px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-sm border transition-all ${
          toast.type === 'ok'
            ? 'bg-gray-900/95 text-white border-gray-700'
            : 'bg-red-600/95 text-white border-red-500'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit Post</h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">/blog/{form.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/blog/${slug}`} target="_blank" className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Eye size={14} /> Preview
          </Link>
          <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            <Save size={14} /> Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 shadow-sm shadow-blue-500/20">
            <Globe size={14} /> {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          <input
            type="text"
            value={form.title}
            onChange={e => {
              const title = e.target.value
              setForm(f => f ? { ...f, title, slug: slugify(title) } : f)
            }}
            placeholder="Post title..."
            className="w-full text-3xl font-extrabold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent tracking-tight"
          />
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50/80 rounded-xl px-4 py-2.5 border border-gray-100 font-mono">
            <span className="text-gray-300 flex-shrink-0">matchmyinterview.com/blog/</span>
            <input
              type="text"
              value={form.slug}
              onChange={e => setForm(f => f ? { ...f, slug: slugify(e.target.value) } : f)}
              className="flex-1 bg-transparent outline-none text-gray-600 min-w-0"
            />
          </div>
          <BlogEditor content={form.content} onChange={handleContent} />
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5">Post Settings</h2>
            <SEOFields form={form} onChange={handleField} />
          </div>
        </div>
      </div>
    </div>
  )
}
