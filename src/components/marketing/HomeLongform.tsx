import Link from 'next/link'

export default function HomeLongform() {
  return (
    <article className="mh-long" aria-labelledby="mmi-guide-h2">
      <div className="mh-wrap">
        <p className="mh-eyebrow">Interview practice guide</p>
        <h2 id="mmi-guide-h2">How to use MatchMyInterview to prepare for real interviews</h2>
        <p className="mh-lead">
          Most candidates prepare alone: they reread notes, watch videos, and hope the first live interview feels
          familiar. That rarely works. Interviews are conversations under pressure. You need another person, a
          realistic role, and honest feedback. MatchMyInterview is built for that loop.
        </p>

        <div className="mh-long-grid">
          <div>
            <h3>What the platform is</h3>
            <p>
              MatchMyInterview is a peer-to-peer mock interview platform. You create a professional profile, find
              someone preparing for a similar role, and interview each other. After the session, you exchange
              structured feedback. Over time those evaluations become skill evidence on a shareable portfolio —
              not a self-written claim, but a record of what peers observed.
            </p>
            <p>
              The product is designed for graduates, career switchers, working professionals, and anyone who wants
              live practice before a campus drive, a product round, a consulting case, a data interview, or a
              government exam oral. It is not a job board and it does not promise placements. Practice is the
              product.
            </p>

            <h3>Why peer practice beats solo rehearsal</h3>
            <p>
              Talking to yourself hides the hard parts: interruptions, follow-up questions, unclear answers, and
              the moment you freeze. A peer will ask “why?”, ask you to simplify, or take a different path through
              the same problem. That is closer to a hiring loop than another round of flashcards.
            </p>
            <p>
              Feedback also needs structure. “You did well” does not help you improve. Ratings on technical
              knowledge, problem solving, communication, and role knowledge — plus a written note — give you
              something you can act on before the next session. That is the difference between activity and
              preparation.
            </p>

            <h3>A practical way to run your first week</h3>
            <ol>
              <li>Create a complete profile: name, photo, headline, target role, skills, and links.</li>
              <li>Read the <Link href="/guides/mock-interview-practice">mock interview practice guide</Link> and pick one role to practice.</li>
              <li>Invite a peer whose domain and experience are close to yours.</li>
              <li>Run a timed session. One of you interviews; then you switch.</li>
              <li>Submit structured feedback the same day, while the conversation is still fresh.</li>
              <li>Update your notes. Book another session within 48 hours so the learning sticks.</li>
            </ol>
            <p>
              New members receive a free coffee credit to send a first invite. If the other person does not accept
              within 24 hours, that credit is returned automatically. Details are in the{' '}
              <Link href="/terms">Terms of Service</Link> and <Link href="/refund">Refund Policy</Link>.
            </p>
          </div>
          <aside>
            <h3>Pages worth bookmarking</h3>
            <ul>
              <li><Link href="/about">About MatchMyInterview</Link></li>
              <li><Link href="/guides">Interview guides</Link></li>
              <li><Link href="/blog">Interview playbook blog</Link></li>
              <li><Link href="/talent">Peer talent directory</Link></li>
              <li><Link href="/contact">Contact and support</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/search">Search the site</Link></li>
            </ul>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/founder.jpg" alt="Rohit Poddar, founder of MatchMyInterview" width={640} height={640} />
              <figcaption>Built in India by Rohit Poddar and collaborators who care about honest interview practice.</figcaption>
            </figure>
          </aside>
        </div>

        <h3>Content, safety, and advertising</h3>
        <p>
          Public pages on this site — including the homepage, guides, and blog — are original educational content
          about interview preparation. We do not publish adult, violent, hateful, or pirated material. We do not
          make medical, legal, or guaranteed-income claims. Career advice here is general information, not a
          promise of a job offer. See the <Link href="/disclaimer">Disclaimer</Link>.
        </p>
        <p>
          If Google AdSense or similar advertising appears in the future, it will follow our{' '}
          <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link>. You can
          accept or reject non-essential cookies from the consent banner. Contact us any time at{' '}
          <a href="mailto:support@matchmyinterview.com">support@matchmyinterview.com</a>.
        </p>
        <p>
          If you are a recruiter browsing public portfolios, treat peer scores as one signal among many. If you are
          a candidate, treat every session as a rehearsal: prepare a brief, keep time, take notes, and thank your
          peer. The people who improve fastest are the ones who show up twice a week, not the ones who wait for a
          perfect schedule.
        </p>
      </div>
    </article>
  )
}
