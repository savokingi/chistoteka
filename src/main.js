import './style.css';
import { icon, star } from './icons.js';
import { business, services, cases, materials, faqs, articles, modules } from './data.js';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}.webp`;
const image = (name, alt, cls = '', eager = false) => `<img src="${asset(name)}" alt="${alt}" class="${cls}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" />`;
const money = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
const external = (url, label, cls = '') => `<a class="${cls}" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const cta = (text = 'Оценить по фото', cls = '', service = '') => `<button class="button ${cls}" data-estimate="${service}">${text}${icon('diagonal')}</button>`;
const eyebrow = (text, number = '') => `<div class="eyebrow">${number ? `<span class="section-number">${number}</span>` : '<span class="tiny-star">✦</span>'}${text}</div>`;
const checkList = (items) => `<ul class="check-list">${items.map(t => `<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>`;
const logo = `<span class="logo-type">чисто<span>тека${star}</span></span>`;
const app = typeof document !== 'undefined' ? $('#app') : null;
let activeMaterial = 0;
let currentFilter = 'all';
let estimator = { selected: 'furniture', quantity: 1, task: 'Освежить', material: 'Не знаю' };
let estimateBasket = [];
let modalFiles = [];
let modalOpener;
let draft = readDraft();
let revealObserver;

function readDraft() {
  try { return JSON.parse(sessionStorage.getItem('chistoteka-draft') || '{}'); } catch { return {}; }
}
function saveDraft() {
  try { sessionStorage.setItem('chistoteka-draft', JSON.stringify(draft)); } catch { /* Private browsing can disable storage. */ }
}
function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function header() {
  return `<header class="site-header"><div class="header-inner wrap">
    <a href="#/" class="brand" aria-label="Чистотека — главная">${logo}</a>
    <div class="header-location">${icon('pin')}<span>Москва и область</span></div>
    <nav class="desktop-nav" aria-label="Основная навигация">
      <a href="#/services">Услуги</a><a href="#/works">Наши работы</a><a href="#/prices">Стоимость</a><a href="#/about">О Никите</a>
    </nav>
    <a href="#/academy" class="academy-link">Обучение ${icon('diagonal')}</a>
    <a class="header-phone" href="tel:${business.phoneLink}" aria-label="Позвонить в Чистотеку">${icon('phone')}</a>
    ${cta('Оценить по фото', 'button-small header-cta')}
    <button class="menu-toggle icon-button" aria-label="Открыть меню" aria-expanded="false">${icon('menu')}</button>
  </div><nav class="mobile-nav" aria-label="Мобильная навигация" hidden><a href="#/services">Услуги</a><a href="#/works">Наши работы</a><a href="#/prices">Стоимость</a><a href="#/about">О Никите</a><a href="#/academy">Обучение мастеров ↗</a><a href="#/journal">Разборы и советы</a><a href="tel:${business.phoneLink}">${business.phone}</a></nav></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="wrap footer-top"><div class="footer-brand"><a href="#/" class="brand">${logo}</a><p>Чистота начинается<br>с понимания ткани.</p><div class="social-links">${external(business.channel, icon('telegram') + ' Telegram')}${external(business.youtube, icon('play') + ' YouTube')}</div></div><div class="footer-nav"><p class="small-label">Для вашего дома</p><a href="#/services/furniture">Мебель</a><a href="#/services/mattress">Матрасы</a><a href="#/services/carpets">Ковры</a><a href="#/services/curtains">Шторы</a></div><div class="footer-nav"><p class="small-label">Чистотека</p><a href="#/works">Наши работы</a><a href="#/about">О Никите</a><a href="#/academy">Обучение</a><a href="#/journal">Разборы и советы</a></div><div class="footer-contact"><p class="small-label">Разберёмся с вашей задачей</p><a class="footer-phone" href="tel:${business.phoneLink}">${business.phone}</a><span>На связи с 10:00 до 19:00 по Москве</span>${external(business.telegram, 'Написать Никите ' + icon('diagonal'), 'text-link')}<a href="mailto:${business.email}">${business.email}</a></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} Чистотека</span><span>Мебель · Матрасы · Ковры · Шторы</span><a href="#/privacy">Конфиденциальность</a></div></footer><div class="mobile-action">${cta('Оценить по фото')}<a href="tel:${business.phoneLink}" class="icon-button" aria-label="Позвонить">${icon('phone')}</a></div>`;
}

function hero() {
  return `<section class="hero wrap"><div class="hero-copy"><div class="hero-kicker"><span class="status-dot"></span>Выездная химчистка с вниманием к деталям</div><h1>Чистая мебель.<br>С пониманием<br><span>каждой ткани.</span></h1><p class="hero-description">Сначала разбираемся в материале. Потом подбираем чистку. Для любимого дивана, сложной обивки и всего, что делает дом вашим.</p><div class="hero-actions">${cta()}<a href="#/works" class="text-link">Посмотреть работы ${icon('arrow')}</a></div><div class="hero-note">${icon('camera')}<span>Не знаете состав ткани? Начнём с фотографии.</span></div><div class="hero-proof"><span>01 / Осмотр и тестирование</span><span>02 / Согласование стоимости</span></div></div><div class="hero-visual"><div class="hero-image">${image('service-01', 'Светлая гостиная с диваном — интерьер с сайта Чистотеки', '', true)}<span class="image-top-label">Забота о том, что рядом.</span><div class="image-caption"><span>Вещи, которые хочется сохранить.</span><span>✦</span></div></div><a href="#/about" class="founder-tag">${image('service-23', 'Никита Семьянов', '', true)}<span><strong>Никита Семьянов</strong><small>Мастер-технолог. Лично о деле.</small></span>${icon('diagonal')}</a><div class="hero-vertical">ЧИСТОТЕКА / ВАШ ДОМ В ХОРОШИХ РУКАХ</div></div></section>
    <div class="principles-strip"><div class="wrap"><span>${star} Подбираем метод под материал</span><span>${star} Объясняем возможный результат</span><span>${star} Обсуждаем цену до работы</span></div></div>`;
}

function servicesSection(full = false) {
  return `<section class="section wrap" id="services">${eyebrow('Забота о вашем доме', '01')}<div class="section-heading"><h2>У каждой вещи —<br>свой подход.</h2><div><p>От любимого кресла до текстиля во всём доме. Выберите то, с чего начнём.</p>${full ? '' : '<a href="#/services" class="text-link">Все услуги ' + icon('arrow') + '</a>'}</div></div><div class="service-grid">${services.map((s, i) => `<a class="service-card service-card-${i}" href="#/services/${s.id}"><div class="service-card-top"><span>${String(i+1).padStart(2,'0')}</span><span class="circle-arrow">${icon('diagonal')}</span></div>${image(s.image, s.name)}<div class="service-card-bottom"><h3>${s.name}</h3><span>${s.price}</span></div></a>`).join('')}</div><p class="under-note">Стоимость зависит от материала, размера и задачи. Подробности согласуем до начала работы.</p></section>`;
}

function materialPanel(index) {
  const m = materials[index];
  return `<div class="material-photo">${image(m.image, `Фактура и изделие: ${m.name}`)}<span class="photo-index">${m.number} / 04</span><span class="material-photo-caption">Реальные изделия из канала Никиты</span></div><div class="material-copy"><span class="small-label">В фокусе — ${m.name.toLowerCase()}</span><h3>${m.heading}</h3><p>${m.text}</p><div class="material-checks"><span class="small-label">Что учитываем</span>${checkList(m.checks)}</div><p class="material-note">${icon('info')}${m.note}</p>${cta('Обсудить моё изделие', 'button-outline', 'delicate')}</div>`;
}

function materialsSection() {
  return `<section class="materials-section section" id="materials"><div class="wrap">${eyebrow('Ткань определяет решение', '02')}<div class="section-heading"><h2>Похожая мебель.<br><span class="muted-heading">Разная работа.</span></h2><p>Состав обивки, краситель и состояние изделия важнее универсального рецепта. В этом и начинается работа мастера.</p></div><div class="material-tabs" role="tablist" aria-label="Материалы обивки">${materials.map((m,i)=>`<button role="tab" id="tab-${m.id}" aria-controls="material-panel" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}" data-material="${i}">${m.name}<span>${m.number}</span></button>`).join('')}</div><div class="material-panel" id="material-panel" role="tabpanel" aria-labelledby="tab-viscose">${materialPanel(0)}</div></div></section>`;
}

function workCard(c, i = 0) {
  return `<a href="#/works/${c.id}" class="work-card"><div class="work-card-image">${image(c.image, c.title)}<span class="tag">${c.tag}</span><span class="circle-arrow">${icon('diagonal')}</span></div><div class="work-card-info"><span class="small-label">Разбор ${String(i+1).padStart(2,'0')} / ${c.material}</span><h3>${c.title}</h3><p>${c.lead}</p></div></a>`;
}

function worksSection(full = false) {
  return `<section class="section wrap" id="works">${eyebrow('Работы, за которыми стоит опыт', '03')}<div class="section-heading"><h2>За каждым результатом —<br>своё решение.</h2><div><p>Что увидели на осмотре, как подошли к задаче и что получилось. С фотографиями и подробностями от Никиты.</p>${full ? '' : '<a class="text-link" href="#/works">Смотреть разборы ' + icon('arrow') + '</a>'}</div></div>${full ? '<div class="filter-bar" role="group" aria-label="Фильтр работ"><button class="filter active" data-filter="all" aria-pressed="true">Все разборы <span>3</span></button><button class="filter" data-filter="furniture" aria-pressed="false">Мебель</button><button class="filter" data-filter="delicate" aria-pressed="false">Деликатные ткани</button></div>' : ''}<div class="works-grid" id="works-grid">${cases.map(workCard).join('')}</div><div class="source-note">${icon('telegram')}Реальные изделия, рабочие ситуации и объяснения мастера. Подробности — в каждом разборе.</div></section>`;
}

function compareSection() {
  return `<section class="comparison-section wrap"><div class="comparison-copy">${eyebrow('Разницу видно в деталях')}<h2>Посмотрите<br>внимательнее.</h2><p>Фотографии одной работы из галереи «Чистотеки». Двигайте разделитель, чтобы рассмотреть поверхность.</p><div class="compare-controls"><button data-compare-mode="slider" class="active" aria-pressed="true">Сравнить</button><button data-compare-mode="side" aria-pressed="false">Рядом</button></div><p class="caption">Снимки сделаны с разных ракурсов и при разном освещении. Результат всегда оцениваем по конкретному изделию.</p></div><div class="comparison-widget"><div class="compare-stage" style="--compare:50%"><div class="compare-before">${image('service-07','Диван до работы, фотография из галереи Чистотеки')}</div><div class="compare-after">${image('service-16','Диван после работы, фотография из галереи Чистотеки')}</div><span class="compare-label label-before">До</span><span class="compare-label label-after">После</span><div class="compare-line"><span>‹ ›</span></div><input type="range" min="0" max="100" value="50" aria-label="Сравнение до и после" class="compare-range" /></div></div></section>`;
}

function estimateSection() {
  return `<section class="section estimate-section" id="estimate"><div class="wrap estimate-layout"><div class="estimate-intro">${eyebrow('Стоимость начинается с вашей задачи', '04')}<h2>Давайте соберём<br>ваш заказ.</h2><p>Выберите изделие и расскажите, что хотите изменить. Получится готовое обращение к мастеру.</p><div class="estimate-person">${image('service-23','Никита Семьянов')}<div><strong>Сначала посмотрим.</strong><span>Объясним подход и согласуем объём.</span></div></div><a href="#/prices" class="text-link">Как складывается стоимость ${icon('arrow')}</a></div><div class="estimate-builder"><div class="builder-heading"><span class="small-label">01 / Что будем чистить</span>${icon('layers')}</div><div class="item-options" role="group" aria-label="Что чистим">${services.slice(0,5).map(s=>`<button class="item-option ${estimator.selected===s.id?'selected':''}" data-item="${s.id}" aria-pressed="${estimator.selected===s.id}">${icon(s.icon)}<span>${s.short}</span></button>`).join('')}</div><div class="estimate-basket" id="estimate-basket"></div><div class="builder-row"><label for="quantity">Количество изделий</label><div class="quantity-control"><button data-quantity="-1" aria-label="Уменьшить количество">${icon('minus')}</button><output id="quantity">${estimator.quantity}</output><button data-quantity="1" aria-label="Увеличить количество">${icon('plus')}</button></div></div><div class="builder-fields"><label>Ваша задача<select id="estimate-task"><option>Освежить</option><option>Убрать пятна</option><option>Разобраться с запахом</option><option>После другой чистки</option></select></label><label>Материал<select id="estimate-material"><option>Не знаю</option><option>Синтетика</option><option>Хлопок / смесь</option><option>Вискоза / шёлк</option><option>Натуральная кожа</option></select></label></div><button class="add-item" data-add-item>${icon('plus')}Добавить ещё изделие</button><div class="estimate-total"><div><span class="small-label">Базовый ориентир</span><strong id="estimate-amount">от 2 500 ₽</strong></div><span id="estimate-unit">за выбранные изделия</span></div><p class="estimate-disclaimer">Предварительный ориентир. Размер, материал, пятна и дополнительные работы уточним при оценке изделия.</p>${cta('Продолжить с фотографиями', 'button-full', 'builder')}<span class="builder-footnote">${icon('shield')}Расчёт без телефона и обязательств</span></div></div></section>`;
}

function aboutSection(full = false) {
  return `<section class="section wrap founder-section" id="about"><div class="founder-photo"><div class="founder-photo-bg">${image('academy-00','Никита Семьянов в рабочей форме с оборудованием')}</div><div class="founder-photo-footer"><span>Практика, которой делюсь.</span>${star}</div></div><div class="founder-copy">${eyebrow('За работой — человек', '05')}<h2>Я Никита.<br>Мебель — моё дело.</h2><p class="founder-lead">Работаю с обивкой, разбираюсь в сложных случаях и передаю опыт другим мастерам.</p><p>В канале показываю реальные заказы: что за ткань, с чем приехал клиент, почему выбрал такой подход. Там же рассказываю о собственных ошибках и о том, чему они научили.</p><div class="founder-stats"><div><strong>7 лет</strong><span>практики в химчистке</span></div><div><strong>3 500+</strong><span>почищенных диванов</span></div></div><p class="caption">Больше о профессии и работе — в открытом канале.</p><div class="founder-links">${external(business.channel,'Посмотреть, как я работаю ' + icon('diagonal'),'button button-outline')}${full?'':'<a href="#/about" class="text-link">Познакомиться ближе '+icon('arrow')+'</a>'}</div></div></section>`;
}

function processSection() {
  const steps = [['Разбираемся в задаче','Смотрим фото, уточняем материал, загрязнения и то, что уже пробовали.','camera'],['Договариваемся','Обсуждаем подход, предварительную стоимость и удобное время.','clock'],['Проверяем на месте','Осматриваем изделие. Окончательный объём согласуем до начала работы.','shield'],['Чистим и объясняем','Показываем результат и рассказываем, как дождаться высыхания и ухаживать дальше.','spark']];
  return `<section class="section process-section"><div class="wrap">${eyebrow('Всё понятно на каждом этапе', '06')}<div class="section-heading"><h2>От первого фото<br>до чистой мебели.</h2><p>Заранее знаете, что происходит с вашей вещью. И можете задать вопрос на любом этапе.</p></div><div class="process-grid">${steps.map((s,i)=>`<div class="process-step"><div class="step-top"><span>0${i+1}</span>${icon(s[2])}</div><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join('')}</div><a href="#/journal/prepare" class="prep-link">${icon('file')}Как подготовить дом к приезду мастера ${icon('arrow')}</a></div></section>`;
}

function trustSection() {
  return `<section class="section wrap trust-section"><div>${eyebrow('Доверие можно проверить')}<h2>Показываем работу.<br>Объясняем решения.</h2><p>Больше материалов, реальных объектов и профессиональных обсуждений — на открытых площадках Никиты.</p></div><div class="trust-links">${external(business.channel,`<div class="trust-icon">${icon('telegram')}</div><div><h3>Рабочий дневник в Telegram</h3><p>Заказы, материалы, ситуации на объектах.</p><span>@chisto_academy</span></div>${icon('diagonal')}`,'trust-card')}${external(business.youtube,`<div class="trust-icon">${icon('play')}</div><div><h3>Разборы на YouTube</h3><p>Процессы, техника и разговор о профессии.</p><span>@Nikita_himchistka</span></div>${icon('diagonal')}`,'trust-card')}</div></section>`;
}

function academyTeaser() {
  return `<section class="academy-teaser wrap"><div class="academy-teaser-copy">${eyebrow('Чистотека / Для мастеров')}<h2>Хорошей работе<br>можно научиться.</h2><p>Ткани, химия, оборудование и общение с клиентом. Обучение от мастера, который продолжает выезжать на заказы.</p><a href="#/academy" class="button button-white">Посмотреть обучение ${icon('diagonal')}</a></div><div class="academy-teaser-image">${image('academy-13','Никита демонстрирует работу с мебелью')}<span>Изучил → Применил → Разобрал результат</span></div>${star}</section>`;
}

function journalSection(full = false) {
  return `<section class="section wrap" id="journal">${eyebrow('Полезно знать заранее', '07')}<div class="section-heading"><h2>Просто о том,<br>что важно.</h2><a href="#/journal" class="text-link">${full?'Все материалы':'Разборы и советы'} ${icon('arrow')}</a></div><div class="journal-grid">${articles.map(a=>`<a href="#/journal/${a.id}" class="journal-card"><div>${image(a.image,a.title)}<span class="circle-arrow">${icon('diagonal')}</span></div><span class="small-label">${a.tag} · ${a.time}</span><h3>${a.title}</h3></a>`).join('')}</div></section>`;
}

function faqSection() {
  return `<section class="section wrap faq-section">${eyebrow('Перед первым обращением', '08')}<div class="faq-layout"><div><h2>Наверняка<br>есть вопросы.</h2><p>Можно сразу задать их Никите. А здесь — ответы на самые частые.</p>${external(business.telegram, 'Спросить в Telegram ' + icon('diagonal'), 'text-link')}</div><div class="faq-list">${faqs.map((f,i)=>`<details><summary>${f[0]}<span>${icon('plus')}</span></summary><div class="faq-answer"><p>${f[1]}</p></div></details>`).join('')}</div></div></section>`;
}

function finalCTA() {
  return `<section class="final-cta wrap"><div>${eyebrow('Начнём с вашего изделия')}<h2>Покажите, что<br>нужно почистить.</h2><p>Разберёмся в задаче и обсудим следующий шаг.</p><div class="final-actions">${cta('Оценить по фото','button-white')}<a href="tel:${business.phoneLink}" class="final-phone">${business.phone}</a></div><span class="final-hours">На связи с 10:00 до 19:00 по Москве</span></div><div class="final-illustration"><div class="photo-outline photo-outline-back">${icon('sofa')}</div><div class="photo-outline photo-outline-front">${icon('camera')}<span>Общий вид · Деталь · Бирка</span></div>${star}</div></section>`;
}

function home() {
  return hero()+servicesSection()+materialsSection()+worksSection()+compareSection()+estimateSection()+aboutSection()+processSection()+trustSection()+academyTeaser()+journalSection()+faqSection()+finalCTA();
}
function breadcrumb(items) {
  return `<nav class="breadcrumb wrap" aria-label="Хлебные крошки"><a href="#/">Главная</a>${items.map((it,i)=>`${icon('chevron')}${it[1]?`<a href="${it[1]}">${it[0]}</a>`:`<span aria-current="page">${it[0]}</span>`}`).join('')}</nav>`;
}
function pageTitle(kicker, title, text) {
  return `<section class="page-intro wrap">${eyebrow(kicker)}<h1>${title}</h1>${text?`<p>${text}</p>`:''}</section>`;
}

function servicePage(id) {
  const s = services.find(x=>x.id===id);
  if (!s) return notFound();
  return breadcrumb([['Услуги','#/services'],[s.name]])+`<section class="service-hero wrap"><div>${eyebrow('Химчистка / '+s.name)}<h1>${s.subtitle}</h1><p>${s.description}</p><div class="service-price"><strong>${s.price}</strong><span>Базовая стоимость · уточним по вашему изделию</span></div>${cta('Оценить моё изделие','',s.id)}</div><div class="service-hero-photo">${image(s.image,s.name,'',true)}<span>${s.name} / Чистотека</span></div></section><section class="section wrap detail-split"><div>${eyebrow('Начинаем с понимания')}<h2>Что важно<br>в вашей задаче.</h2><p>${s.detail}</p></div><div class="detail-task-list">${s.tasks.map((t,i)=>`<div><span>0${i+1}</span><h3>${t}</h3>${icon('check')}</div>`).join('')}</div></section><section class="wrap service-note">${icon('info')}<p>${s.note}</p></section>`+((id==='delicate'||id==='furniture')?materialsSection():'')+`<section class="section wrap detail-split"><div>${eyebrow('Перед приездом мастера')}<h2>Немного подготовки.<br>Больше ясности.</h2><p>После обсуждения заказа уточним всё, что потребуется на вашем объекте.</p></div><div class="preparation-list">${s.prepare.map((t,i)=>`<div><span>0${i+1}</span><p>${t}</p></div>`).join('')}</div></section>`+worksSection()+faqSection()+finalCTA();
}

function workPage(id) {
  const c = cases.find(x=>x.id===id);
  if (!c) return notFound();
  return breadcrumb([['Наши работы','#/works'],[c.tag]])+`<article class="wrap case-article"><div class="case-header">${eyebrow(c.tag)}<h1>${c.title}</h1><p>${c.lead}</p><span class="tag tag-light">${c.material}</span></div><div class="case-photos">${image(c.image,c.title,'',true)}${image(c.second,'Детали изделия из оригинальной публикации')}</div><div class="article-layout"><aside><span class="small-label">Источник истории</span>${external(c.link,'Публикация Никиты '+icon('diagonal'),'text-link')}<p>Фотографии и описание из публичного Telegram-канала.</p></aside><div class="article-body">${c.body.map(b=>`<section><h2>${b[0]}</h2><p>${b[1]}</p></section>`).join('')}<div class="article-note">${icon('info')}<p>${c.outcome}</p></div><div class="article-next"><h3>Похожая ситуация?</h3><p>Покажите своё изделие. Разберём задачу отдельно.</p>${cta('Обсудить с мастером','',c.category)}</div></div></div></article>`+worksSection()+finalCTA();
}

function pricesPage() {
  return breadcrumb([['Стоимость']])+pageTitle('Прозрачно о стоимости','Цена складывается<br>из вашей задачи.','Материал, размер и характер загрязнения определяют объём работы. Здесь — базовые ориентиры и то, что стоит уточнить заранее.')+`<section class="wrap price-table-section"><div class="price-table"><div class="price-table-head"><span>Что чистим</span><span>Базовый ориентир</span><span></span></div>${services.map(s=>`<div class="price-table-row"><a href="#/services/${s.id}">${icon(s.icon)}<strong>${s.name}</strong></a><span>${s.price}</span><button class="text-link" data-estimate="${s.id}">Уточнить ${icon('diagonal')}</button></div>`).join('')}</div><p class="under-note">Окончательная стоимость зависит от состава заказа. Уточним минимальную сумму выезда, условия для вашего адреса и все дополнительные работы.</p></section><section class="section wrap"><div class="section-heading"><h2>Четыре вещи,<br>которые меняют расчёт.</h2><p>Мы начинаем с этих вопросов, чтобы говорить о конкретной работе.</p></div><div class="price-factors">${[['Материал','Состав ткани, отделка, состояние и рекомендации производителя.'],['Размер','Габариты, количество подушек, сторон и дополнительных элементов.'],['Загрязнения','Пятна, запах, их происхождение и предыдущие обработки.'],['Условия','Адрес, доступ к изделию, высота и общий объём заказа.']].map((x,i)=>`<div><span>0${i+1}</span><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}</div></section>`+estimateSection()+faqSection()+finalCTA();
}

function aboutPage() {
  return breadcrumb([['О Никите']])+aboutSection(true)+`<section class="section wrap detail-split"><div>${eyebrow('Как устроена работа')}<h2>Внимание к вещи.<br>Ясность для человека.</h2></div><div class="about-principles"><div><h3>Сначала разобраться</h3><p>Знать материал, увидеть состояние, выяснить историю обработки. Правильные вопросы — часть профессиональной работы.</p></div><div><h3>Объяснить решение</h3><p>Обсудить подход, границы результата и стоимость до начала. Клиенту должно быть понятно, что происходит с его мебелью.</p></div><div><h3>Делиться опытом</h3><p>Рабочие разборы помогают клиентам лучше понимать услугу, а мастерам — развиваться в профессии.</p></div></div></section>`+trustSection()+academyTeaser()+processSection()+finalCTA();
}

function academyPage() {
  return breadcrumb([['Обучение мастеров']])+`<section class="academy-hero wrap"><div>${eyebrow('Чистотека / Обучение от Никиты Семьянова')}<h1>Понимать ткань.<br>Выбирать подход.<br><span>Работать уверенно.</span></h1><p>Химия, оборудование, технология и первые клиенты. Соберите знания в систему с действующим мастером.</p><a href="#/academy#program" class="button" data-scroll="program">Что внутри программы ${icon('arrow')}</a>${external(business.telegram+'?text='+encodeURIComponent('Никита, здравствуйте! Хочу обсудить обучение в Чистотеке.'),'Обсудить обучение '+icon('diagonal'),'text-link')}</div><div class="academy-portrait">${image('academy-00','Никита Семьянов — автор обучения','',true)}<span>Изучил → Применил → Разобрал результат</span></div></section><section class="section wrap"><div class="section-heading"><h2>На каком этапе<br>вы сейчас?</h2><p>Разные исходные точки. Одна задача — понимать свою работу.</p></div><div class="audience-grid">${[['01','Начинаю с нуля','Нужны понятный старт, комплект оборудования и последовательность первых действий.','Оборудование · База · Практика'],['02','Уже работаю','Есть заказы, но хочется систематизировать знания, разобраться с тканями и ошибками.','Химия · Материалы · Разборы'],['03','Хочу расти дальше','Интересуют сложные задачи, оценка дорогих изделий и развитие клиентской базы.','Деликатные изделия · Клиенты · Развитие']].map(x=>`<div><span>${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p><small>${x[3]}</small></div>`).join('')}</div></section><section class="section academy-program" id="program"><div class="wrap"><div class="section-heading">${eyebrow('От базы к практике')}<h2>Что вы будете<br>разбирать.</h2></div><div class="program-list">${modules.map((m,i)=>`<details ${i===0?'open':''}><summary><span class="program-number">${String(i+1).padStart(2,'0')}</span><h3>${m[0]}</h3>${icon('plus')}</summary><div><p>${m[1]}</p></div></details>`).join('')}</div><p class="under-note">Здесь показаны основные направления обучения. Полный состав уроков, сроки доступа и практику уточняйте по выбранному тарифу.</p></div></section><section class="section wrap academy-format"><div>${eyebrow('Учиться в своём ритме')}<h2>Посмотрели.<br>Попробовали.<br>Получили обратную связь.</h2><p>Видеоуроки дополняются материалами, заданиями и общением. Формат поддержки зависит от программы.</p></div><div class="format-list">${[['play','Уроки в записи','Можно вернуться к нужной теме перед работой.'],['file','Методички и чек-листы','Подсказки по материалам, химии и последовательности действий.'],['telegram','Обратная связь','Вопросы и разбор заданий в рамках выбранного тарифа.'],['sofa','Практика','Возможность отработать навыки обсуждается при выборе формата.']].map(x=>`<div>${icon(x[0])}<div><h3>${x[1]}</h3><p>${x[2]}</p></div></div>`).join('')}</div></section><section class="section wrap" id="academy-prices"><div class="section-heading"><h2>Выберите уровень<br>поддержки.</h2><p>От самостоятельного старта с куратором до индивидуального пути. Обсудим, какой формат подходит вашей ситуации.</p></div><div class="tariff-grid">${[['С куратором','10 990 ₽','Основа и поддержка при прохождении.',['Видеоуроки и материалы','Проверка заданий куратором','Общение в чате']],['С обратной связью','19 990 ₽','Разбор работы с участием Никиты.',['Обратная связь от Никиты','Закрытый чат и дополнительные материалы','Практические форматы по программе']],['Наставничество','50 000 ₽','Индивидуальный путь под вашу ситуацию.',['Личные созвоны','Индивидуальный план','Подбор оборудования и разбор пути']]].map((t,i)=>`<div class="tariff ${i===1?'featured':''}"><span class="small-label">Формат 0${i+1}</span><h3>${t[0]}</h3><p>${t[2]}</p><strong>${t[1]}</strong>${checkList(t[3])}${external(business.telegram+'?text='+encodeURIComponent('Никита, здравствуйте! Интересует обучение, формат «'+t[0]+'». Расскажите об актуальных условиях.'),'Обсудить формат '+icon('diagonal'),'button '+(i===1?'':'button-outline'))}</div>`).join('')}</div><p class="under-note">Условия рассрочки, длительность доступа, возврата и состав тарифа уточняются до оплаты. ${external('https://chisto.academy/obuchenie','Действующая страница программы ↗')}</p></section>`+trustSection()+`<section class="final-cta wrap"><div>${eyebrow('Начнём с вашей ситуации')}<h2>Расскажите,<br>куда хотите прийти.</h2><p>Есть ли опыт, какое оборудование уже есть и что хочется освоить.</p>${external(business.telegram+'?text='+encodeURIComponent('Никита, здравствуйте! Хочу обсудить, подойдёт ли мне обучение.'),'Написать Никите '+icon('diagonal'),'button button-white')}</div><div class="academy-end">${icon('book')}${star}</div></section>`;
}

function articlePage(id) {
  const a = articles.find(x=>x.id===id);
  if (!a) return notFound();
  return breadcrumb([['Разборы и советы','#/journal'],[a.tag]])+`<article class="wrap editorial-article"><div class="case-header">${eyebrow(a.tag+' / '+a.time)}<h1>${a.title}</h1><p>${a.intro}</p></div><div class="editorial-cover">${image(a.image,a.title,'',true)}</div><div class="article-layout"><aside><span class="small-label">Чистотека / Полезно знать</span><p>Материал для подготовки к обращению. Особенности конкретного изделия обсуждаются с мастером.</p><a href="#/journal" class="text-link">Все материалы ${icon('arrow')}</a></aside><div class="article-body">${a.blocks.map((b,i)=>`<section><span class="small-label">0${i+1}</span><h2>${b[0]}</h2><p>${b[1]}</p></section>`).join('')}<div class="article-next"><h3>Разберём вашу задачу?</h3><p>Соберите фотографии и расскажите, что хотите почистить.</p>${cta()}</div></div></div></article>`+journalSection()+finalCTA();
}

function privacyPage() {
  return breadcrumb([['Конфиденциальность']])+`<section class="wrap legal-page">${eyebrow('О ваших данных')}<h1>Конфиденциальность</h1><p class="lead">Как работает подготовка обращения на этом сайте.</p><h2>Фотографии и описание</h2><p>Фотографии, которые вы выбираете, используются только для предварительного просмотра на вашем устройстве. Этот сайт не загружает их на сервер. Вы можете удалить выбранные фотографии в любой момент.</p><h2>Переход в Telegram</h2><p>После подготовки обращения вы сами открываете Telegram и отправляете сообщение Никите. Выбранные фотографии нужно прикрепить в Telegram отдельно. До отправки сообщения вы можете изменить текст и состав вложений.</p><h2>Сохранение черновика</h2><p>Текст описания и район могут сохраняться в sessionStorage вашего браузера, чтобы не потеряться при переходах. Фотографии не сохраняются в этом хранилище. Черновик доступен только в текущей сессии браузера.</p><button class="button button-outline" data-clear-draft>Удалить черновик ${icon('close')}</button><h2>Внешние площадки</h2><p>Telegram и YouTube используют собственные правила обработки данных. При переходе на внешние страницы ознакомьтесь с их условиями. На этом сайте нет рекламных трекеров и встроенных внешних видеоплееров.</p><h2>Контакт</h2><p>По вопросам использования материалов и обращений: <a href="mailto:${business.email}">${business.email}</a>.</p></section>`;
}
function notFound() {
  return pageTitle('404 / Страница не найдена','Давайте начнём<br>с главной.','Возможно, ссылка изменилась. Все услуги и материалы доступны в меню.')+`<div class="wrap not-found"><a href="#/" class="button">На главную ${icon('arrow')}</a></div>`;
}

export function getPage(route = '') {
  const path = route.replace(/^\/?/, '').split('/').filter(Boolean);
  const [page, id] = path;
  let content;
  let title = 'Чистотека — с пониманием каждой ткани';
  if (!page) content = home();
  else if(page==='services' && id) {content=servicePage(id); title=(services.find(x=>x.id===id)?.name||'Услуги')+' — Чистотека';}
  else if(page==='services') {content=breadcrumb([['Услуги']])+pageTitle('Химчистка для вашего дома','Выберите вещь.<br>Подход подберём мы.','От отдельных предметов до текстиля во всём доме. Начнём с материала и вашей задачи.')+servicesSection(true)+materialsSection()+finalCTA();title='Услуги химчистки — Чистотека';}
  else if(page==='works' && id) {content=workPage(id); title=(cases.find(x=>x.id===id)?.title||'Наши работы')+' — Чистотека';}
  else if(page==='works') {content=breadcrumb([['Наши работы']])+pageTitle('Практика в подробностях','Что стоит<br>за чистой мебелью.','Реальные истории из канала Никиты: материал, задача и принятые решения.')+worksSection(true)+compareSection()+finalCTA();title='Разборы реальных работ — Чистотека';}
  else if(page==='prices') {content=pricesPage(); title='Стоимость химчистки — Чистотека';}
  else if(page==='about') {content=aboutPage(); title='Никита Семьянов — Чистотека';}
  else if(page==='academy') {content=academyPage(); title='Обучение химчистке — Никита Семьянов';}
  else if(page==='journal'&&id) {content=articlePage(id); title=(articles.find(x=>x.id===id)?.title||'Материалы')+' — Чистотека';}
  else if(page==='journal') {content=breadcrumb([['Разборы и советы']])+pageTitle('Полезно знать заранее','Когда понимаешь,<br>выбирать проще.','Понятные материалы о подготовке, стоимости и особенностях химчистки.')+journalSection(true)+finalCTA();title='Разборы и советы — Чистотека';}
  else if(page==='privacy') {content=privacyPage(); title='Конфиденциальность — Чистотека';}
  else {content=notFound();title='Страница не найдена — Чистотека';}
  let html=header()+`<main id="main" tabindex="-1">${content}</main>`+footer();
  html=html.replaceAll('href="#/',`href="${import.meta.env.BASE_URL}`);
  if(page==='about') html=html.replace('<h2>Я Никита.<br>Мебель — моё дело.</h2>','<h1>Я Никита.<br>Мебель — моё дело.</h1>');
  return {html,title};
}

