'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import Youtube from '@tiptap/extension-youtube'
import { useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Code, Link2, Unlink, Image as ImageIcon, Table as TableIcon, Video, Minus,
  Undo, Redo, Loader2, Check, X,
} from 'lucide-react'
import './blog-editor.css'

interface BlogEditorProps {
  content: string
  onChange: (html: string) => void
  stickyTop?: string
}

function Btn({ onClick, active, title, disabled, children }: { onClick: () => void; active?: boolean; title: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={title} aria-label={title} disabled={disabled}
      className={`p-2 rounded-md transition-colors disabled:opacity-40 ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'}`}>
      {children}
    </button>
  )
}
const Sep = () => <div className="w-px h-5 bg-gray-300 mx-1" />
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export function BlogEditor({ content, onChange, stickyTop = 'top-14' }: BlogEditorProps) {
  const [panel, setPanel] = useState<'link' | 'video' | null>(null)
  const [url, setUrl] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  const [alt, setAlt] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<(f: File) => void>(() => {})

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl' } }),
      Placeholder.configure({ placeholder: 'Start writing, or paste your draft here. Drop or paste images to upload them.' }),
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Table, TableRow, TableHeader, TableCell,
      Youtube.configure({ nocookie: true }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'min-h-[560px] outline-none px-6 sm:px-10 py-8 prose prose-lg max-w-none focus:outline-none prose-headings:font-extrabold prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2 prose-a:text-blue-600 prose-img:rounded-xl prose-blockquote:border-blue-500 prose-pre:bg-[#0F172A]' },
      handlePaste: (_v, e) => {
        const f = Array.from(e.clipboardData?.files ?? []).find((x) => x.type.startsWith('image/'))
        if (!f) return false
        uploadRef.current(f); return true
      },
      handleDrop: (_v, e) => {
        const f = Array.from((e as DragEvent).dataTransfer?.files ?? []).find((x) => x.type.startsWith('image/'))
        if (!f) return false
        e.preventDefault(); uploadRef.current(f); return true
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) editor.commands.setContent(content)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  if (!editor) return <div className="min-h-[560px] animate-pulse bg-gray-100 rounded-xl" />

  uploadRef.current = async (file: File) => {
    setError('')
    if (!TYPES.includes(file.type)) return setError('Use a JPEG, PNG, WebP, GIF or AVIF image.')
    if (file.size > 5 * 1024 * 1024) return setError('Image is over 5 MB.')
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/blog/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setPending(data.url); setAlt(''); setPanel(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed') } finally { setUploading(false) }
  }

  const block = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('heading', { level: 4 }) ? 'h4' : 'p'
  const setBlock = (v: string) => { const c = editor.chain().focus(); if (v === 'p') c.setParagraph().run(); else c.setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run() }
  const open = (p: 'link' | 'video') => { setPending(null); setUrl(p === 'link' ? ((editor.getAttributes('link').href as string) || '') : ''); setPanel(p) }
  const apply = () => {
    let u = url.trim()
    if (panel === 'link') {
      if (!u) editor.chain().focus().extendMarkRange('link').unsetLink().run()
      else { if (!/^(https?:\/\/|mailto:|\/|#)/i.test(u)) u = 'https://' + u; editor.chain().focus().extendMarkRange('link').setLink({ href: u }).run() }
    } else if (u) editor.chain().focus().setYoutubeVideo({ src: u }).run()
    setPanel(null)
  }
  const insertImage = () => { if (pending) editor.chain().focus().setImage({ src: pending, alt }).run(); setPending(null) }
  const words: number = editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className={`sticky ${stickyTop} z-20 bg-gray-50/95 backdrop-blur border-b border-gray-200 rounded-t-xl`}>
        <div className="flex flex-wrap items-center gap-0.5 p-2">
          <select value={block} onChange={(e) => setBlock(e.target.value)} aria-label="Block type" className="h-9 mr-1 px-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 cursor-pointer focus:outline-none focus:border-blue-400">
            <option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option>
          </select>
          <Sep />
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)"><Bold size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)"><Italic size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)"><UnderlineIcon size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter size={16} /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left"><AlignLeft size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center"><AlignCenter size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right"><AlignRight size={16} /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bulleted list"><List size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><Code size={16} /></Btn>
          <Sep />
          <Btn onClick={() => open('link')} active={editor.isActive('link')} title="Insert link"><Link2 size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()} disabled={!editor.isActive('link')} title="Remove link"><Unlink size={16} /></Btn>
          <Btn onClick={() => fileRef.current?.click()} disabled={uploading} title="Insert image">{uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}</Btn>
          <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table"><TableIcon size={16} /></Btn>
          <Btn onClick={() => open('video')} title="Embed YouTube video"><Video size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={16} /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={16} /></Btn>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadRef.current(f); e.target.value = '' }} />
        </div>
        {editor.isActive('table') && (
          <div className="flex items-center gap-1 px-3 pb-2 text-xs font-semibold text-gray-600">
            Table:
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-100">+ Row</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-100">+ Column</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-100">− Row</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-100">− Column</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteTable().run()} className="px-2 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">Delete table</button>
          </div>
        )}
        {panel && (
          <div className="flex items-center gap-2 px-3 pb-2">
            <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply() } if (e.key === 'Escape') setPanel(null) }}
              placeholder={panel === 'link' ? 'Paste or type a link, e.g. https://matchmyinterview.com/blog/…' : 'Paste a YouTube link'}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
            <button type="button" onClick={apply} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" title="Apply"><Check size={14} /></button>
            <button type="button" onClick={() => setPanel(null)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200" title="Cancel"><X size={14} /></button>
          </div>
        )}
        {pending && (
          <div className="flex items-center gap-3 px-3 pb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pending} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
            <input autoFocus value={alt} onChange={(e) => setAlt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); insertImage() } }}
              placeholder="Describe the image (alt text, helps SEO and accessibility)" className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
            <button type="button" onClick={insertImage} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Insert image</button>
            <button type="button" onClick={() => setPending(null)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200" title="Discard"><X size={14} /></button>
          </div>
        )}
        {error && <p className="px-3 pb-2 text-xs font-medium text-red-600">{error}</p>}
      </div>

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between px-6 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 rounded-b-xl">
        <span>{words.toLocaleString()} words</span>
        <span>~{Math.max(1, Math.ceil(words / 200))} min read</span>
      </div>
    </div>
  )
}
