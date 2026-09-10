import { isMobile, mobileMQ } from './media.js';

/**
 * Picks the desktop or mobile source/poster for a <video> from its data
 * attributes, so only one file is ever requested:
 *   data-src-desktop / data-poster-desktop
 *   data-src-mobile  / data-poster-mobile
 * Returns true when the source changed (caller may want to play()).
 */
export function applyVideoSource(video) {
  const variant = isMobile() ? 'Mobile' : 'Desktop';
  const src = video.dataset[`src${variant}`] || video.dataset.srcDesktop;
  const poster = video.dataset[`poster${variant}`] || video.dataset.posterDesktop;

  if (poster && video.getAttribute('poster') !== poster) {
    video.setAttribute('poster', poster);
  }
  if (!src || video.getAttribute('src') === src) return false;

  video.setAttribute('src', src);
  video.load();
  return true;
}

/** Re-apply sources on breakpoint change for a set of videos. */
export function watchVideoSources(videos, onChange) {
  mobileMQ.addEventListener('change', () => {
    videos.forEach((video) => {
      if (applyVideoSource(video) && onChange) onChange(video);
    });
  });
}

/** Autoplay helper: muted must be set as a property for iOS/Safari. */
export function safePlay(video) {
  video.muted = true;
  video.defaultMuted = true;
  const p = video.play();
  if (p && typeof p.catch === 'function') {
    // Autoplay can be refused (Low Power Mode, data saver). The poster stays.
    p.catch(() => {});
  }
}
