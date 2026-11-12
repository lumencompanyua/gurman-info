const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const menu=$('.menu-toggle'),nav=$('#site-nav');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.setAttribute('aria-label',open?'Закрити меню':'Відкрити меню')});
$$('#site-nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
$$('.chip').forEach(btn=>btn.addEventListener('click',()=>{$$('.chip').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$$('.product-card').forEach(card=>card.hidden=btn.dataset.filter!=='all'&&card.dataset.kind!==btn.dataset.filter)}));
const intensity=$('#intensity'),intensityOutput=$('#intensity-output'); intensity.addEventListener('input',()=>intensityOutput.value=intensity.value);
const pairings={soft:{wine:'ігристе брют',temp:'8–10 °C',note:'Кислотність і бульбашки освіжають вершковий смак.'},hard:{wine:'сухе червоне з м’якими танінами',temp:'15–17 °C',note:'Насиченість вина підтримує горіхові ноти витриманого сиру.'},blue:{wine:'солодке біле або портвейн',temp:'10–12 °C',note:'Солодкість врівноважує солоність та пікантність.'},goat:{wine:'совіньйон блан',temp:'8–10 °C',note:'Свіжа кислотність підкреслює трав’яні й цитрусові відтінки.'}};
$('#pairing-form').addEventListener('submit',e=>{e.preventDefault();const cheese=$('#cheese').value,occasion=$('#occasion').value,msg=$('#pairing-message'),result=$('#pairing-result');if(!cheese||!occasion){msg.textContent='Оберіть тип сиру та нагоду — щоб отримати рекомендацію.';result.hidden=true;return}const p=pairings[cheese];const accent=Number(intensity.value)>=4?'Для інтенсивного смаку оберіть вино з виразнішим тілом.':'Зберігайте баланс: вино не має домінувати.';msg.textContent='';result.innerHTML=`<h3>${p.wine}</h3><p><strong>Подача:</strong> ${p.temp}. ${p.note} ${accent}</p>`;result.hidden=false;if(!new URLSearchParams(location.search).has('demo'))result.scrollIntoView({behavior:'smooth',block:'nearest'})});
// Валідація форми зворотного зв'язку з ЛР9 винесена в assets/js/validation.js.
if(window.Swiper)new Swiper('.gallery-swiper',{a11y:{slideRole:null},slidesPerView:1.15,spaceBetween:18,pagination:{el:'.swiper-pagination',clickable:true},breakpoints:{700:{slidesPerView:2.15},1000:{slidesPerView:3}}});
if(window.Fancybox)Fancybox.bind('[data-fancybox="gallery"]',{});
const demo=new URLSearchParams(location.search).get('demo');
if(demo){document.documentElement.style.scrollBehavior='auto'}
if(demo==='widget')document.body.classList.add('demo-widget');
if(demo==='widget'){$('#cheese').value='hard';$('#occasion').value='evening';intensity.value='4';intensityOutput.value='4';$('#pairing-form').dispatchEvent(new Event('submit',{cancelable:true}));}

// Restore focus and close compact navigation consistently.
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Відкрити меню');menu.focus();}});
window.addEventListener('resize',()=>{if(innerWidth>900){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Відкрити меню');}});
document.querySelectorAll('#site-nav a').forEach(a=>a.addEventListener('click',()=>menu.setAttribute('aria-label','Відкрити меню')));
document.querySelectorAll('.chip').forEach(button=>{button.setAttribute('aria-pressed',button.classList.contains('active'));button.addEventListener('click',()=>document.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',b===button)));});
