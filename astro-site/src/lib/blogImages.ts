import type { ImageMetadata } from 'astro';
import brandBestie from '../assets/images/blog-brand-bestie.png';
import mafs from '../assets/images/blog-mafs.png';
import noMoreMarketingMayhem from '../assets/images/blog-no-more-marketing-mayhem.png';
import swAgree from '../assets/images/sw-agree.png';
import swCoffee from '../assets/images/sw-coffee.png';
import swExplain from '../assets/images/sw-explain.png';
import swNotebook from '../assets/images/sw-notebook.png';
import swReady from '../assets/images/sw-ready.png';
import swTeam from '../assets/images/sw-team.png';
import swTogether from '../assets/images/sw-together.png';
import swWorkingTwo from '../assets/images/sw-working-2.png';

export interface BlogImageEntry {
  image: ImageMetadata;
  imageAlt: string;
}

export const BLOG_IMAGES: Record<string, BlogImageEntry> = {
  '7-marketing-priorities-for-australian-small-businesses': {
    image: swNotebook,
    imageAlt: 'Notebook and planning materials on a desk',
  },
  'ai-marketing-workflow-from-prompt-to-publish': {
    image: swWorkingTwo,
    imageAlt: 'Team workflow and planning session',
  },
  'brand-positioning-checklist-for-small-business-owners': {
    image: swExplain,
    imageAlt: 'Person explaining brand strategy concepts',
  },
  'how-small-businesses-can-use-ai-without-losing-their-voice': {
    image: swTeam,
    imageAlt: 'Small team collaborating closely',
  },
  'how-to-describe-your-business-in-one-sentence': {
    image: swCoffee,
    imageAlt: 'Coffee and notes during a messaging workshop',
  },
  'human-first-marketing-in-an-ai-world': {
    image: swTogether,
    imageAlt: 'Team collaborating together',
  },
  'marketing-clarity-for-small-brands': {
    image: swReady,
    imageAlt: 'Team prepared and ready to start',
  },
  'no-more-marketing-mayhem': {
    image: noMoreMarketingMayhem,
    imageAlt: 'Laptop showing Splendid Wren Marketing tools on a desk',
  },
  'what-to-fix-first-when-your-marketing-feels-scattered': {
    image: swAgree,
    imageAlt: 'Two people aligned on next priorities',
  },
  'what-marketing-and-mafs-have-in-common': {
    image: mafs,
    imageAlt: 'A couple cutting a wedding cake at a reception',
  },
  'why-small-business-owners-need-a-brand-bestie': {
    image: brandBestie,
    imageAlt: 'Two women smiling and talking over notebooks and coffee',
  },
};
