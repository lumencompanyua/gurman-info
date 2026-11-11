/** Tailwind CSS для ЛР7: токени беруться з дизайн-системи «Гурман-Інфо» (змінні :root у styles.css). */
module.exports = {
  content: ['./index.html', './weather-widget.js'],
  // Наявні стилі ЛР3–6 мають власний reset, тому preflight вимкнено, щоб не зламати старі блоки.
  // container вимкнено: сітку задає .container з дизайн-системи ЛР4, нові секції використовують той самий клас.
  corePlugins: { preflight: false, container: false },
  // Утиліти отримують вагу body .class і перекривають старі класи компонентів без !important.
  important: 'body',
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--cream)',
        wine: { DEFAULT: 'var(--wine)', light: 'var(--wine-2)' },
        gold: { DEFAULT: 'var(--gold)', light: '#eed1a0', dark: '#bd9d60' },
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        widget: 'var(--widget-bg)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Manrope', 'Arial', 'sans-serif'],
      },
      borderRadius: { widget: 'var(--widget-radius)', media: 'var(--media-radius)' },
      aspectRatio: { map: '4 / 3' },
    },
  },
};
