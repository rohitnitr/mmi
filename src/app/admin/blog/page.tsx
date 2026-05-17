'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Globe, FileText, Eye, RefreshCw, Clock, ArrowUpRight } from 'lucide-react'
import { BlogPost } from '@/lib/blog'

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/blog/posts?admin=1')
      const data = await res.json()
      setPosts(data.posts || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) return
    const res = await fetch(`/api/blog/posts/${slug}`, { method: 'DELETE' })
    if (res.ok) { showToast('Post deleted'); load() }
    else showToast('Delete failed', 'err')
  }

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/blog/posts/${post.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }),
    })
    if (res.ok) { showToast(newStatus === 'published' ? 'Published ✓' : 'Moved to draft'); load() }
    else showToast('Update failed', 'err')
  }

  const published = posts.filter(p => p.status === 'published')
  const drafts = posts.filter(p => p.status === 'draft')
  const totalViews = posts.reduce((s, p) => s + p.views, 0)

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl border transition-all ${
          toast.type === 'ok'
            ? 'bg-gray-900/95 text-white border-gray-700'
            : 'bg-red-600/95 text-white border-red-500'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Blog Posts</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create and manage your articles</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus size={16} /> New Post
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: posts.length, icon: FileText, color: 'text-gray-900', iconBg: 'bg-gray-100' },
          { label: 'Published', value: published.length, icon: Globe, color: 'text-emerald-700', iconBg: 'bg-emerald-50' },
          { label: 'Drafts', value: drafts.length, icon: Clock, color: 'text-amber-700', iconBg: 'bg-amber-50' },
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-blue-700', iconBg: 'bg-blue-50' },
        ].map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-gray-50 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <FileText size={24} className="text-blue-400" />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-2">No posts yet</p>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">Create your first blog post to start building your audience.</p>
            <Link href="/admin/blog/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20">
              <Plus size={16} /> Create First Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Post', 'Category', 'Status', 'Views', 'Published', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/80">
                {posts.map(post => (
                  <tr key={post.id} className="group hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        {post.cover_image ? (
                          <img src={post.cover_image} alt={post.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                            {post.title.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1 leading-tight">{post.title}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">/blog/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all hover:scale-[1.03] active:scale-95 whitespace-nowrap ${
                          post.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${post.status === 'published' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500 font-medium">{post.views.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(post.published_at)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/blog/${post.slug}`} target="_blank" title="View live"
                          className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <ArrowUpRight size={14} />
                        </Link>
                        <Link href={`/admin/blog/edit/${post.slug}`} title="Edit"
                          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(post.slug, post.title)} title="Delete"
                          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick link to public blog */}
      <div className="flex items-center justify-end">
        <Link href="/blog" target="_blank" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors font-medium">
          <Eye size={13} /> View public blog <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  )
}
