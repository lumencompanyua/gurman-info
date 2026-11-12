// ЛР9 · Клієнтська валідація форми зворотного зв'язку «Гурман-Інфо» (Vanilla JS, без бібліотек).
// Це перша лінія перевірки для зручності користувача. Реального надсилання немає: справжній сервер
// мав би повторити всі перевірки, бо клієнтську валідацію можна вимкнути в DevTools.
(() => {
  'use strict';

  const form = document.getElementById('feedbackForm');
  if (!form) return;

  // ---------- Правила валідації ----------
  // Ім'я: літери будь-якої абетки, апостроф, дефіс і пробіл; починається й закінчується літерою, разом 2–50 символів.
  const REGEX_NAME = /^\p{L}[\p{L}'’ʼ -]*\p{L}$/u;
  // Email: локальна частина, @, домен, крапка, зона з 2+ літер (класичний шаблон з методички).
  const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Телефон: строго +380 і рівно 9 цифр, без пробілів, дужок і дефісів.
  const REGEX_PHONE = /^\+380\d{9}$/;
  // Символи, які допустимі лише як «оформлення» номера: їх можна безпечно прибрати.
  const REGEX_PHONE_FORMATTING = /^\+?[\d\s().-]+$/;
  const MESSAGE_MIN = 10;
  const MESSAGE_MAX = 1000;

  const fields = {
    username: document.getElementById('username'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    topic: document.getElementById('topic'),
    message: document.getElementById('message'),
    agreement: document.getElementById('agreement'),
  };
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');
  const phoneHint = document.getElementById('phoneHint');
  const messageCounter = document.getElementById('messageCounter');
  const PHONE_HINT_DEFAULT = phoneHint.textContent;

  // Поля, з якими користувач уже взаємодіяв: до цього помилки не показуємо.
  const touched = new Set();
  let isSubmitting = false;

  // ---------- Керування UI-станами (класи Tailwind + aria-invalid) ----------
  const errorOf = (field) => document.getElementById(field.dataset.error);

  function showError(field, message) {
    field.classList.remove('border-line', 'border-green-500');
    field.classList.add('border-red-500');
    if (field.type === 'checkbox') field.classList.add('ring-2', 'ring-red-500');
    field.setAttribute('aria-invalid', 'true');
    const error = errorOf(field);
    error.textContent = message;
    error.classList.remove('hidden');
  }

  function showSuccess(field) {
    field.classList.remove('border-line', 'border-red-500', 'ring-2', 'ring-red-500');
    field.classList.add('border-green-500');
    field.setAttribute('aria-invalid', 'false');
    const error = errorOf(field);
    error.textContent = '';
    error.classList.add('hidden');
  }

  function clearState(field) {
    field.classList.remove('border-red-500', 'border-green-500', 'ring-2', 'ring-red-500');
    field.classList.add('border-line');
    field.setAttribute('aria-invalid', 'false');
    const error = errorOf(field);
    error.textContent = '';
    error.classList.add('hidden');
  }

  // Повертає true, якщо поле валідне; message — текст помилки або порожній рядок.
  function applyResult(field, message) {
    if (message) {
      showError(field, message);
      return false;
    }
    showSuccess(field);
    return true;
  }

  // ---------- Функції валідації окремих полів ----------
  function validateName() {
    const value = fields.username.value.trim();
    let message = '';
    if (!value) message = "Введіть ім'я.";
    else if (value.length < 2) message = "Ім'я має містити щонайменше 2 літери.";
    else if (value.length > 50) message = "Ім'я задовге: максимум 50 символів.";
    else if (!REGEX_NAME.test(value)) message = "Використовуйте лише літери, апостроф, дефіс або пробіл.";
    return applyResult(fields.username, message);
  }

  function validateEmail() {
    const value = fields.email.value.trim();
    let message = '';
    if (!value) message = 'Введіть електронну пошту.';
    else if (value.length > 254 || !REGEX_EMAIL.test(value)) message = 'Перевірте формат, наприклад: user@gmail.com.';
    return applyResult(fields.email, message);
  }

  // Пояснює, що саме не так із номером, замість загального «невірний формат».
  function phoneProblem(value) {
    if (!value) return 'Введіть номер телефону.';
    if (REGEX_PHONE.test(value)) return '';
    if (!REGEX_PHONE_FORMATTING.test(value)) return 'Номер може містити лише цифри після +380.';
    if (/\s|[().-]/.test(value)) return 'Приберіть пробіли, дужки й дефіси: формат +380XXXXXXXXX.';
    if (!value.startsWith('+380')) return 'Номер має починатися з +380 (український формат).';
    const rest = value.slice(4).length;
    return rest < 9
      ? `Після +380 має бути 9 цифр, зараз ${rest}.`
      : `Забагато цифр: після +380 має бути рівно 9, зараз ${rest}.`;
  }

  function validatePhone() {
    return applyResult(fields.phone, phoneProblem(fields.phone.value.trim()));
  }

  function validateTopic() {
    return applyResult(fields.topic, fields.topic.value ? '' : 'Оберіть тему звернення.');
  }

  function validateMessage() {
    const length = fields.message.value.trim().length;
    let message = '';
    if (!length) message = 'Напишіть повідомлення.';
    else if (length < MESSAGE_MIN) message = `Щонайменше ${MESSAGE_MIN} символів, зараз ${length}.`;
    else if (length > MESSAGE_MAX) message = `Максимум ${MESSAGE_MAX} символів.`;
    return applyResult(fields.message, message);
  }

  function validateAgreement() {
    return applyResult(fields.agreement, fields.agreement.checked ? '' : 'Підтвердьте згоду, щоб надіслати форму.');
  }

  const validators = {
    username: validateName,
    email: validateEmail,
    phone: validatePhone,
    topic: validateTopic,
    message: validateMessage,
    agreement: validateAgreement,
  };

  // ---------- UX-функція для телефону (Edge Cases) ----------
  // Перетворює номер у +380XXXXXXXXX лише тоді, коли намір однозначний:
  // 0501234567 → +380501234567; 380501234567 → +380501234567; «+380 (50) 123-45-67» → +380501234567.
  // Літери та інші символи не прибираються мовчки: їх покаже помилка.
  function normalizePhone() {
    const raw = fields.phone.value.trim();
    if (!raw || !REGEX_PHONE_FORMATTING.test(raw)) return;
    const digits = raw.replace(/\D/g, '');
    let normalized = raw;
    if (/^0\d{9}$/.test(digits)) normalized = `+38${digits}`;
    else if (digits.startsWith('380')) normalized = `+${digits}`;
    if (normalized !== fields.phone.value) {
      fields.phone.value = normalized;
      phoneHint.textContent = 'Номер приведено до формату +380XXXXXXXXX.';
    }
  }

  function updateCounter() {
    messageCounter.textContent = `${fields.message.value.length} / ${MESSAGE_MAX}`;
  }

  // ---------- Динамічна валідація ----------
  // Помилки з'являються лише після взаємодії: blur робить фінальну перевірку поля,
  // input оновлює стан уже «торкнутого» поля, change — для select і checkbox.
  Object.entries(fields).forEach(([name, field]) => {
    if (field.type === 'checkbox' || field.tagName === 'SELECT') {
      field.addEventListener('change', () => {
        touched.add(name);
        validators[name]();
      });
      return;
    }
    field.addEventListener('blur', () => {
      if (name === 'phone') normalizePhone();
      if (!field.value.trim() && !touched.has(name)) return; // просто пройшли Tab-ом повз порожнє поле
      touched.add(name);
      validators[name]();
    });
    field.addEventListener('input', () => {
      if (name === 'message') updateCounter();
      if (name === 'phone') phoneHint.textContent = PHONE_HINT_DEFAULT;
      if (touched.has(name)) validators[name]();
    });
  });

  // Вставлений номер одразу приводимо до формату, щоб користувач бачив результат.
  fields.phone.addEventListener('paste', () => {
    setTimeout(() => {
      normalizePhone();
      touched.add('phone');
      validatePhone();
    });
  });

  // ---------- Модальне вікно ----------
  const modal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const pageRegions = [document.querySelector('.site-header'), document.querySelector('main'), document.querySelector('footer')].filter(Boolean);

  function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    pageRegions.forEach((region) => { region.inert = true; }); // сторінка під вікном недоступна для кліків і Tab
    document.body.style.overflow = 'hidden';
    closeModalBtn.focus();
  }

  function closeModal() {
    if (modal.classList.contains('hidden')) return;
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    pageRegions.forEach((region) => { region.inert = false; });
    document.body.style.overflow = '';
    submitBtn.focus(); // повертаємо фокус туди, звідки користувач відкрив вікно
  }

  closeModalBtn.addEventListener('click', closeModal);
  // Клік по затемненому фону закриває вікно, клік усередині картки — ні (event.target — сам фон).
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
    // Фокус не виходить за межі вікна: у ньому одна кнопка, тож Tab лишається на ній.
    if (event.key === 'Tab' && !modal.classList.contains('hidden')) {
      event.preventDefault();
      closeModalBtn.focus();
    }
  });

  function resetForm() {
    form.reset();
    touched.clear();
    Object.values(fields).forEach(clearState);
    phoneHint.textContent = PHONE_HINT_DEFAULT;
    updateCounter();
  }

  // ---------- Надсилання ----------
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // без цього браузер перезавантажив би сторінку
    if (isSubmitting) return; // захист від швидкого повторного натискання

    normalizePhone();
    Object.keys(fields).forEach((name) => touched.add(name));
    // Перевіряємо всі поля, а не зупиняємося на першій помилці, щоб показати всі проблеми одразу.
    const results = Object.keys(fields).map((name) => validators[name]());
    const invalidCount = results.filter((ok) => !ok).length;

    if (invalidCount) {
      formStatus.textContent = `Перевірте поля, позначені червоним: ${invalidCount}.`;
      Object.values(fields).find((field) => field.getAttribute('aria-invalid') === 'true').focus();
      return;
    }

    // Імітація надсилання: блокуємо кнопку, щоб подвійний клік не спрацював двічі.
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Перевіряємо…';
    formStatus.textContent = '';
    setTimeout(() => {
      resetForm();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Надіслати';
      isSubmitting = false;
      openModal();
    }, 400);
  });
})();