function readRoute() {
  const base=import.meta.env.BASE_URL;
  if(location.hash.startsWith('#/')) return location.hash.slice(2);
  return location.pathname.startsWith(base) ? location.pathname.slice(base.length).replace(/\/$/,'') : location.pathname.slice(1);
}
function render() {
  closeModal(false);
  const route=readRoute();
  const {html,title}=getPage(route);
  document.title=title;
  app.innerHTML=html;
  activeMaterial=0; currentFilter='all';
  window.scrollTo({top:0,behavior:'instant'});
  initPage();
  if(route==='academy/program') requestAnimationFrame(()=>$('#program')?.scrollIntoView({behavior:'smooth'}));
  if(location.hash && !location.hash.startsWith('#/')) requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'smooth'}));
}

function initPage() {
  if(revealObserver) revealObserver.disconnect();
  revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');revealObserver.unobserve(e.target);}}),{threshold:0.05});
  $$('.section-heading, .founder-copy, .process-step, .academy-teaser, .final-cta, .service-card, .work-card, .journal-card').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el);});
  const task=$('#estimate-task'), mat=$('#estimate-material');
  if(task) task.value=estimator.task;
  if(mat) mat.value=estimator.material;
  updateEstimate();
  syncHeader();
}

function updateEstimate() {
  const s=services.find(x=>x.id===estimator.selected);
  const items=[...estimateBasket,estimator];
  const custom=items.some(item=>item.selected==='delicate'||['Вискоза / шёлк','Натуральная кожа'].includes(item.material)||item.task==='После другой чистки');
  const amount=$('#estimate-amount');
  if(amount) amount.textContent=custom?'Нужна оценка мастера':'от '+money(2500*items.reduce((sum,item)=>sum+item.quantity,0));
  if($('#estimate-unit')) $('#estimate-unit').textContent=custom?'Начнём с фото изделия':'за выбранные изделия';
  if($('#quantity')) $('#quantity').textContent=estimator.quantity;
  $$('[data-item]').forEach(b=>{const on=b.dataset.item===s?.id;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
  $$('[data-quantity]').forEach(b=>b.disabled=(b.dataset.quantity==='-1'&&estimator.quantity===1)||(b.dataset.quantity==='1'&&estimator.quantity===20));
  if($('#estimate-basket')) $('#estimate-basket').innerHTML=estimateBasket.map((item,i)=>`<div class="basket-item"><span>${icon(services.find(s=>s.id===item.selected)?.icon||'sofa')}<span><strong>${services.find(s=>s.id===item.selected)?.name} × ${item.quantity}</strong><small>${item.task} · ${item.material}</small></span></span><button data-remove-item="${i}" aria-label="Удалить ${services.find(s=>s.id===item.selected)?.name} из заказа">${icon('close')}</button></div>`).join('');
}

function toast(text) {
  const el=$('#toast'); el.textContent=text;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),3200);
}

