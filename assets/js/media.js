// ЛР10 · Ініціалізація медіабібліотек з CDN jsDelivr:
// Swiper.js 11 (слайдер галереї), Fancybox 5 (перегляд фото на весь екран), Typed.js 2.0.12 (ефект друку в Hero).
// ЛР12 · Swiper і Fancybox (≈ 180 КБ JS і CSS) потрібні лише галереї внизу сторінки, тому вони більше не блокують
// перший екран: файли підвантажуються, коли до галереї лишається близько 800 px прокрутки.
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Користувачам, які вимкнули анімації в системі, не вмикаємо автоплей і ефект друку.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initGallery() {
    // ---------- Swiper.js: галерея з 6 слайдів ----------
    if (window.Swiper && document.querySelector('.gallery-swiper') && !document.querySelector('.gallery-swiper').swiper) {
      new Swiper('.gallery-swiper', {
        loop: true,                 // після останнього слайда — знову перший
        speed: 600,                 // тривалість переходу між слайдами, мс
        spaceBetween: 24,           // відстань між слайдами, px
        grabCursor: true,
        keyboard: { enabled: true, onlyInViewport: true },
        autoplay: reduceMotion ? false : {
          delay: 3500,              // пауза між автоматичними переходами, мс
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        pagination: { el: '.gallery-swiper .swiper-pagination', clickable: true },
        navigation: { nextEl: '.gallery-swiper .swiper-button-next', prevEl: '.gallery-swiper .swiper-button-prev' },
        // Mobile-first: ключ — мінімальна ширина вікна.
        breakpoints: {
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
        a11y: {
          prevSlideMessage: 'Попередній слайд',
          nextSlideMessage: 'Наступний слайд',
          firstSlideMessage: 'Перший слайд',
          lastSlideMessage: 'Останній слайд',
          paginationBulletMessage: 'Перейти до слайда {{index}}',
          slideLabelMessage: 'Слайд {{index}} з {{slidesLength}}',
        },
      });
    }

    // ---------- Fancybox 5: альбом gurman-gallery ----------
    if (window.Fancybox) {
      Fancybox.bind('[data-fancybox="gurman-gallery"]', {
        Carousel: { transition: 'fade' },            // плавне згасання замість зсуву між фото
        Images: { zoom: true, Panzoom: { maxScale: 3 } }, // анімація з мініатюри і наближення до 3×
        l10n: {
          CLOSE: 'Закрити',
          NEXT: 'Наступне фото',
          PREV: 'Попереднє фото',
          MODAL: 'Закрити можна клавішею Esc',
          TOGGLE_ZOOM: 'Наблизити / віддалити',
          TOGGLE_THUMBS: 'Мініатюри',
          TOGGLE_SLIDESHOW: 'Слайд-шоу',
          TOGGLE_FULLSCREEN: 'На весь екран',
          DOWNLOAD: 'Завантажити',
          IMAGE_ERROR: 'Не вдалося завантажити фото',
        },
      });
    }
  }

  // ---------- ЛР12: відкладене завантаження бібліотек галереї ----------
  const CDN = {
    css: ['https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css'],
    js: ['https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js'],
  };
  const loadCss = (href) => new Promise((resolve) => {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
    link.onload = link.onerror = resolve; // без CSS галерея лишається читабельною, тому помилку не вважаємо фатальною
    document.head.appendChild(link);
  });
  const loadJs = (src) => new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement('script'), { src });
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  let galleryRequested = false;
  function loadGallery() {
    if (galleryRequested) return;
    galleryRequested = true;
    Promise.all([...CDN.css.map(loadCss), ...CDN.js.map(loadJs)])
      .then(initGallery)
      .catch(() => console.warn('Галерея: бібліотеки з CDN не завантажилися, фото відкриваються як звичайні посилання.'));
  }

  const gallery = document.getElementById('gallery');
  if (gallery) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadGallery();
        }
      }, { rootMargin: '800px 0px' });
      observer.observe(gallery);
    } else {
      loadGallery();
    }
    // Якщо фото клікнули раніше, ніж бібліотеки встигли завантажитися, спершу вантажимо їх.
    gallery.addEventListener('click', (event) => {
      if (event.target.closest('a[data-fancybox]') && !window.Fancybox) {
        event.preventDefault();
        loadGallery();
      }
    }, true);
  }

  // ---------- Typed.js: підказки пар у Hero ----------
  const typedTarget = document.getElementById('typed-text');
  const phrases = ['бри + ігристе брют', 'витриманий твердий + сухе червоне', 'козячий сир + совіньйон блан', 'блакитний сир + портвейн'];
  if (typedTarget) {
    if (window.Typed && !reduceMotion) {
      new Typed('#typed-text', {
        strings: phrases,
        typeSpeed: 50,            // швидкість друку, мс на символ
        backSpeed: 30,            // швидкість стирання
        backDelay: 1800,          // пауза перед стиранням
        smartBackspace: true,
        loop: true,
      });
    } else {
      typedTarget.textContent = phrases[0]; // без анімації або якщо CDN недоступний
    }
  }

  // ---------- ЛР12: «фасад» YouTube ----------
  // Замість важкого iframe (≈ 1 МБ скриптів і сторонні cookie) спершу показується кнопка з обкладинкою;
  // справжній плеєр вбудовується лише після натискання.
  document.querySelectorAll('[data-youtube-facade]').forEach((button) => {
    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.className = button.dataset.iframeClass;
      iframe.src = `https://www.youtube-nocookie.com/embed/${button.dataset.youtubeFacade}?autoplay=1`;
      iframe.title = button.dataset.title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      button.replaceWith(iframe);
      iframe.focus();
    }, { once: true });
  });
});
