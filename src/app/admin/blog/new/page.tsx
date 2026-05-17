'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SEOFields } from '@/components/admin/SEOFields'
import { slugify } from '@/lib/slugify'
import { ArrowLeft, Save, Globe, ChevronDown } from 'lucide-react'

const BlogEditor = dynamic(() => import('@/components/admin/BlogEditor').then(m => ({ default: m.BlogEditor })), {
  ssr: false,
  loading: () => (
    <div className="min-h-[480px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading editor...</p>
    </div>
  ),
})

interface FormState {
  title: string; slug: string; content: string; excerpt: string
  category: string; tags: string; author: string; cover_image: string; read_time: number
}

const INITIAL: FormState = {
  title: '', slug: '', content: '', excerpt: '',
  category: 'Interview Tips', tags: '', author: 'MMI Team',
  cover_image: '', read_time: 5,
}

export default function NewPostPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(true)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: slugify(title) }))
  }

  const handleField = useCallback((field: string, value: string | number) => {
    setForm(f => ({ ...f, [field]: value }))
  }, [])

  const handleContent = useCallback((html: string) => {
    const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
    setForm(f => ({ ...f, content: html, read_time: Math.max(1, Math.ceil(words / 200)) }))
  }, [])

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim()) return showToast('Title is required', 'err')
    if (!form.excerpt.trim()) return showToast('Excerpt / meta description is required', 'err')
    if (!form.content || form.content === '<p></p>') return showToast('Content cannot be empty', 'err')

    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: publish ? 'published' : 'draft',
        published_at: publish ? new Date().toISOString() : null,
      }
      const res = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) return showToast(data.error || 'Failed to save', 'err')
      showToast(publish ? '🎉 Published!' : 'Saved as draft')
      router.push('/admin/blog')
    } catch {
      showToast('Something went wrong', 'err')
    } finally {
      setSaving(false)
    }
  }

  const wordCount = form.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-0">
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-2xl shadow-2xl border ${
          toast.type === 'ok'
            ? 'bg-gray-900/95 text-white border-gray-700'
            : 'bg-red-600/95 text-white border-red-500'
        }`}>{toast.msg}</div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-white hover:border-gray-300 transition-all shadow-sm">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">New Article</h1>
            {form.slug && (
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                /blog/<span className="text-blue-500">{form.slug}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wordCount > 0 && (
            <span className="hidden sm:block text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg font-mono">
              {wordCount} words · {form.read_time} min
            </span>
          )}
          <button onClick={() => handleSave(false)} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all shadow-sm disabled:opacity-50">
            <Save size={14} /> Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50">
            <Globe size={14} /> {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Editor Panel ── */}
        <div className="xl:col-span-2 space-y-4">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 pt-6 pb-5">
            <input
              type="text"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Article title..."
              className="w-full text-2xl sm:text-3xl font-extrabold text-gray-900 placeholder:text-gray-200 border-none outline-none bg-transparent tracking-tight leading-tight"
            />
            <div className="flex items-center gap-1 mt-3 text-[11px] text-gray-400 font-mono">
              <span className="text-gray-300">matchmyinterview.com/blog/</span>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                placeholder="auto-generated-slug"
                className="flex-1 bg-transparent outline-none text-gray-500 min-w-0 placeholder:text-gray-200"
              />
            </div>
          </div>

          {/* Rich text editor */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <BlogEditor content={form.content} onChange={handleContent} />
          </div>
        </div>

        {/* ── Settings Panel ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setSettingsOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
            >
              Post Settings
              <ChevronDown size={14} className={`transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
            </button>
            {settingsOpen && (
              <div className="px-5 pb-6 border-t border-gray-50">
                <div className="pt-5">
                  <SEOFields form={form} onChange={handleField} />
                </div>
              </div>
            )}
          </div>

          {/* Tips card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
            <p className="text-xs font-bold text-blue-700 mb-3">✨ SEO Tips</p>
            <ul className="space-y-2 text-xs text-blue-600/80 leading-relaxed">
              <li>• Keep excerpt under 160 chars for best Google preview</li>
              <li>• Use your target keyword in the title & first paragraph</li>
              <li>• Add 2–4 relevant tags for discoverability</li>
              <li>• A cover image increases click-through rate by 40%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