function modalMarkup(service) {
  const selected=service==='builder'?estimator.selected:(service||draft.service||'furniture');
  const s=services.find(x=>x.id===selected)||services[0];
  const description=service==='builder'?[...estimateBasket,estimator].map((item,i)=>`${i+1}. ${services.find(x=>x.id===item.selected)?.name}, количество: ${item.quantity}. Задача: ${item.task}. Материал: ${item.material}.`).join('\n'):draft.description||'';
  const selectedService=service==='builder'&&estimateBasket.length?'complex':s.id;
  draft.service=selectedService;
  return `<div class="modal-backdrop" data-backdrop></div><section class="estimate-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><div class="modal-header"><span class="small-label">Чистотека / Оценка изделия</span><button class="icon-button" data-close-modal aria-label="Закрыть окно">${icon('close')}</button></div><div id="modal-content"><div class="modal-title">${eyebrow('Начнём с вашей задачи')}<h2 id="modal-title">Покажите,<br>что нужно почистить.</h2><p>Подготовим обращение. Вы отправите его Никите в Telegram и сможете сразу задать вопросы.</p></div><form id="estimate-form"><label class="field-label" for="modal-service">Что будем чистить</label><select id="modal-service" name="service">${services.map(x=>`<option value="${x.id}" ${x.id===selectedService?'selected':''}>${x.name}</option>`).join('')}</select><label class="field-label" for="photo-input">Фотографии изделия <span>необязательно</span></label><label class="upload-zone" for="photo-input">${icon('upload')}<strong>Добавить фотографии</strong><span>Общий вид, деталь и бирка · до 5 фото по 10 МБ</span><input id="photo-input" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple /></label><div id="photo-previews" class="photo-previews"></div><p class="field-hint">Здесь фото видите только вы. В Telegram их нужно будет прикрепить отдельно.</p><label class="field-label" for="modal-description">Расскажите о задаче</label><textarea id="modal-description" name="description" rows="3" maxlength="1600" placeholder="Какие пятна, как давно появились, что уже пробовали…">${escapeHTML(description)}</textarea><label class="field-label" for="modal-location">Район или населённый пункт <span>необязательно</span></label><input id="modal-location" name="location" type="text" maxlength="120" value="${escapeHTML(draft.location||'')}" placeholder="Например, Хамовники или Одинцово" autocomplete="address-level2" /><button type="submit" class="button button-full">Подготовить обращение ${icon('arrow')}</button><p class="modal-privacy">Данные остаются на вашем устройстве до перехода в Telegram. <a href="${import.meta.env.BASE_URL}privacy">Подробнее</a></p></form></div></section>`;
}

