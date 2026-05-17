'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = `https://matchmyinterview.com/blog/${slug}`
  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-gray-500">Share:</span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 text-gray-700 text-sm font-semibold transition-all duration-200 hover:bg-gray-200"
        style={{ padding: '8px 16px', borderRadius: '8px', background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {copied ? <Check size={15} className="text-green-600" /> : <Link2 size={15} />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-white text-sm font-semibold transition-colors hover:bg-[#0856a3]"
        style={{ padding: '8px 16px', borderRadius: '8px', background: '#0A66C2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {/* LinkedIn icon */}
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-white text-sm font-semibold transition-colors hover:bg-gray-800"
        style={{ padding: '8px 16px', borderRadius: '8px', background: '#000000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {/* X/Twitter icon */}
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Twitter
      </a>
    </div>
  )
}
