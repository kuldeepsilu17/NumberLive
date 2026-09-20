import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://numberlive.in';

export function constructMetadata({
  title = 'NumberLive - Open Public Number Records & Historical Results',
  description = 'Check official public number records, daily timetable schedules, and multi-year historical chart archives. Informational and non-gambling platform.',
  path = '/',
  keywords = ['number results', 'historical charts', 'public number records', 'delhi results', 'daily timetable', 'number statistics'],
}: {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
} = {}): Metadata {
  const url = `${BASE_URL}${path}`;

  return {
    title: {
      default: title,
      template: `%s | NumberLive`,
    },
    description,
    keywords,
    authors: [{ name: 'NumberLive Editorial Team' }],
    creator: 'NumberLive Records',
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'NumberLive',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export function generateStructuredData(gameName?: string, date?: string, result?: string) {
  if (gameName && date && result) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `${gameName} Daily Public Number Result`,
      description: `Official historical record and published number result for ${gameName} on ${date}.`,
      temporalCoverage: date,
      publisher: {
        '@type': 'Organization',
        name: 'NumberLive Records',
        url: BASE_URL,
      },
      variableMeasured: 'Published Public Number',
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NumberLive',
    url: BASE_URL,
    description: 'India’s Open Public Number Records, Schedules, and Historical Chart Archive.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
