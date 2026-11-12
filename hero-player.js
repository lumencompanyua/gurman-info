(() => {
  const hero = document.querySelector('.hero');
  const video = document.getElementById('hero-video');
  const still = hero.querySelector('.hero-still');
  const control = hero.querySelector('.hero-video-control');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const demo = new URLSearchParams(location.search).has('demo');
  let started = false;
  video.muted = true;
  video.defaultMuted = true;
  control.hidden = false;
  hero.dataset.videoState = 'ready';

  function syncControl() {
    control.textContent = video.ended ? 'Повторити відео' : video.paused ? 'Відтворити відео' : 'Призупинити відео';
  }
  function play() {
    started = true;
    if (video.ended) video.currentTime = 0;
    video.play().catch(() => { hero.dataset.videoState = 'awaiting-play'; syncControl(); });
  }
  video.addEventListener('playing', () => {
    hero.classList.add('has-video-frame');
    hero.dataset.videoState = 'playing';
    syncControl();
  });
  video.addEventListener('pause', syncControl);
  video.addEventListener('ended', () => {
    // Preserve the decoded last frame without moving or replacing the hero.
    hero.dataset.videoState = 'finished';
    syncControl();
  });
  video.addEventListener('error', () => {
    hero.classList.remove('has-video-frame');
    still.srcset = 'assets/hero_bg-800.webp 800w, assets/hero_bg.webp 1672w';
    still.src = 'assets/hero_bg.webp';
    hero.dataset.videoState = 'unavailable';
    control.hidden = true;
  });
  control.addEventListener('click', () => video.paused || video.ended ? play() : video.pause());
  reduced.addEventListener('change', event => { if (event.matches) video.pause(); });

  if (!reduced.matches && !demo) {
    // ЛР12: кадр-постер і відео (1,4 МБ) не конкурують з першим екраном — підставляються лише після load.
    const startAfterSitePaint = () => {
      if (started || reduced.matches) return;
      if (video.dataset.poster && !video.poster) video.poster = video.dataset.poster; // той самий кадр, що й на картинці
      requestAnimationFrame(() => requestAnimationFrame(play));
    };
    if (document.readyState === 'complete') startAfterSitePaint();
    else window.addEventListener('load', startAfterSitePaint, {once:true});
    // The site remains usable if an optional third-party resource loads slowly.
    window.setTimeout(startAfterSitePaint, 2000);
  }
})();
