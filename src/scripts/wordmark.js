const REF_SIZE = 200; // px used to measure the glyphs before scaling

/**
 * Giant "Levitere" at the end of Contact: real text scaled so its glyphs span
 * exactly from the left gutter to the right gutter, whatever font is actually
 * installed (Helvetica, Arial, ...). CSS keeps a sane size if JS never runs.
 */
export function initWordmark() {
  const el = document.querySelector('.contact__wordmark');
  if (!el) return;

  const range = document.createRange();
  let raf = 0;

  function fit() {
    raf = 0;
    const available = el.clientWidth;
    if (!available) return;

    el.style.fontSize = `${REF_SIZE}px`;
    range.selectNodeContents(el);
    const measured = range.getBoundingClientRect().width;
    if (!measured) {
      el.style.fontSize = '';
      return;
    }
    el.style.fontSize = `${((available / measured) * REF_SIZE).toFixed(2)}px`;
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(fit);
  }

  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  fit();
}
