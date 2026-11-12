// ЛР11 · Калькулятор дегустації «Гурман-Інфо» (Vanilla JS, без бібліотек).
// Захист від Edge Cases на трьох рівнях:
//   1) HTML5 — type="number", min, max, step, required;
//   2) JavaScript — кожне значення перевіряється (порожнє, не число, дріб, межі), NaN / Infinity / від'ємні
//      результати неможливі, підроблені в DevTools значення select і range не ламають розрахунок;
//   3) безпечний вивід — лише textContent, зрозумілі повідомлення замість NaN, undefined чи TypeError.
// Код ізольовано в замиканні: глобальних змінних немає, кілька віджетів на сторінці працюють незалежно.
(() => {
  'use strict';

  // Норми — усереднені орієнтири кейтерингу.
  const RULES = Object.freeze({
    cheesePerGuest: Object.freeze({ aperitif: 50, tasting: 100, dinner: 180 }), // г сиру на гостя
    glassesFirstHour: 2,   // келихів по 150 мл на гостя за першу годину
    glassesNextHours: 1,   // і по одному за кожну наступну
    glassesPerBottle: 5,   // пляшка 0,75 л = 5 келихів
    extrasPerGuest: 40,    // г меду, горіхів і винограду на гостя
  });
  const LIMITS = Object.freeze({ guests: [1, 50], hours: [1, 5], varieties: [3, 7] });
  const LABELS = Object.freeze({ guests: 'Кількість гостей', varieties: 'Кількість видів' });
  const DEFAULT_FORMAT = 'tasting';

  // Українські форми множини: 1 пляшка, 2–4 пляшки, 5+ пляшок.
  function plural(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function formatWeight(grams) {
    if (grams >= 1000) return `${(grams / 1000).toLocaleString('uk-UA', { maximumFractionDigits: 2 })} кг`;
    return `${Math.round(grams)} г`;
  }

  // Ціле число в межах [min, max] або текст помилки для користувача.
  function readInteger(field, [min, max], label) {
    const raw = field.value.trim();
    if (field.validity && field.validity.badInput) return { error: `${label}: введіть число, без літер.` };
    if (raw === '') return { error: `${label}: поле порожнє — введіть число від ${min} до ${max}.` };
    if (!/^-?\d+(\.\d+)?$/.test(raw)) return { error: `${label}: лише звичайне число, без «e», літер і знаків.` };
    const number = Number(raw);
    if (!Number.isFinite(number)) return { error: `${label}: число завелике.` };
    if (!Number.isInteger(number)) return { error: `${label}: лише ціле число.` };
    if (number < min) return { error: `${label}: щонайменше ${min}.` };
    if (number > max) return { error: `${label}: не більше ${max}.` };
    return { value: number };
  }

  // Повзунок не має області помилки: значення поза межами (наприклад, змінене в DevTools) повертаємо в межі.
  function readClamped(field, [min, max]) {
    const number = Number.parseInt(field.value, 10);
    const safe = Number.isNaN(number) ? min : Math.min(max, Math.max(min, number));
    field.min = String(min);
    field.max = String(max);
    if (String(safe) !== field.value) field.value = String(safe);
    return safe;
  }

  // Чиста функція розрахунку: отримує вже перевірені значення.
  function calculate({ guests, format, hours, varieties, extras }) {
    const cheese = guests * RULES.cheesePerGuest[format];
    const glasses = guests * (RULES.glassesFirstHour + (hours - 1) * RULES.glassesNextHours);
    return {
      cheese,
      perVariety: Math.round(cheese / varieties / 5) * 5, // округлення до 5 г, щоб зручно купувати
      glasses,
      bottles: Math.ceil(glasses / RULES.glassesPerBottle),
      extras: extras ? guests * RULES.extrasPerGuest : 0,
    };
  }

  // Уже запущені віджети: WeakSet не переноситься на копії елемента (на відміну від data-атрибута) і не тримає пам'ять.
  const initialized = new WeakSet();

  function initCalculator(root) {
    if (!root || initialized.has(root)) return; // без повторних слухачів
    const field = (name) => root.querySelector(`[data-field="${name}"]`);
    const fields = { guests: field('guests'), format: field('format'), hours: field('hours'), varieties: field('varieties'), extras: field('extras') };
    const missing = Object.keys(fields).filter((name) => !fields[name]);
    if (missing.length) {
      console.warn(`Калькулятор дегустації не запущено: бракує полів ${missing.join(', ')}.`);
      return;
    }
    initialized.add(root);

    // Вивід з перевіркою: якщо елемент результату видалили, розрахунок не падає.
    const setText = (selector, text) => {
      const el = root.querySelector(selector);
      if (el) el.textContent = text;
    };

    function showError(name, message) {
      const input = fields[name];
      input.classList.remove('border-line');
      input.classList.add('border-red-500');
      input.setAttribute('aria-invalid', 'true');
      const error = root.querySelector(`[data-error="${name}"]`);
      if (error) { error.textContent = message; error.classList.remove('hidden'); }
    }

    function clearError(name) {
      const input = fields[name];
      input.classList.remove('border-red-500');
      input.classList.add('border-line');
      input.setAttribute('aria-invalid', 'false');
      const error = root.querySelector(`[data-error="${name}"]`);
      if (error) { error.textContent = ''; error.classList.add('hidden'); }
    }

    function update() {
      const guests = readInteger(fields.guests, LIMITS.guests, LABELS.guests);
      const varieties = readInteger(fields.varieties, LIMITS.varieties, LABELS.varieties);
      const hours = readClamped(fields.hours, LIMITS.hours);
      if (!Object.hasOwn(RULES.cheesePerGuest, fields.format.value)) fields.format.value = DEFAULT_FORMAT;
      setText('[data-output="hours"]', String(hours));

      [['guests', guests], ['varieties', varieties]].forEach(([name, result]) => (result.error ? showError(name, result.error) : clearError(name)));
      if (guests.error || varieties.error) {
        ['cheese', 'perVariety', 'wine', 'extras'].forEach((key) => setText(`[data-result="${key}"]`, '—'));
        setText('[data-result="summary"]', 'Виправте поля, позначені червоним, — і розрахунок оновиться.');
        return;
      }

      const r = calculate({ guests: guests.value, format: fields.format.value, hours, varieties: varieties.value, extras: fields.extras.checked });
      setText('[data-result="cheese"]', formatWeight(r.cheese));
      setText('[data-result="perVariety"]', `≈ ${formatWeight(r.perVariety)}`);
      setText('[data-result="wine"]', `${r.bottles} ${plural(r.bottles, 'пляшка', 'пляшки', 'пляшок')} (≈ ${r.glasses} ${plural(r.glasses, 'келих', 'келихи', 'келихів')})`);
      setText('[data-result="extras"]', r.extras ? formatWeight(r.extras) : 'без супроводу');
      setText('[data-result="summary"]',
        `На ${guests.value} ${plural(guests.value, 'гостя', 'гостей', 'гостей')}: ${varieties.value} ${plural(varieties.value, 'вид', 'види', 'видів')} сиру ` +
        `і ${r.bottles} ${plural(r.bottles, 'пляшка', 'пляшки', 'пляшок')} вина на ${hours} год.`);
    }

    // Миттєвий перерахунок: input — для чисел і повзунка, change — для select і checkbox.
    [fields.guests, fields.varieties, fields.hours].forEach((input) => input.addEventListener('input', update));
    [fields.format, fields.extras].forEach((input) => input.addEventListener('change', update));
    const form = root.querySelector('form');
    if (form) form.addEventListener('reset', () => setTimeout(update)); // після скидання поля вже мають значення за замовчуванням
    update();
  }

  document.querySelectorAll('[data-calc]').forEach(initCalculator);
  // Єдиний публічний вхід — для віджета, доданого на сторінку пізніше. Внутрішні змінні лишаються в замиканні.
  window.GurmanCalculator = Object.freeze({ init: initCalculator });
})();
