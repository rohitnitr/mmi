import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, SITE_URL, SOCIAL_LINKS } from '@/lib/site'

export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: SITE_EMAIL,
        logo: `${SITE_URL}/logo.svg`,
        sameAs: SOCIAL_LINKS.map((s) => s.href),
        foundingDate: '2025',
        description: SITE_DESCRIPTION,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: `${SITE_NAME} — Peer mock interviews`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
