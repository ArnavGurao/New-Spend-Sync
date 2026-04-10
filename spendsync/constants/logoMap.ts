const GOOGLE_FAVICON_BASE = 'https://www.google.com/s2/favicons';

const BANK_DOMAINS: Record<string, string> = {
  'HDFC Bank': 'https://www.hdfcbank.com',
  'ICICI Bank': 'https://www.icicibank.com',
  'State Bank of India': 'https://www.onlinesbi.sbi',
  'Axis Bank': 'https://www.axisbank.com',
  'Kotak Mahindra Bank': 'https://www.kotak.com',
  'Yes Bank': 'https://www.yesbank.in',
  'IndusInd Bank': 'https://www.indusind.com',
};

const BRAND_DOMAINS: Array<{ match: RegExp; domain: string }> = [
  { match: /netflix/i, domain: 'https://www.netflix.com' },
  { match: /spotify/i, domain: 'https://www.spotify.com' },
  { match: /amazon/i, domain: 'https://www.amazon.in' },
  { match: /youtube/i, domain: 'https://www.youtube.com' },
  { match: /hotstar|disney\+/i, domain: 'https://www.hotstar.com' },
  { match: /zomato/i, domain: 'https://www.zomato.com' },
  { match: /canva/i, domain: 'https://www.canva.com' },
  { match: /adobe/i, domain: 'https://www.adobe.com' },
  { match: /google one|google/i, domain: 'https://one.google.com' },
  { match: /zoom/i, domain: 'https://zoom.us' },
  { match: /swiggy/i, domain: 'https://www.swiggy.com' },
  { match: /linkedin/i, domain: 'https://www.linkedin.com' },
  { match: /notion/i, domain: 'https://www.notion.so' },
  { match: /figma/i, domain: 'https://www.figma.com' },
  { match: /uber/i, domain: 'https://www.uber.com' },
  { match: /ola/i, domain: 'https://www.olacabs.com' },
];

function buildLogoUrl(domainUrl: string): string {
  return `${GOOGLE_FAVICON_BASE}?sz=128&domain_url=${encodeURIComponent(domainUrl)}`;
}

export function getBankLogoUri(bank: string): string | null {
  const domain = BANK_DOMAINS[bank];
  return domain ? buildLogoUrl(domain) : null;
}

export function getSubscriptionLogoUri(name: string): string | null {
  const entry = BRAND_DOMAINS.find((item) => item.match.test(name));
  return entry ? buildLogoUrl(entry.domain) : null;
}

export function getInitials(label: string): string {
  const cleaned = label
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return cleaned || '?';
}
