import type { NavItem, SocialLink } from './types';

const DEFAULT_GOOGLE_ANALYTICS_MEASUREMENT_ID = 'G-TBWM98H36R';

export const GOOGLE_ANALYTICS_MEASUREMENT_ID =
  import.meta.env.PUBLIC_GA_MEASUREMENT_ID?.trim() || DEFAULT_GOOGLE_ANALYTICS_MEASUREMENT_ID;

export const SITE = {
  name: 'Splendid Wren Marketing',
  siteUrl: 'https://splendidwrenmarketing.com.au',
  locale: 'en_AU',
  defaultTitle: 'Splendid Wren Marketing | Small Business Marketing Consultancy',
  defaultDescription:
    'Warm, clear, and human-focused marketing guidance for small businesses in Australia.',
  defaultOgImage: '/favicon.png',
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'How We Work', href: '/how-we-work' },
  { label: 'Blog', href: '/blog' },
];

export const FOOTER_LEGAL_ITEMS: NavItem[] = [
  { label: 'Terms Of Use', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61586855053532', icon: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/splendidwrenmarketing/', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/111485312/', icon: 'linkedin' },
];

export const COMPANY_EMAIL = 'hello@splendidwrenmarketing.com.au';

export const LAND_ACKNOWLEDGEMENT =
  'Splendid Wren Marketing acknowledges the traditional owners of the land on which we live and work. We pay our respects to elders past, present and emerging.';

export const DEFAULT_CTA = {
  title: 'Ready to get started?',
  description:
    'Start with our FREE brand audit. A fresh, honest look at your brand and a clearer sense of what to do next.',
  label: 'Contact Us',
  href: '/contact',
};

export function buildAbsoluteUrl(pathname: string): string {
  return new URL(pathname, SITE.siteUrl).toString();
}

export function getPrimaryBusinessSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE.siteUrl}/#business`,
    name: SITE.name,
    url: `${SITE.siteUrl}/`,
    logo: buildAbsoluteUrl('/favicon.png'),
    image: buildAbsoluteUrl('/favicon.png'),
    description: SITE.defaultDescription,
    email: COMPANY_EMAIL,
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
    serviceType: [
      'Marketing strategy consulting',
      'Brand positioning',
      'Small business marketing support',
      'AI-assisted marketing systems',
    ],
    sameAs: SOCIAL_LINKS.map((item) => item.href),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: COMPANY_EMAIL,
      availableLanguage: ['en'],
    },
  };
}

export function withSiteTitle(title: string): string {
  if (title.includes(SITE.name)) {
    return title;
  }

  return `${title} | ${SITE.name}`;
}
