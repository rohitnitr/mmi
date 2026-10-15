'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Quote, Code,
  Link2, Unlink, Image as ImageIcon, Minus, Undo, Redo, Loader2, Check, X,
} from 'lucide-react'

interface BlogEditorProps {
  content: string
  onChange: (html: string) => void
}

function Btn({ onClick, active, title, disabled, children }: { onClick: () => void; active?: boolean; title: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors disabled:opacity-40 ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'}`}
    >
      {children}
    </button>
  )
}
const Sep = () => <div className="w-px h-5 bg-gray-300 mx-1" />

export function BlogEditor({ content, onChange }: BlogEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imgError, setImgError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl' } }),
      Placeholder.configure({ placeholder: 'Start writing your post, or paste it here…' }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'min-h-[520px] outline-none px-8 py-8 prose prose-lg max-w-none focus:outline-none' },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) editor.commands.setContent(content)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  if (!editor) return <div className="min-h-[520px] animate-pulse bg-gray-100 rounded-xl" />

  const block = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('heading', { level: 4 }) ? 'h4' : 'p'
  const setBlock = (v: string) => {
    const c = editor.chain().focus()
    if (v === 'p') c.setParagraph().run()
    else c.setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run()
  }

  const openLink = () => {
    setLinkUrl((editor.getAttributes('link').href as string) || '')
    setLinkOpen(true)
  }
  const applyLink = () => {
    let url = linkUrl.trim()
    if (!url) editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else {
      if (!/^(https?:\/\/|mailto:|\/|#)/i.test(url)) url = 'https://' + url
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    setLinkOpen(false)
  }

  const upload = async (file: File) => {
    setImgError('')
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) return setImgError('Use a JPEG, PNG, WebP, GIF or AVIF image.')
    if (file.size > 5 * 1024 * 1024) return setImgError('Image is over 5 MB.')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/blog/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      const alt = window.prompt('Describe this image (alt text, good for SEO and accessibility):') || ''
      editor.chain().focus().setImage({ src: data.url, alt }).run()
    } catch (e: unknown) {
      setImgError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const words: number = editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length
  const chars: number = editor.storage.characterCount?.characters?.() ?? editor.getText().length

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="sticky top-14 z-20 bg-gray-50/95 backdrop-blur border-b border-gray-200 rounded-t-xl">
        <div className="flex flex-wrap items-center gap-0.5 p-2">
          <select
            value={block}
            onChange={e => setBlock(e.target.value)}
            aria-label="Block type"
            className="h-9 mr-1 px-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 cursor-pointer focus:outline-none focus:border-blue-400"
          >
            <option value="p">Paragraph</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
          <Sep />
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={16} /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bulleted list"><List size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><Code size={16} /></Btn>
          <Sep />
          <Btn onClick={openLink} active={editor.isActive('link')} title="Insert link"><Link2 size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()} disabled={!editor.isActive('link')} title="Remove link"><Unlink size={16} /></Btn>
          <Btn onClick={() => fileRef.current?.click()} disabled={uploading} title="Insert image">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          </Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={16} /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={16} /></Btn>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
        </div>
        {linkOpen && (
          <div className="flex items-center gap-2 px-3 pb-2">
            <input
              autoFocus
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } if (e.key === 'Escape') setLinkOpen(false) }}
              placeholder="Paste or type a link, e.g. https://matchmyinterview.com/blog/..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <button type="button" onClick={applyLink} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" title="Apply"><Check size={14} /></button>
            <button type="button" onClick={() => setLinkOpen(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200" title="Cancel"><X size={14} /></button>
          </div>
        )}
        {imgError && <p className="px-3 pb-2 text-xs font-medium text-red-600">{imgError}</p>}
      </div>

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between px-6 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 rounded-b-xl">
        <span>{words.toLocaleString()} words · {chars.toLocaleString()} characters</span>
        <span>~{Math.max(1, Math.ceil(words / 200))} min read</span>
      </div>
    </div>
  )
}
