import Link from 'next/link'
import './blog.css'

export function BlogCTA() {
  return (
    <div className="bl-cta">
      <span className="k">MatchMyInterview</span>
      <h2>Reading is step one. Proof is the goal.</h2>
      <p>Interview real peers, get structured feedback on your skills, and build a professional portfolio backed by evidence.</p>
      <div className="row">
        <Link href="/" className="p">Build My Portfolio</Link>
        <Link href="/#how-it-works" className="g">See how it works</Link>
      </div>
    </div>
  )
}
