import { isMobile, prefersReducedMotion } from './media.js';


/**
 * Section copy fade-out (client request, 2026-09-09, final version):
 * [data-pin] texts are ordinary in-flow content that scrolls with the page,
 * exactly like the images next to them. A text is fully visible at its resting
 * position and fades out progressively while it leaves the viewport through the
 * top edge: opacity goes from 1 at its resting position to 0 once it is fully out.
 * The last section cannot scroll out, so its text fades over the scroll left.
 * Desktop only; off with reduced motion.
 */
export function initScrollFade() {
  const sections = Array.from(document.querySelectorAll('main > section'));
  const lastSection = sections[sections.length - 1];
  const items = Array.from(document.querySelectorAll('[data-pin]')).map((el) => ({
    el,
    section: el.closest('section'),
    restTop: 0,
    sectionTop: 0,
    height: 0,
  }));
  if (items.length === 0) return;

  let ticking = false;

  function active() {
    return !isMobile() && !prefersReducedMotion();
  }

  function measure() {
    items.forEach((item) => {
      const rect = item.el.getBoundingClientRect();
      const sectionTop = item.section.getBoundingClientRect().top + window.scrollY;
      item.sectionTop = sectionTop;
      item.restTop = rect.top + window.scrollY - sectionTop;
      item.height = rect.height;
    });
    update();
  }

  function update() {
    ticking = false;
    if (!active()) {
      items.forEach((item) => {
        item.el.style.opacity = '';
      });
      return;
    }
    const y = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    items.forEach((item) => {
      let opacity;
      const available = maxScroll - item.sectionTop;
      if (item.section === lastSection && available > 0) {
        // Bottom of the page: fade over whatever scroll is left.
        opacity = 1 - (y - item.sectionTop) / available;
      } else {
        // Fully solid at its resting position (so a menu jump lands on crisp text),
        // then fades to nothing as it leaves through the top of the viewport.
        const top = item.el.getBoundingClientRect().top;
        opacity = (top + item.height) / (item.height + item.restTop);
      }
      item.el.style.opacity = Math.min(Math.max(opacity, 0), 1).toFixed(3);
    });
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
