import { safePlay } from './video-source.js';

/**
 * Work project modal (brief §5/§6):
 *  - click on a project → overlay with the project video, autoplay + loop
 *  - Close button, Esc and click outside all close it
 *  - body scroll is locked without jumping and restored to the exact position
 *  - focus is trapped inside and returned to the opener on close
 */
export function initWorkModal() {
  const modal = document.getElementById('work-modal');
  if (!modal) return;

  const video = modal.querySelector('.modal__video');
  const closeBtn = modal.querySelector('.modal__close');
  const inertTargets = [document.querySelector('header'), document.querySelector('main')].filter(Boolean);

  let opener = null;
  let savedScrollY = 0;
  let closeTimer = 0;

  document.addEventListener('click', (e) => {
    const item = e.target.closest('.work__item');
    if (item) open(item);
  });

  closeBtn.addEventListener('click', close);

  // Click outside the video (on the backdrop) closes.
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') trapFocus(e);
  });

  function open(item) {
    if (!modal.hidden) return;
    opener = item;
    window.clearTimeout(closeTimer);

    const ratio = item.dataset.ratio;
    modal.style.setProperty('--modal-ratio', ratio || '1920 / 818');
    if (item.dataset.poster) video.setAttribute('poster', item.dataset.poster);
    video.setAttribute('src', item.dataset.video);
    video.load();

    lockScroll();
    inertTargets.forEach((el) => el.setAttribute('inert', ''));

    modal.hidden = false;
    // Next frame so the opacity transition runs.
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      safePlay(video);
      closeBtn.focus();
    });
  }

  function close() {
    if (modal.hidden) return;
    modal.classList.remove('is-open');
    video.pause();

    const ms = transitionMs(modal);
    closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      // Release the media resource.
      video.removeAttribute('src');
      video.removeAttribute('poster');
      video.load();
    }, ms);

    inertTargets.forEach((el) => el.removeAttribute('inert'));
    unlockScroll();

    if (opener && document.contains(opener)) {
      opener.focus({ preventScroll: true });
      releaseFocusOnPointer(opener);
    }
    opener = null;
  }

  // Focus goes back to the opener for keyboard users. If the user then moves
  // the mouse, drop that focus so the still does not stay enlarged
  // (:focus-visible) while they hover other projects.
  function releaseFocusOnPointer(el) {
    const onMove = () => {
      if (document.activeElement === el) el.blur();
    };
    document.addEventListener('pointermove', onMove, { once: true });
    el.addEventListener('blur', () => document.removeEventListener('pointermove', onMove), { once: true });
  }

  function lockScroll() {
    savedScrollY = window.scrollY;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add('is-locked');
  }

  function unlockScroll() {
    document.body.classList.remove('is-locked');
    document.body.style.top = '';
    // Restore instantly, bypassing CSS smooth scroll.
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, savedScrollY);
    root.style.scrollBehavior = prev;
  }

  function trapFocus(e) {
    const focusables = Array.from(
      modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => !el.disabled);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function transitionMs(el) {
    const raw = getComputedStyle(el).transitionDuration.split(',')[0].trim();
    const n = parseFloat(raw) || 0;
    return raw.endsWith('ms') ? n : n * 1000;
  }
}
