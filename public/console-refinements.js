/* BSEG 009. Cosmetic header motion and effects-browser affordance; no engine changes. */
(() => {
  function install() {
    if (document.body.classList.contains('bseg-009')) return;
    document.body.classList.add('bseg-009');
    const wordmark = document.querySelector('.logo-sub');
    if (wordmark) wordmark.innerHTML = 'SPECTRAL EFFECTS <span class="goblin-word">GOBLIN</span>';
    const guardian = document.querySelector('.guardian-portrait img');
    if (guardian) { guardian.src = 'assets/header-guardian.webp'; guardian.alt = 'Guardian in the original facing direction from the approved header reference'; }
    const header = document.querySelector('.topbar');
    if (header) {
      const sparks = document.createElement('span');
      sparks.className = 'header-sparkles'; sparks.setAttribute('aria-hidden', 'true');
      [[5,20,13],[18,75,8],[32,17,10],[49,72,9],[63,22,13],[76,76,10],[89,20,12],[96,61,9]].forEach(([x,y,size],i) => {
        const star = document.createElement('i');
        star.style.cssText = `--x:${x}%;--y:${y}%;--size:${size}px;--period:${4.3+i%3*.7}s;--delay:${-i*.6}s`;
        sparks.append(star);
      });
      header.append(sparks);
    }
    const list = document.getElementById('effectsList');
    if (list) {
      list.tabIndex = 0;
      list.setAttribute('aria-label', 'Effects library. Scroll vertically to browse every effect.');
      const cue = document.createElement('p');
      cue.className = 'effects-scroll-cue'; list.after(cue);
      let queued = false;
      const update = () => {
        queued = false;
        const count = list.querySelectorAll('[data-add-fx]').length;
        const remaining = list.scrollHeight - list.clientHeight - list.scrollTop;
        const text = `${count} effects · ` + (list.scrollHeight <= list.clientHeight + 3 ? 'all shown' : remaining > 4 ? 'scroll for more ↓' : 'end of list ↑');
        if (cue.textContent !== text) cue.textContent = text;
      };
      const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
      list.addEventListener('scroll', schedule, {passive:true});
      new ResizeObserver(schedule).observe(list);
      new MutationObserver(schedule).observe(list, {childList:true});
      schedule();
    }
    window.__BSEG_REFINEMENTS__ = '009';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
