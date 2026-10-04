'use client'

import { useState } from 'react'
import { Check, Link2, MessageCircle } from 'lucide-react'
import './blog.css'

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://matchmyinterview.com'
  const url = `${base}/blog/${slug}`
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="bl-share">
      <span className="l">Share</span>
      <button className="bl-sbtn copy" onClick={copy}>{copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}{copied ? 'Copied' : 'Copy link'}</button>
      <a className="bl-sbtn li" href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a className="bl-sbtn wa" href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} aria-hidden="true" />WhatsApp</a>
      <a className="bl-sbtn x" href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} target="_blank" rel="noopener noreferrer">X</a>
    </div>
  )
}
