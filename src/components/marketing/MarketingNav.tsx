'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Logo } from './Brand'
import type { CtaProps } from './shared'

const links = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#skills', label: 'Evidence' },
  { href: '/talent', label: 'Talent' },
  { href: '/blog', label: 'Blog' },
]

export default function MarketingNav({ onAuth }: CtaProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <>
      <motion.div className="mh-progress" style={{ scaleX }} aria-hidden="true" />
      <header className={`mh-nav${scrolled ? ' scrolled' : ''}`}>
        <nav aria-label="Main" className="mh-wrap mh-nav-in">
          <Logo />
          <div className="mh-links">
            {links.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
            <button className="mh-btn mh-btn-primary mh-btn-sm" onClick={onAuth}>Build My Portfolio</button>
          </div>
          <button
            className="mh-burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mh-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
        {open && (
          <div id="mh-mobile" className="mh-mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
            <button className="mh-btn mh-btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => { setOpen(false); onAuth() }}>
              Get started
            </button>
          </div>
        )}
      </header>
    </>
  )
}
