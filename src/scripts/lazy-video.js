import { applyVideoSource, watchVideoSources, safePlay } from './video-source.js';
import { observeVisibility } from './visibility.js';

/**
 * Any <video data-lazy> only gets its source when it approaches the viewport,
 * plays while visible and pauses when it leaves (battery/CPU, brief §15).
 */
export function initLazyVideos() {
  const videos = Array.from(document.querySelectorAll('video[data-lazy]'));
  if (videos.length === 0) return;

  const visible = new Set();

  videos.forEach((video) => {
    observeVisibility(video, {
      onEnter: () => {
        visible.add(video);
        applyVideoSource(video);
        safePlay(video);
      },
      onLeave: () => {
        visible.delete(video);
        video.pause();
      },
    });
  });

  watchVideoSources(videos, (video) => {
    if (visible.has(video)) safePlay(video);
  });
}
