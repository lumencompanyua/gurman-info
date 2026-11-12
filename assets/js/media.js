// ЛР10 · Ініціалізація медіабібліотек, підключених через CDN jsDelivr:
// Swiper.js 11 (слайдер галереї), Fancybox 5 (перегляд фото на весь екран), Typed.js 2.0.12 (ефект друку в Hero).
// Код запускається після DOMContentLoaded: на цей момент HTML розібрано, а скрипти з defer уже виконано.
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Користувачам, які вимкнули анімації в системі, не вмикаємо автоплей і ефект друку.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Swiper.js: галерея з 6 слайдів ----------
  if (window.Swiper && document.querySelector('.gallery-swiper')) {
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
});
