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
  // ЛР12: постер — та сама картинка, що вже завантажена для першого екрана (на телефоні — версія 800 px), без повторного запиту.
  function setPoster() {
    if (!video.poster) video.poster = still.currentSrc || video.dataset.poster;
  }
  function play() {
    started = true;
    setPoster();
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

  // ЛР12: відео (1,4 МБ) стартує саме лише на екранах від 768 px і без режиму економії трафіку;
  // на телефоні його вмикають кнопкою «Відтворити відео», а перший екран показує той самий кадр як картинку.
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const autoplayAllowed = matchMedia('(min-width: 768px)').matches && !saveData;

  if (!reduced.matches && !demo && autoplayAllowed) {
    // Відео не конкурує з першим екраном — запускається лише після події load.
    const startAfterSitePaint = () => {
      if (started || reduced.matches) return;
      requestAnimationFrame(() => requestAnimationFrame(play));
    };
    if (document.readyState === 'complete') startAfterSitePaint();
    else window.addEventListener('load', startAfterSitePaint, {once:true});
    // The site remains usable if an optional third-party resource loads slowly.
    window.setTimeout(startAfterSitePaint, 2000);
  }
})();
