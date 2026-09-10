/* Single source of truth for the responsive breakpoint and motion preference.
   Keep in sync with the media queries in src/styles. */
export const MOBILE_QUERY = '(max-width: 767px)';

export const mobileMQ = window.matchMedia(MOBILE_QUERY);
export const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

export const isMobile = () => mobileMQ.matches;
export const prefersReducedMotion = () => reducedMotionMQ.matches;
