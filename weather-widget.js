// ЛР7 · Динамічний інформер: поточна погода у Львові (Open-Meteo, без ключа API) і порада подачі сиру та вина.
(() => {
  const root = document.getElementById('weather-widget');
  if (!root) return;
  const field = name => root.querySelector(`[data-weather="${name}"]`);
  const API = 'https://api.open-meteo.com/v1/forecast?latitude=49.84&longitude=24.03&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FKyiv';
  const WMO = [
    [[0], 'ясно'], [[1, 2], 'мінлива хмарність'], [[3], 'хмарно'], [[45, 48], 'туман'],
    [[51, 53, 55, 56, 57], 'мряка'], [[61, 63, 65, 66, 67, 80, 81, 82], 'дощ'],
    [[71, 73, 75, 77, 85, 86], 'сніг'], [[95, 96, 99], 'гроза'],
  ];
  const describe = code => (WMO.find(([codes]) => codes.includes(code)) || [, 'без опадів'])[1];
  const tipFor = temp => {
    if (temp >= 22) return 'Спекотно: охолодіть ігристе й біле до 6–8 °C, а сир дістаньте з холодильника лише за 20 хвилин до подачі.';
    if (temp >= 12) return 'Помірна погода: біле подавайте при 8–10 °C, легке червоне — при 14–16 °C; сир дайте зігрітися 30–40 хвилин.';
    return 'Прохолодно: доречні витримані тверді сири та червоне вино при 16–18 °C; сир дістаньте за 45–60 хвилин, щоб розкрився аромат.';
  };
  const fallback = () => {
    field('desc').textContent = 'Дані тимчасово недоступні';
    field('tip').textContent = 'Загальне правило: біле вино подавайте охолодженим до 8–10 °C, червоне — при 15–18 °C, а сир дістаньте з холодильника за 30–60 хвилин.';
    field('updated').textContent = 'Не вдалося отримати дані Open-Meteo.';
  };
  fetch(API)
    .then(response => { if (!response.ok) throw new Error(response.status); return response.json(); })
    .then(({ current }) => {
      const temp = Math.round(current.temperature_2m);
      field('temp').textContent = `${temp > 0 ? '+' : ''}${temp} °C`;
      field('desc').textContent = describe(current.weather_code);
      field('humidity').textContent = `${current.relative_humidity_2m} %`;
      field('wind').textContent = `${Math.round(current.wind_speed_10m)} км/год`;
      field('tip').textContent = tipFor(temp);
      field('updated').textContent = `Дані на ${current.time.slice(11, 16)} за київським часом · Open-Meteo`;
    })
    .catch(fallback);
})();
