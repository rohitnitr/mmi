export const SITE_URL = 'https://matchmyinterview.com'
export const SITE_NAME = 'MatchMyInterview'
export const SITE_EMAIL = 'support@matchmyinterview.com'
export const SITE_FOUNDED = '2025'
export const SITE_DESCRIPTION =
  'Practice mock interviews with real peers, collect structured feedback, and build a professional portfolio backed by evidence.'

export const SOCIAL_LINKS = [
  { href: 'https://twitter.com/matchmyintervew', label: 'X (Twitter)' },
  { href: 'https://linkedin.com/company/matchmyinterview', label: 'LinkedIn' },
  { href: 'https://instagram.com/matchmyinterview', label: 'Instagram' },
  { href: 'https://youtube.com/@matchmyinterview', label: 'YouTube' },
] as const

export const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#skills', label: 'Evidence' },
  { href: '/talent', label: 'Talent' },
  { href: '/blog', label: 'Blog' },
  { href: '/guides', label: 'Guides' },
  { href: '/about', label: 'About' },
] as const

export const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { href: '/', label: 'Home' },
      { href: '/talent', label: 'Talent directory' },
      { href: '/blog', label: 'Blog' },
      { href: '/guides', label: 'Interview guides' },
      { href: '/search', label: 'Search' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact' },
      { href: '/sitemap', label: 'Sitemap' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/disclaimer', label: 'Disclaimer' },
      { href: '/refund', label: 'Refund Policy' },
    ],
  },
] as const
