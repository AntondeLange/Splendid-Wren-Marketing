import type { ImageTransform } from 'astro';
import noop from 'astro/assets/services/noop';

// Astro 7.4 separates static build optimization from runtime URL generation.
// Dynamic pages use prebuilt/imported assets directly: no fetch and no decoder.
export default {
  validateOptions: noop.validateOptions,
  getHTMLAttributes: noop.getHTMLAttributes,
  getSrcSet: noop.getSrcSet,
  getURL({ src }: ImageTransform) {
    return typeof src === 'string' ? src : src.src;
  },
};
