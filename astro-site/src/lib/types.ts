import type { ImageMetadata } from 'astro';

export interface PageMeta {
  title: string;
  description: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
  noindex?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
}

export type SocialIcon = 'facebook' | 'instagram' | 'linkedin';

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export interface HeroImage {
  src: ImageMetadata;
  alt: string;
  wrapperClass?: string;
}
