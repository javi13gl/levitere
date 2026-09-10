import { applyVideoSource, watchVideoSources, safePlay } from './video-source.js';
import { observeVisibility } from './visibility.js';

const SWIPE_MIN_PX = 40;

/**
 * "A Vision Trusted By Leading Brands" (brief §7/§8/§15):
 *  - no interaction: each video plays once, `ended` → next, in a cycle
 *  - any interaction (dot, keyboard, swipe): auto-advance is off for the rest of
 *    the session and the chosen video loops until the user picks another
 *  - dots: active highlighted, hover micro-scale, click switches
 *  - mobile: horizontal swipe with pointer events (vertical scroll untouched)
 *  - videos only load/play while the carousel is in the viewport
 */
export function initCarousel() {
  const root = document.getElementById('brands-carousel');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.carousel__slide'));
  const videos = slides.map((s) => s.querySelector('.carousel__video'));
  const dots = Array.from(root.querySelectorAll('.carousel__dot'));
  if (slides.length === 0) return;

  let index = 0;
  let auto = true; // becomes false forever after the first interaction
  let visible = false;

  videos.forEach((video, i) => {
    video.loop = false;
    video.addEventListener('ended', () => {
      if (auto && i === index && visible) go(i + 1, false);
    });
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => go(i, true));
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = e.key === 'ArrowRight' ? i + 1 : i - 1;
        go(next, true);
        dots[mod(next)].focus();
      }
    });
  });

  const swipe = initSwipe(root, (dir) => go(index + dir, true));

  // Click on the left / right half of the video → previous / next (manual mode).
  const slidesEl = root.querySelector('.carousel__slides');
  slidesEl.addEventListener('click', (e) => {
    if (swipe.consumeSwipe()) return; // a swipe just happened, ignore its click
    const rect = slidesEl.getBoundingClientRect();
    const dir = e.clientX - rect.left < rect.width / 2 ? -1 : 1;
    go(index + dir, true);
  });

  observeVisibility(root, {
    onEnter: () => {
      visible = true;
      activate(index);
    },
    onLeave: () => {
      visible = false;
      videos[index].pause();
    },
  });

  watchVideoSources(videos, (video) => {
    if (video === videos[index] && visible) safePlay(video);
  });

  function go(target, manual) {
    const next = mod(target);
    if (manual) auto = false;
    if (next === index) {
      // Re-selecting the current slide still switches it to loop mode.
      videos[index].loop = !auto;
      return;
    }

    const prev = index;
    index = next;

    slides[prev].classList.remove('is-active');
    slides[next].classList.add('is-active');
    dots.forEach((dot, i) => {
      const on = i === next;
      dot.classList.toggle('is-active', on);
      if (on) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    activate(next);
    // Pause the outgoing video once the crossfade has finished.
    window.setTimeout(() => {
      if (index !== prev) videos[prev].pause();
    }, transitionMs(slides[prev]));
  }

  function activate(i) {
    const video = videos[i];
    video.loop = !auto;
    if (!visible) return;
    applyVideoSource(video);
    if (video.readyState > 0 && video.currentTime > 0 && video.ended) video.currentTime = 0;
    safePlay(video);
    // Warm up the next slide so the crossfade is seamless.
    const next = videos[mod(i + 1)];
    if (applyVideoSource(next)) next.preload = 'auto';
  }

  function mod(i) {
    return (i + slides.length) % slides.length;
  }
}

/** Horizontal swipe detection with pointer events. `touch-action: pan-y` on the
 *  element lets the browser keep vertical scrolling; we only act on clear
 *  horizontal gestures. */
function initSwipe(el, onSwipe) {
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let swiped = false;

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    tracking = true;
    swiped = false;
  });

  el.addEventListener('pointerup', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped = true;
      onSwipe(dx < 0 ? 1 : -1);
    }
  });

  el.addEventListener('pointercancel', () => {
    tracking = false;
  });

  return {
    /** True once if the last pointer gesture was a swipe (so the click after it is ignored). */
    consumeSwipe() {
      const was = swiped;
      swiped = false;
      return was;
    },
  };
}

function transitionMs(el) {
  const raw = getComputedStyle(el).transitionDuration.split(',')[0].trim();
  const n = parseFloat(raw) || 0;
  return raw.endsWith('ms') ? n : n * 1000;
}
