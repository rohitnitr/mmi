export type Guide = {
  slug: string
  title: string
  description: string
  updated: string
  body: string[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'mock-interview-practice',
    title: 'How to run a useful mock interview',
    description: 'A practical structure for 45-minute peer mock interviews: roles, timing, questions, and notes.',
    updated: 'October 2026',
    body: [
      'A mock interview is useful when it feels slightly uncomfortable and still stays kind. You need a clock, a role, and a person who will interrupt you.',
      'Agree the format before you start. Forty-five minutes is enough for most first sessions: five minutes to set context, twenty-five minutes of interview, ten minutes of reverse interview, five minutes of verbal feedback. Write the agenda in chat so neither of you drifts.',
      'Pick one role. “Software engineer” is too broad. “Backend engineer, Java, 0–2 years” is usable. Share a job description or a short list of skills. If you do not have a posting, invent a realistic one and stick to it.',
      'The interviewer should prepare eight questions and expect to use five. Mix a walk-through of a past project, one debugging or case prompt, and one communication check such as explaining a trade-off to a non-engineer. Leave room for follow-ups. The value is in the second question, not the first.',
      'The candidate should treat it as live. Open a blank note, think out loud, and ask clarifying questions. If you freeze, say so and restart the thought. That is closer to a real round than a memorised speech.',
      'After you switch roles, submit written feedback the same day. Rate communication, problem solving, and role knowledge separately. One specific example is worth more than a paragraph of praise. Then book the next session while both calendars are open.',
      'Do this twice a week for a month and you will have a trail of evidence — which questions hurt, which stories landed, and which skills peers actually observed. That trail is what MatchMyInterview is for.',
      'Common mistakes: arriving with no job description, spending twenty minutes on introductions, skipping the reverse interview, and never writing feedback. If you only have thirty minutes, cut introductions, not the write-up.',
      'For technical roles, keep a shared notepad. Paste the prompt. Ask the candidate to restate constraints. If they jump to code, pause them and ask for an approach first. That single habit mirrors most real onsite rounds.',
      'For consulting, product, finance, HR, and government exams, the same skeleton still works. Change the prompt, not the clock. A case, a campaign brief, a ratio analysis, a grievance scenario, or a current-affairs question can all fill the twenty-five minute block.',
      'Record only if both people agree. Many peers prefer notes. If you do record, say where the file lives and when you will delete it. MatchMyInterview is for practice, not for publishing someone else’s voice without consent.',
      'Bring a closing question you actually care about: “What would you ask me in a real loop?” or “Which part of my story sounded rehearsed?” Those answers are often more useful than the score.',
      'Finally, protect the relationship. Thank the person. Offer a second session only if you both want one. Ghosting after a session wastes the credit and the trust the platform needs to work.',
    ],
  },
  {
    slug: 'peer-feedback',
    title: 'How to give peer interview feedback that people can use',
    description: 'Write feedback that is specific, fair, and tied to what happened in the session.',
    updated: 'October 2026',
    body: [
      'Feedback fails when it is vague or when it is cruel. The job is to describe what you heard and what would make the next answer stronger.',
      'Start with the situation. Quote the question. Note the time you spent on it. Then describe the answer in plain language: what was clear, what was missing, and where you had to guess.',
      'Separate skill from nerves. Someone can know SQL and still ramble. Someone can be calm and still skip the constraint. Ratings on MatchMyInterview exist so those are not mixed into one “overall vibe” score.',
      'Use examples. “You jumped to an index before asking about write volume” is usable. “Improve your fundamentals” is not. If you cannot point to a moment in the session, you are not ready to rate that skill.',
      'End with one next action. A single drill beats a list of ten books. Suggest they redo the same prompt in 24 hours, or rewrite their project story in 90 seconds.',
      'If you disagree with your peer’s self-view, say so politely. Evidence only works if evaluators are honest. Do not inflate scores to be nice. Do not punish someone for an accent, a slow network, or a topic outside the agreed role.',
      'A simple template: (1) what went well, with one quote, (2) what to change next time, with one drill, (3) scores on the rubric, (4) optional resources. Keep it under 200 words. Long essays rarely get reread.',
      'Calibrate your scale. A 5 should mean you would send this person into a real round on that skill with little coaching. A 3 means competent with gaps. A 1 means the skill was not demonstrated. If everyone is a 5, the portfolio becomes noise.',
      'Write in the language you used in the session. If the interview was in English, keep feedback in English unless you both prefer another language. Clarity beats polish.',
      'Never paste the other person’s answers onto public social media. Feedback on MatchMyInterview is for the two of you and for the evidence model. Public shaming is a policy violation.',
      'If you are new to interviewing others, it is fine to say so. Read the question out loud. Take ten seconds before you probe. Good interviewers are curious, not theatrical.',
    ],
  },
  {
    slug: 'interview-portfolio',
    title: 'Build an interview portfolio instead of another resume rewrite',
    description: 'Why peer-validated evidence is more useful than another round of adjective-heavy bullet points.',
    updated: 'October 2026',
    body: [
      'Resumes list claims. Interviewers test those claims in a short window. A portfolio of peer interviews sits between those two: it shows you practiced the conversation, not only the document.',
      'On MatchMyInterview, skills move from self-declared to interviewed, peer evaluated, and — with enough independent sessions — peer validated. You cannot assign yourself a validation score. That constraint is the point.',
      'Keep the public profile honest. Use your real name if you are comfortable, a clear photo, a headline that names the role, and links a recruiter can check. Hide the profile if you are only practicing privately. Public proof is opt-in.',
      'Quality beats volume. Ten rushed chats with friends who skip feedback will not help. Four complete sessions with written notes, different peers, and a repeated weak topic will. Recruiters can tell the difference even if they never open your MMI link.',
      'Pair the portfolio with your own notes. After each session, write what you would do differently in the real round. That private log is for you. The public page is for evidence. Together they replace the habit of rewriting the same resume at midnight.',
      'Think of the portfolio as a lab notebook. Date the sessions. Name the role. List the prompts. Capture one lesson. Over eight weeks you will see patterns: system design stories that run long, SQL that skips indexes, HR answers that stay abstract.',
      'Share the public link only when you are ready. A half-empty profile with one session can still help a friend, but a hiring manager will bounce. Aim for a complete header, a handful of skills, and enough evaluations that a stranger can see consistency.',
      'Do not buy fake proof. Do not ask friends to rubber-stamp 5/5 scores. MatchMyInterview is useful because the evidence is inconvenient to fake at scale. If you game it, you only fool yourself before the real loop.',
      'Use the blog and these guides to fill knowledge gaps, then come back to a live peer. Reading without a session is still solo rehearsal. The portfolio needs conversations.',
      'If you are returning after a career break, the portfolio is especially helpful. You do not need a perfect recent employer logo. You need recent, dated practice with people who asked you hard questions.',
    ],
  },
  {
    slug: 'first-peer-session',
    title: 'Your first MatchMyInterview session: a checklist',
    description: 'What to do before you send a coffee invite and after the call ends.',
    updated: 'October 2026',
    body: [
      'Complete your profile first. Peers ignore empty cards. Add experience, domain, target role, and at least three skills you actually want tested.',
      'Read the Terms of Service so you know how coffee credits work. One credit sends an invite. If it is not accepted in 24 hours, the credit returns. If it is accepted, the credit is used. New members get one free credit.',
      'Choose someone close to your level. A 5+ year interviewer can still help a fresher, but two people targeting the same role usually produce better reverse interviews.',
      'Test your microphone in a quiet room. Keep water nearby. Close extra tabs. Agree whether you will use the in-product chat, a voice room, or both.',
      'When the session ends, submit feedback before you check messages. Then send a short thank-you. If the session was useful, schedule another with a different peer so you do not overfit to one style.',
      'If something felt unsafe or off-policy, leave the session and email support@matchmyinterview.com. Harassment is not “tough interview practice”.',
      'Before you click invite, write three bullets: the role, the skills to test, and the time you can give. Paste those bullets into the invite note. Peers accept clear notes more often than empty ones.',
      'Have a fallback prompt. If your first question dies in thirty seconds, you should not scramble. Keep a debugging story, a “tell me about a conflict”, and a lightweight case on paper.',
      'After feedback, update your profile the same evening. Add a skill you actually demonstrated. Remove a skill you could not defend. Accuracy is a kindness to the next peer.',
      'If nobody accepts, widen the domain slightly or change the time window. Do not spam the same people. Check the refund policy: unused invites return the coffee automatically.',
      'Celebrate the unglamorous win: you showed up, you were interviewed, you interviewed someone else, and you wrote it down. That is more interview-ready than another night of scrolling question banks.',
    ],
  },
]

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug) || null
}