function openModal(service='') {
  if(!$('.estimate-modal')) modalOpener=document.activeElement;
  $('#overlay-root').innerHTML=modalMarkup(service);
  document.body.classList.add('modal-open');
  app.inert=true;
  $('#estimate-form').addEventListener('submit',prepareMessage);
  $('#photo-input').addEventListener('change',handlePhotos);
  renderPhotoPreviews();
  requestAnimationFrame(()=>{$('.estimate-modal').classList.add('open');$('.estimate-modal').focus();});
}

function closeModal(restore=true) {
  if(!$('.estimate-modal')) return;
  captureDraft();
  $('#overlay-root').innerHTML='';document.body.classList.remove('modal-open');app.inert=false;
  if(restore&&modalOpener?.isConnected) modalOpener.focus();
}

function captureDraft() {
  const form=$('#estimate-form');
  if(form){draft={service:$('#modal-service').value,description:$('#modal-description').value,location:$('#modal-location').value};saveDraft();}
}

async function handlePhotos(event) {
  let rejected=false;
  for(const file of [...event.target.files]) {
    if(modalFiles.length>=5||file.size>10*1024*1024||!(/image\//.test(file.type)||/\.(heic|heif)$/i.test(file.name))){rejected=true;continue;}
    if(modalFiles.some(x=>x.file.name===file.name&&x.file.size===file.size))continue;
    modalFiles.push({file,url:URL.createObjectURL(file),id:crypto.randomUUID()});
  }
  event.target.value='';renderPhotoPreviews();
  if(rejected)toast('До 5 фотографий, каждая — не больше 10 МБ.');
}
function renderPhotoPreviews() {
  const previews=$('#photo-previews');if(!previews)return;
  previews.innerHTML=modalFiles.map(f=>`<div class="photo-preview"><img src="${f.url}" alt="${escapeHTML(f.file.name)}" /><button type="button" data-remove-photo="${f.id}" aria-label="Удалить ${escapeHTML(f.file.name)}">${icon('close')}</button><span>${escapeHTML(f.file.name)}</span></div>`).join('');
  $$('.photo-preview img').forEach(img=>img.addEventListener('error',()=>{img.style.display='none';img.parentElement.classList.add('photo-unsupported');}));
}

function prepareMessage(event) {
  event.preventDefault();captureDraft();
  const s=services.find(x=>x.id===draft.service);
  const message=`Никита, здравствуйте! Хочу оценить химчистку.\n\nИзделие: ${s?.name||'Мебель'}${draft.description?'\nЗадача: '+draft.description:''}${draft.location?'\nРайон: '+draft.location:''}${modalFiles.length?'\nПодготовил(а) фото: '+modalFiles.length+'. Прикреплю их в диалоге.':''}\n\nПодскажите, пожалуйста, возможный подход и стоимость.`;
  $('#modal-content').innerHTML=`<div class="message-ready"><div class="ready-icon">${icon('check')}</div><span class="small-label">Обращение подготовлено</span><h2 id="modal-title">Всё готово<br>к разговору.</h2><p>Откройте Telegram, проверьте текст и отправьте сообщение Никите.</p><div class="message-preview">${escapeHTML(message).replace(/\n/g,'<br>')}</div>${modalFiles.length?`<div class="attachment-reminder">${icon('camera')}<p><strong>Прикрепите ${modalFiles.length} фото в Telegram.</strong><br>Фотографии с сайта автоматически не передаются.</p></div>`:''}${external(business.telegram+'?text='+encodeURIComponent(message),'Открыть Telegram '+icon('telegram'),'button button-full')}<button class="button button-outline button-full" data-copy-message>Скопировать текст ${icon('copy')}</button><button class="back-edit text-link" data-edit-message>Вернуться к редактированию</button><p class="caption">Сообщение ещё не отправлено. На связи с 10:00 до 19:00 по Москве.</p></div>`;
  $('.estimate-modal').scrollTop=0;$('.estimate-modal').focus();
  $('[data-copy-message]').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(message);toast('Текст скопирован. Можно вставить в диалог.');}
    catch{toast('Выделите и скопируйте текст обращения вручную.');}
  });
}

