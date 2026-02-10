import type { NavItem, SocialLink } from './types';

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
  { label: 'Tools', href: '/tools' },
];

export const FOOTER_LEGAL_ITEMS: NavItem[] = [
  { label: 'Terms Of Use', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61586855053532', icon: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/splendidwrenmarketing/', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/111485312/admin/dashboard/', icon: 'linkedin' },
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

export function withSiteTitle(title: string): string {
  if (title.includes(SITE.name)) {
    return title;
  }

  return `${title} | ${SITE.name}`;
}
