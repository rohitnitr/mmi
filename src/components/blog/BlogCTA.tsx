import Link from 'next/link'

export function BlogCTA() {
  return (
    <div
      className="relative overflow-hidden text-center"
      style={{ background: '#0F172A', borderRadius: '12px', padding: '48px 32px', textAlign: 'center' }}
    >
      {/* Dot pattern */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
      {/* Glow */}
      <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.2),transparent 70%)' }} />

      <div className="relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '20px' }}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ))}
          <span className="text-xs ml-2" style={{ color: '#64748B' }}>Trusted by 500+ candidates</span>
        </div>

        <h2 className="font-extrabold tracking-tight mb-3" style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', color: '#FFFFFF', maxWidth: '480px', margin: '0 auto 12px', textAlign: 'center' }}>
          Ready to ace your next interview?
        </h2>
        <p className="text-sm mb-8 mx-auto" style={{ color: '#64748B', maxWidth: '380px', lineHeight: '1.7', textAlign: 'center', margin: '0 auto 32px' }}>
          Practice with real peers on MatchMyInterview. Get actionable feedback and land your dream job — completely free.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-white font-bold text-sm transition-all"
          style={{ background: '#2563EB', borderRadius: '8px', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }}
        >
          Start Practicing Free →
        </Link>

        <p className="text-xs" style={{ color: '#475569', marginTop: '16px', textAlign: 'center' }}>No credit card · No signup needed · Instant access</p>
      </div>
    </div>
  )
}