function syncHeader() { $('.site-header')?.classList.toggle('scrolled',window.scrollY>30);document.body.classList.toggle('show-mobile-action',window.scrollY>450); }

if(typeof document !== 'undefined') {
document.addEventListener('click',event=>{
  const target=event.target.closest('button,a,[data-backdrop]');if(!target)return;
  if(target.hasAttribute('data-estimate')) {openModal(target.dataset.estimate);return;}
  if(target.hasAttribute('data-close-modal')||target.hasAttribute('data-backdrop')) {closeModal();return;}
  if(target.hasAttribute('data-edit-message')) {openModal(draft.service);return;}
  if(target.hasAttribute('data-remove-photo')) {const idx=modalFiles.findIndex(f=>f.id===target.dataset.removePhoto);if(idx>=0){URL.revokeObjectURL(modalFiles[idx].url);modalFiles.splice(idx,1);renderPhotoPreviews();}return;}
  if(target.hasAttribute('data-clear-draft')) {draft={};saveDraft();modalFiles.forEach(f=>URL.revokeObjectURL(f.url));modalFiles=[];toast('Черновик и выбранные фотографии удалены.');return;}
  if(target.matches('.menu-toggle')) {const open=target.getAttribute('aria-expanded')==='true';target.setAttribute('aria-expanded',String(!open));target.setAttribute('aria-label',open?'Открыть меню':'Закрыть меню');$('.mobile-nav').hidden=open;target.innerHTML=icon(open?'menu':'close');return;}
  if(target.hasAttribute('data-scroll')) {event.preventDefault();$('#'+target.dataset.scroll)?.scrollIntoView({behavior:'smooth'});return;}
  if(target.classList.contains('skip-link')) {event.preventDefault();$('#main').focus();$('#main').scrollIntoView({behavior:'instant'});return;}
  if(target.hasAttribute('data-material')) {setMaterial(Number(target.dataset.material));return;}
  if(target.hasAttribute('data-item')) {estimator.selected=target.dataset.item;updateEstimate();return;}
  if(target.hasAttribute('data-quantity')) {estimator.quantity=Math.max(1,Math.min(20,estimator.quantity+Number(target.dataset.quantity)));updateEstimate();return;}
  if(target.hasAttribute('data-add-item')) {if(estimateBasket.length>=9){toast('До 10 позиций в одном обращении. Дополнения можно описать мастеру.');return;}estimateBasket.push({...estimator});estimator.quantity=1;updateEstimate();toast('Добавлено. Теперь выберите следующее изделие.');return;}
  if(target.hasAttribute('data-remove-item')) {estimateBasket.splice(Number(target.dataset.removeItem),1);updateEstimate();return;}
  if(target.hasAttribute('data-filter')) {currentFilter=target.dataset.filter;$$('[data-filter]').forEach(b=>{b.classList.toggle('active',b===target);b.setAttribute('aria-pressed',String(b===target));});$('#works-grid').innerHTML=cases.filter(c=>currentFilter==='all'||c.category===currentFilter).map(workCard).join('');return;}
  if(target.hasAttribute('data-compare-mode')) {const side=target.dataset.compareMode==='side';$('.compare-stage').classList.toggle('side-by-side',side);$$('[data-compare-mode]').forEach(b=>{b.classList.toggle('active',b===target);b.setAttribute('aria-pressed',String(b===target));});return;}
  if(target.closest('.mobile-nav')){$('.mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');}
  if(target.tagName==='A'&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&target.target!=='_blank'){
    const url=new URL(target.href,location.href);
    if(url.origin===location.origin&&url.pathname.startsWith(import.meta.env.BASE_URL)&&url.hash!=='#main'){
      event.preventDefault();history.pushState({},'',url.pathname+url.search+url.hash);render();$('#main').focus({preventScroll:true});
    }
  }
});

function setMaterial(i) {
  activeMaterial=i;
  $$('[data-material]').forEach((b,j)=>{b.setAttribute('aria-selected',String(j===i));b.tabIndex=j===i?0:-1;});
  $('#material-panel').innerHTML=materialPanel(i);$('#material-panel').setAttribute('aria-labelledby','tab-'+materials[i].id);
}
document.addEventListener('input',event=>{if(event.target.matches('.compare-range'))event.target.closest('.compare-stage').style.setProperty('--compare',event.target.value+'%');if(event.target.closest('#estimate-form'))captureDraft();});
document.addEventListener('change',event=>{if(event.target.id==='estimate-task')estimator.task=event.target.value;if(event.target.id==='estimate-material')estimator.material=event.target.value;updateEstimate();});
document.addEventListener('keydown',event=>{
  if(event.target.matches('[data-material]')&&['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const i=event.key==='Home'?0:event.key==='End'?materials.length-1:(activeMaterial+(event.key==='ArrowRight'?1:-1)+materials.length)%materials.length;setMaterial(i);$(`[data-material="${i}"]`).focus();}
  const modal=$('.estimate-modal');
  if(modal){if(event.key==='Escape')closeModal();if(event.key==='Tab'){const focusable=$$('a[href],button:not([disabled]),input,textarea,select',modal).filter(el=>el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal)){event.preventDefault();last?.focus();}else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===modal)){event.preventDefault();first?.focus();}}}
});
window.addEventListener('scroll',syncHeader,{passive:true});
window.addEventListener('hashchange',render);
window.addEventListener('popstate',render);
render();
}
