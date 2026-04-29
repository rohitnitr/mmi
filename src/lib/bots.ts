// Bot profiles for engagement — these are simulated users shown to keep the platform feeling active.
// 12 Indian male names + 8 female names = 20 bots, mostly from Software/Data domains.

export interface BotProfile {
  id: string
  username: string
  experience: string
  domain: string
  target_role: string
  coffee_balance: number
  last_active: string
  created_at: string
  isBot: true
}

const now = new Date()
const recentTime = (minAgo: number) =>
  new Date(now.getTime() - minAgo * 60 * 1000).toISOString()
const pastDate = (daysAgo: number) =>
  new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

export const BOT_PROFILES: BotProfile[] = [
  // Software / IT domain — Male names
  {
    id: 'bot-001', username: 'Arjun_Sharma', experience: '2–5 yrs',
    domain: 'Software / IT', target_role: 'Full Stack Developer',
    coffee_balance: 3, last_active: recentTime(1), created_at: pastDate(45), isBot: true,
  },
  {
    id: 'bot-002', username: 'Rahul_Verma', experience: '0–2 yrs',
    domain: 'Software / IT', target_role: 'Backend Developer',
    coffee_balance: 1, last_active: recentTime(2), created_at: pastDate(30), isBot: true,
  },
  {
    id: 'bot-003', username: 'Vikram_Nair', experience: '5+ yrs',
    domain: 'Software / IT', target_role: 'Engineering Manager',
    coffee_balance: 5, last_active: recentTime(0.5), created_at: pastDate(90), isBot: true,
  },
  {
    id: 'bot-004', username: 'Karan_Mehta', experience: '0–2 yrs',
    domain: 'Software / IT', target_role: 'Frontend Developer',
    coffee_balance: 2, last_active: recentTime(3), created_at: pastDate(20), isBot: true,
  },
  // Data / Analytics — Male names
  {
    id: 'bot-005', username: 'Aditya_Joshi', experience: '2–5 yrs',
    domain: 'Data / Analytics', target_role: 'Data Scientist',
    coffee_balance: 4, last_active: recentTime(1.5), created_at: pastDate(60), isBot: true,
  },
  {
    id: 'bot-006', username: 'Rohan_Gupta', experience: '0–2 yrs',
    domain: 'Data / Analytics', target_role: 'Data Analyst',
    coffee_balance: 2, last_active: recentTime(2.5), created_at: pastDate(15), isBot: true,
  },
  {
    id: 'bot-007', username: 'Siddharth_Roy', experience: '2–5 yrs',
    domain: 'Data / Analytics', target_role: 'ML Engineer',
    coffee_balance: 3, last_active: recentTime(0.8), created_at: pastDate(40), isBot: true,
  },
  {
    id: 'bot-008', username: 'Manish_Patel', experience: '5+ yrs',
    domain: 'Software / IT', target_role: 'Software Architect',
    coffee_balance: 6, last_active: recentTime(4), created_at: pastDate(120), isBot: true,
  },
  {
    id: 'bot-009', username: 'Nikhil_Singh', experience: '0–2 yrs',
    domain: 'Software / IT', target_role: 'DevOps Engineer',
    coffee_balance: 1, last_active: recentTime(5), created_at: pastDate(10), isBot: true,
  },
  {
    id: 'bot-010', username: 'Ayush_Kumar', experience: 'Fresher',
    domain: 'Data / Analytics', target_role: 'Business Analyst',
    coffee_balance: 1, last_active: recentTime(3.5), created_at: pastDate(7), isBot: true,
  },
  {
    id: 'bot-011', username: 'Abhishek_Das', experience: '2–5 yrs',
    domain: 'Software / IT', target_role: 'React Developer',
    coffee_balance: 2, last_active: recentTime(6), created_at: pastDate(55), isBot: true,
  },
  {
    id: 'bot-012', username: 'Gaurav_Mishra', experience: '0–2 yrs',
    domain: 'Data / Analytics', target_role: 'Data Engineer',
    coffee_balance: 2, last_active: recentTime(7), created_at: pastDate(25), isBot: true,
  },
  // Female names
  {
    id: 'bot-013', username: 'Priya_Agarwal', experience: '2–5 yrs',
    domain: 'Data / Analytics', target_role: 'Data Scientist',
    coffee_balance: 3, last_active: recentTime(1), created_at: pastDate(50), isBot: true,
  },
  {
    id: 'bot-014', username: 'Sneha_Reddy', experience: '0–2 yrs',
    domain: 'Software / IT', target_role: 'Frontend Developer',
    coffee_balance: 1, last_active: recentTime(2), created_at: pastDate(18), isBot: true,
  },
  {
    id: 'bot-015', username: 'Anjali_Iyer', experience: 'Fresher',
    domain: 'Software / IT', target_role: 'Software Engineer',
    coffee_balance: 1, last_active: recentTime(0.3), created_at: pastDate(5), isBot: true,
  },
  {
    id: 'bot-016', username: 'Meera_Kapoor', experience: '5+ yrs',
    domain: 'Data / Analytics', target_role: 'Analytics Manager',
    coffee_balance: 5, last_active: recentTime(1.8), created_at: pastDate(100), isBot: true,
  },
  {
    id: 'bot-017', username: 'Ritika_Pandey', experience: '0–2 yrs',
    domain: 'Data / Analytics', target_role: 'Business Analyst',
    coffee_balance: 2, last_active: recentTime(2.2), created_at: pastDate(22), isBot: true,
  },
  {
    id: 'bot-018', username: 'Kavya_Nambiar', experience: '2–5 yrs',
    domain: 'Software / IT', target_role: 'Product Manager',
    coffee_balance: 3, last_active: recentTime(3), created_at: pastDate(65), isBot: true,
  },
  {
    id: 'bot-019', username: 'Divya_Sharma', experience: '0–2 yrs',
    domain: 'Data / Analytics', target_role: 'ML Engineer',
    coffee_balance: 1, last_active: recentTime(4), created_at: pastDate(12), isBot: true,
  },
  {
    id: 'bot-020', username: 'Ishita_Bose', experience: '2–5 yrs',
    domain: 'Software / IT', target_role: 'Backend Developer',
    coffee_balance: 3, last_active: recentTime(1.2), created_at: pastDate(38), isBot: true,
  },
]

// Returns 5-6 "online" bots (those active within last 3 minutes simulated)
// We pick a deterministic random subset that rotates slowly so it feels natural
export function getOnlineBots(): BotProfile[] {
  // Use current 5-minute window to rotate which bots appear "online"
  const window5 = Math.floor(Date.now() / (5 * 60 * 1000))
  const seed = window5 % 15  // Rotate through 15 different combos
  const startIdx = seed % BOT_PROFILES.length
  const count = 5 + (seed % 2) // 5 or 6

  const result: BotProfile[] = []
  for (let i = 0; i < count; i++) {
    result.push(BOT_PROFILES[(startIdx + i * 3) % BOT_PROFILES.length])
  }
  return result
}

// Refresh bot last_active times to "now-ish"
export function getFreshOnlineBots(): BotProfile[] {
  return getOnlineBots().map((b, i) => ({
    ...b,
    last_active: recentTime(i * 0.4 + 0.1),
  }))
}
