'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, Pencil, Maximize2, Minimize2, Save, Globe, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { ImageUpload } from './ImageUpload'
import { slugify } from '@/lib/slugify'
import { CATEGORIES } from '@/lib/blog'

const BlogEditor = dynamic(() => import('./BlogEditor').then((m) => ({ default: m.BlogEditor })), {
  ssr: false,
  loading: () => <div className="min-h-[560px] animate-pulse bg-gray-100 rounded-xl" />,
})

type Form = { title: string; slug: string; content: string; excerpt: string; category: string; tags: string[]; author: string; cover_image: string; read_time: number }
const EMPTY: Form = { title: '', slug: '', content: '', excerpt: '', category: CATEGORIES[0], tags: [], author: 'MMI Team', cover_image: '', read_time: 1 }
const plain = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const PROSE = 'prose prose-lg max-w-none prose-headings:font-extrabold prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2 prose-a:text-blue-600 prose-img:rounded-xl prose-blockquote:border-blue-500 prose-pre:bg-[#0F172A]'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">{title}</h2>
      {children}
    </section>
  )
}
const input = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100'

export default function PostEditor({ mode, slug }: { mode: 'new' | 'edit'; slug?: string }) {
  const router = useRouter()
  const LS = `mmi_blog_draft_${mode === 'new' ? 'new' : slug}`
  const [form, setForm] = useState<Form>(EMPTY)
  const [orig, setOrig] = useState(slug ?? '')
  const [status, setStatus] = useState<'new' | 'draft' | 'published'>(mode === 'new' ? 'new' : 'draft')
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [baseline, setBaseline] = useState(JSON.stringify(EMPTY))
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [preview, setPreview] = useState(false)
  const [full, setFull] = useState(false)
  const [tagText, setTagText] = useState('')
  const [tab, setTab] = useState<'post' | 'seo' | 'outline'>('post')
  const [recover, setRecover] = useState<{ form: Form; at: number } | null>(null)
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null)
  const saveRef = useRef<(t: 'draft' | 'publish' | 'update') => void>(() => {})

  const say = (msg: string, err = false) => { setToast({ msg, err }); setTimeout(() => setToast(null), 3500) }
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))

  // Load the post (edit) and look for an unsaved local backup
  useEffect(() => {
    let on = true
    const finish = (f: Form) => {
      setBaseline(JSON.stringify(f)); setLoaded(true)
      try {
        const raw = localStorage.getItem(LS)
        if (!raw) return
        const { at, ...rest } = JSON.parse(raw) as Form & { at: number }
        if ((rest.title || rest.content) && JSON.stringify(rest) !== JSON.stringify(f)) setRecover({ form: rest as Form, at })
      } catch { /* ignore */ }
    }
    if (mode === 'new') { finish(EMPTY); return }
    fetch(`/api/blog/posts/${slug}?admin=1`).then((r) => r.json()).then((d) => {
      if (!on) return
      if (!d.post) { setMissing(true); return }
      const p = d.post
      const f: Form = { title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt, category: p.category, tags: p.tags || [], author: p.author, cover_image: p.cover_image || '', read_time: p.read_time }
      setForm(f); setStatus(p.status); setPublishedAt(p.published_at ?? null); finish(f)
    }).catch(() => { if (on) setMissing(true) })
    return () => { on = false }
  }, [mode, slug, LS])

  const dirty = loaded && JSON.stringify(form) !== baseline

  // Local autosave, warn before leaving, Ctrl/Cmd+S
  useEffect(() => {
    if (!dirty) return
    const t = setTimeout(() => { try { localStorage.setItem(LS, JSON.stringify({ ...form, at: Date.now() })) } catch { /* ignore */ } }, 1200)
    return () => clearTimeout(t)
  }, [form, dirty, LS])
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveRef.current(status === 'published' ? 'update' : 'draft') } }
    window.addEventListener('beforeunload', warn); window.addEventListener('keydown', key)
    return () => { window.removeEventListener('beforeunload', warn); window.removeEventListener('keydown', key) }
  }, [dirty, status])

  async function save(target: 'draft' | 'publish' | 'update') {
    if (!form.title.trim()) return say('Add a title first', true)
    if (!form.excerpt.trim()) return say('Add an excerpt in the Post panel (or press Generate)', true)
    if (!plain(form.content)) return say('Write something first', true)
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { ...form }
      if (target === 'publish') { payload.status = 'published'; if (!publishedAt) payload.published_at = new Date().toISOString() }
      if (target === 'draft') payload.status = 'draft'
      const isNew = mode === 'new'
      const res = await fetch(isNew ? '/api/blog/posts' : `/api/blog/posts/${orig}`, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) return say(data.error || 'Could not save', true)
      setStatus(data.post.status); setPublishedAt(data.post.published_at ?? null)
      setBaseline(JSON.stringify(form)); setSavedAt(Date.now())
      try { localStorage.removeItem(LS) } catch { /* ignore */ }
      say(target === 'publish' ? 'Published' : target === 'update' ? 'Updated' : 'Draft saved')
      if (isNew || form.slug !== orig) { setOrig(form.slug); router.replace(`/admin/blog/edit/${form.slug}`) }
    } catch { say('Something went wrong', true) } finally { setSaving(false) }
  }
  useEffect(() => { saveRef.current = save })

  const words = plain(form.content).split(' ').filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(words / 200))
  const headings = useMemo(() => Array.from(form.content.matchAll(/<h([234])[^>]*>([\s\S]*?)<\/h\1>/g)).map((m) => ({ level: Number(m[1]), text: plain(m[2]) })), [form.content])
  const checks: [boolean, string][] = [
    [form.title.length >= 30 && form.title.length <= 65, 'Title is 30 to 65 characters'],
    [form.excerpt.length >= 120 && form.excerpt.length <= 160, 'Excerpt is 120 to 160 characters'],
    [!!form.cover_image, 'Has a featured image'],
    [/<h[23]/.test(form.content), 'Uses at least one heading'],
    [!/<img(?![^>]*\balt="[^"]+")[^>]*>/i.test(form.content), 'Every image has alt text'],
    [form.tags.length >= 2, 'Has 2 or more tags'],
    [words >= 600, 'At least 600 words'],
  ]
  const passed = checks.filter((c) => c[0]).length
  const addTag = (raw: string) => {
    const t = raw.trim().replace(/,$/, '').trim()
    if (t && !form.tags.includes(t) && form.tags.length < 10) set('tags', [...form.tags, t])
    setTagText('')
  }
  const gen = () => set('excerpt', (plain(form.content).slice(0, 157).replace(/\s\S*$/, '') + '…').slice(0, 200))
  const status_ = !loaded ? '' : saving ? 'Saving…' : dirty ? 'Unsaved changes' : savedAt ? 'All changes saved' : status === 'published' ? 'Published' : status === 'draft' ? 'Draft' : 'New post'

  if (missing) return <p className="py-20 text-center text-gray-500">That post could not be found. <Link href="/admin/blog" className="text-blue-600 font-semibold">Back to posts</Link></p>
  if (!loaded) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  const dot = status === 'published' ? 'bg-green-500' : 'bg-amber-400'
  const scoreColor = passed >= 6 ? 'bg-green-500' : passed >= 4 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className={full ? 'fixed inset-0 z-[70] overflow-y-auto bg-[#F1F5F9]' : ''}>
      {toast && <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] text-sm font-semibold px-6 py-3 rounded-2xl shadow-2xl text-white ${toast.err ? 'bg-red-600' : 'bg-gray-900'}`}>{toast.msg}</div>}

      <div className={`sticky ${full ? 'top-3' : 'top-[68px]'} z-40 max-w-screen-xl mx-auto px-4`}>
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg shadow-gray-200/60 rounded-2xl px-4 py-2.5">
          <Link href="/admin/blog" className="p-2 rounded-xl text-gray-500 hover:bg-gray-100" title="All posts"><ArrowLeft size={16} /></Link>
          <span className="flex items-center gap-2 text-sm font-bold text-gray-800"><i className={`w-2.5 h-2.5 rounded-full ${dot}`} />{status === 'published' ? 'Published' : 'Draft'}</span>
          <span className={`hidden sm:block text-xs font-medium ${dirty ? 'text-amber-600' : 'text-gray-400'}`}>{status_}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden lg:block text-xs text-gray-400 font-medium mr-1">{words} words · {readTime} min read</span>
            <button type="button" onClick={() => setPreview((p) => !p)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200">{preview ? <><Pencil size={14} /> Edit</> : <><Eye size={14} /> Preview</>}</button>
            <button type="button" onClick={() => setFull((f) => !f)} className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200" title={full ? 'Exit full screen' : 'Distraction-free full screen'}>{full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
            {status === 'published' ? (
              <>
                <button type="button" onClick={() => save('draft')} disabled={saving} className="px-3.5 py-2 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50">Unpublish</button>
                <button type="button" onClick={() => save('update')} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/30 hover:brightness-110 disabled:opacity-50"><Globe size={14} /> Update</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => save('draft')} disabled={saving} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"><Save size={14} /> Save draft</button>
                <button type="button" onClick={() => save('publish')} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/30 hover:brightness-110 disabled:opacity-50"><Globe size={14} /> Publish</button>
              </>
            )}
          </div>
        </div>
      </div>

      {recover && (
        <div className="max-w-screen-xl mx-auto px-4 pt-4">
          <div className="flex flex-wrap items-center gap-3 bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl px-4 py-3">
            <span>We found unsaved changes from {new Date(recover.at).toLocaleString()}.</span>
            <button type="button" onClick={() => { setForm(recover.form); setRecover(null) }} className="font-bold underline">Restore them</button>
            <button type="button" onClick={() => { try { localStorage.removeItem(LS) } catch { /* ignore */ } setRecover(null) }} className="ml-auto text-amber-700 hover:underline">Discard</button>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <div className="min-w-0">
          {preview ? (
            <article className="max-w-[860px] mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sm:p-14">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{form.category}</span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mt-4 leading-tight">{form.title || 'Untitled post'}</h1>
              <p className="text-lg text-gray-500 mt-4">{form.excerpt}</p>
              <p className="text-sm text-gray-400 mt-4">{form.author} · {readTime} min read</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {form.cover_image && <img src={form.cover_image} alt="" className="w-full rounded-2xl mt-8" />}
              <div className={`${PROSE} mt-8`} dangerouslySetInnerHTML={{ __html: form.content }} />
            </article>
          ) : (
            <div className="max-w-[860px] mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {form.cover_image && <img src={form.cover_image} alt="" className="w-full h-56 sm:h-72 object-cover rounded-t-3xl" />}
              <div className="px-6 sm:px-12 pt-10 pb-5">
                <textarea rows={1} value={form.title} placeholder="Add a title…"
                  onChange={(e) => { const title = e.target.value.replace(/\n/g, ' '); setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) })) }}
                  className="w-full text-3xl sm:text-5xl font-extrabold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent tracking-tight leading-tight resize-none [field-sizing:content]" />
                <div className="inline-flex items-center gap-1 mt-4 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs text-gray-400 font-mono max-w-full">
                  <span className="shrink-0">/blog/</span>
                  <input value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)) }} placeholder="web-address-from-title" className="min-w-[180px] bg-transparent outline-none text-blue-600 placeholder:text-gray-300" />
                </div>
              </div>
              <BlogEditor flat content={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html, read_time: Math.max(1, Math.ceil(plain(html).split(' ').filter(Boolean).length / 200)) }))} stickyTop={full ? 'top-[80px]' : 'top-[136px]'} />
            </div>
          )}
        </div>

        <aside className={`space-y-4 xl:sticky ${full ? 'xl:top-[80px]' : 'xl:top-[136px]'} xl:max-h-[calc(100vh-150px)] xl:overflow-y-auto`}>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
            {([['post', 'Post'], ['seo', `SEO ${passed}/${checks.length}`], ['outline', 'Outline']] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${tab === k ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>{l}</button>
            ))}
          </div>

          {tab === 'post' && (
            <>
              <Card title="Summary">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[[words, 'words'], [readTime, 'min read'], [form.tags.length, 'tags']].map(([n, l]) => <div key={l as string} className="rounded-xl bg-gray-50 py-2.5"><p className="text-lg font-extrabold text-gray-900">{n}</p><p className="text-[11px] text-gray-400">{l}</p></div>)}
                </div>
                {status === 'published' && <a href={`/blog/${orig}`} target="_blank" rel="noreferrer" className="block mt-3 text-center text-sm font-semibold text-blue-600 hover:underline">View live post ↗</a>}
              </Card>
              <Card title="Featured image"><ImageUpload value={form.cover_image} onChange={(u) => set('cover_image', u)} /></Card>
              <Card title="Excerpt">
                <textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={3} maxLength={200} placeholder="A short summary that also appears on Google" className={`${input} resize-none`} />
                <div className="flex items-center justify-between mt-1.5">
                  <button type="button" onClick={gen} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"><Sparkles size={12} /> Write it from my post</button>
                  <span className={`text-xs font-mono ${form.excerpt.length > 160 ? 'text-amber-500' : 'text-gray-400'}`}>{form.excerpt.length}/200</span>
                </div>
              </Card>
              <Card title="Category">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => <button key={c} type="button" onClick={() => set('category', c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${form.category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>{c}</button>)}
                </div>
              </Card>
              <Card title="Tags">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((t) => <span key={t} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{t}<button type="button" onClick={() => set('tags', form.tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X size={11} /></button></span>)}
                </div>
                <input value={tagText} onChange={(e) => (e.target.value.endsWith(',') ? addTag(e.target.value) : setTagText(e.target.value))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagText) } if (e.key === 'Backspace' && !tagText && form.tags.length) set('tags', form.tags.slice(0, -1)) }}
                  onBlur={() => addTag(tagText)} placeholder="Type a tag and press Enter" className={input} />
              </Card>
              <Card title="Author"><input value={form.author} onChange={(e) => set('author', e.target.value)} className={input} /></Card>
            </>
          )}

          {tab === 'seo' && (
            <>
              <Card title="How it looks on Google">
                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-500 truncate">matchmyinterview.com › blog › {form.slug || 'your-post'}</p>
                  <p className="text-[15px] text-blue-700 font-medium leading-snug mt-0.5 line-clamp-2">{form.title || 'Your post title'} | MatchMyInterview Blog</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{form.excerpt || 'Your excerpt appears here.'}</p>
                </div>
              </Card>
              <Card title="SEO checklist">
                <div className="flex items-center gap-3 mb-3"><div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden"><div className={`h-full rounded-full transition-all ${scoreColor}`} style={{ width: `${(passed / checks.length) * 100}%` }} /></div><span className="text-xs font-bold text-gray-600">{passed}/{checks.length}</span></div>
                <ul className="space-y-2">
                  {checks.map(([ok, label]) => <li key={label} className={`flex items-start gap-2 text-sm ${ok ? 'text-green-700' : 'text-gray-600'}`}>{ok ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-500" />}{label}</li>)}
                </ul>
              </Card>
            </>
          )}

          {tab === 'outline' && (
            <Card title="Outline">
              {headings.length === 0 ? <p className="text-sm text-gray-400">Add headings (Heading 2, 3) and they will show here so you can jump around a long post.</p> : (
                <ul className="space-y-1">
                  {headings.map((h, i) => <li key={i} style={{ paddingLeft: (h.level - 2) * 14 }}><button type="button" onClick={() => { setPreview(false); setTimeout(() => document.querySelectorAll('.tiptap h2, .tiptap h3, .tiptap h4')[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50) }} className="text-left text-sm text-gray-700 hover:text-blue-600 truncate w-full py-1">{h.text || '(empty heading)'}</button></li>)}
                </ul>
              )}
            </Card>
          )}
          <p className="text-[11px] text-gray-400 px-1">Ctrl/Cmd+S saves · paste or drop an image to upload it.</p>
        </aside>
      </div>
    </div>
  )
}
