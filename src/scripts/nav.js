import { prefersReducedMotion } from './media.js';

/**
 * Header behaviour (brief §3, §14 + Emilio's designs):
 *  - Over the hero: white nav + white hero copy fade out progressively
 *    while scrolling (CSS var --hero-fade, animates opacity only).
 *  - Once the white background reaches the header: `is-dark` class,
 *    black wordmark. Section labels live in the sections (scroll-fade.js).
 *  - Smooth scroll is native (CSS scroll-behavior) via anchor links.
 */
export function initNav() {
  const header = document.getElementById('header');
  const hero = document.getElementById('home');
  if (!header || !hero) return;

  const root = document.documentElement;
  let heroHeight = 0;
  let headerHeight = 0;
  let ticking = false;

  function measure() {
    heroHeight = hero.offsetHeight;
    headerHeight = header.offsetHeight;
    update();
  }

  function update() {
    ticking = false;
    const y = window.scrollY;

    // Progressive fade over the first half of the hero. With reduced motion
    // there is no gradient: it is either fully visible or gone.
    const fadeEnd = Math.max(heroHeight * 0.5, 1);
    let fade = 1 - Math.min(Math.max(y / fadeEnd, 0), 1);
    if (prefersReducedMotion()) fade = y < headerHeight ? 1 : 0;
    root.style.setProperty('--hero-fade', fade.toFixed(3));

    // Dark header as soon as the white background slides under it.
    header.classList.toggle('is-dark', y >= heroHeight - headerHeight);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
}
