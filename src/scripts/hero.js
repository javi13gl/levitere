import { applyVideoSource, watchVideoSources, safePlay } from './video-source.js';

/** Hero video: highest priority, loads immediately. */
export function initHero() {
  const video = document.querySelector('.hero__video');
  if (!video) return;

  applyVideoSource(video);
  safePlay(video);
  watchVideoSources([video], safePlay);
}
