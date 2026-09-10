/**
 * Small IntersectionObserver helper: calls onEnter / onLeave when `el`
 * crosses the viewport (with a margin so media can warm up just before).
 * Returns a function that stops observing.
 */
export function observeVisibility(el, { onEnter, onLeave, rootMargin = '25% 0px', threshold = 0 } = {}) {
  if (!('IntersectionObserver' in window)) {
    if (onEnter) onEnter();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (onEnter) onEnter(entry);
        } else if (onLeave) {
          onLeave(entry);
        }
      });
    },
    { rootMargin, threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}
