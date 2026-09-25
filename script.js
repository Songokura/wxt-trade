/* ============================================================
   WXT TRADE - скрипт страницы.
   Плиты и лазерный раскрой (герой и фото-плиты) · перевод RU/KZ/EN
   (словари kk и en грузятся по кнопке из assets/lang/) · меню · бегущие
   ленты · палитра со стрелками · WhatsApp с готовым текстом · форма в
   WhatsApp. Библиотек нет.
   ============================================================ */
(function(){
"use strict";
var WA = "77007333705";              /* для wa.me */

var RED = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("no-plate"); /* no-plate - плоская копия для съёмки */
var HAS_IO = typeof IntersectionObserver === "function";
var root = document.documentElement;

/* ---------------- КОНВЕРСИИ GOOGLE ADS ----------------
   Ярлыки задаёт index.html (window.WXT_CONV): phone, contact, lead. Пусто - не шлём. */
function conv(key){
  var id = (window.WXT_CONV || {})[key];
  if (!id || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {send_to: id, value: 1.0, currency: "USD", transport_type: "beacon"});
}
document.addEventListener("click", function(e){
  var a = e.target.closest ? e.target.closest("a[href]") : null;
  if (!a) return;
  var h = a.getAttribute("href") || "";
  if (h.indexOf("tel:") === 0) conv("phone");
  else if (h.indexOf("wa.me") > -1) conv("contact");
}, true);

/* ---------------- СЛОВАРИ ----------------
   Казахский и английский лежат в assets/lang/kk.js и assets/lang/en.js и грузятся только
   по выбору языка (или ?lang= / сохранённый выбор). В разметке и здесь казахского текста нет -
   проверка Google Ads видит русский сайт. */
var ASSET_V = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "";
var LANGS = {};                      /* lang -> {dict, wa, tick, form, hud} */
function loadLang(lang, done){
  if (lang === "ru" || LANGS[lang]) return done();
  var s = document.createElement("script");
  s.src = "assets/lang/" + lang + ".js" + (ASSET_V ? "?v=" + ASSET_V : "");
  s.onload = function(){
    var pack = lang === "kk" ? window.SITE_KK : window.SITE_EN;
    if (pack) LANGS[lang] = pack;
    done();
  };
  s.onerror = function(){ done(); };
  document.head.appendChild(s);
}
function pack(){ var l = curLang(); return LANGS[l] || null; }

var WA_RU = {
  hero:"Здравствуйте! Хочу рассчитать стоимость изделия из нержавейки.\nЧто нужно: ",
  svc:"Здравствуйте! Интересует: {t}.\nРазмеры и задача: ",
  card:"Здравствуйте! Интересует: {t}.\nРазмеры и задача: ",
  kontakty:"Здравствуйте! Пишу с сайта WXT Trade. Вопрос: "
};
var TICK_RU = ["Ресторанное оборудование","Облицовка лифтов","Перила и ограждения","Ёмкости и трубопроводы","Арт-экраны","Входные группы","Лазерная резка 6×2 м","Гибка и сварка","Полировка","Нержавеющий прокат","Цветная нержавейка PVD"];
var BRANDS = ["PepsiCo Central Asia","Супермаркеты Small","Усть-Каменогорская птицефабрика","Базис-А","Птицефабрика Прима Кус"];
var FORM_RU = {hello:"Здравствуйте! Заявка на расчёт с сайта WXT Trade.", name:"Имя", what:"Что нужно", phone:"Телефон", msg:"Комментарий", none:"не выбрано"};
var HUD_RU = "РЕЗ";

/* ---------------- ПЕРЕВОД ---------------- */
var RU = {};
function snapshot(){
  document.querySelectorAll("[data-i]").forEach(function(el){ if (RU[el.dataset.i] === undefined) RU[el.dataset.i] = el.innerHTML; });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){ RU[el.dataset.iAlt] = el.alt; });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){ RU[el.dataset.iAria] = el.getAttribute("aria-label"); });
  document.querySelectorAll("[data-i-c]").forEach(function(el){ RU[el.dataset.iC] = el.getAttribute("content"); });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){ RU[el.dataset.iPh] = el.getAttribute("placeholder"); });
  var t = document.querySelector("title[data-i-t]"); if (t) RU[t.dataset.iT] = t.textContent;
}
function curLang(){ return root.lang === "kk" ? "kk" : (root.lang === "en" ? "en" : "ru"); }
function pick(k, d){ return (d && d[k] !== undefined) ? d[k] : RU[k]; }

/* ссылки WhatsApp собираются заранее (при смене языка), а не в момент клика -
   так трекер LeadBot спокойно дописывает код обращения в href */
function setWaLinks(){
  var p = pack(), W = (p && p.wa) || WA_RU;
  document.querySelectorAll("[data-wa]").forEach(function(a){
    var key = a.dataset.wa, t = W[key] || W.hero;
    if (t.indexOf("{t}") > -1) {
      var name = "";
      if (a.dataset.t) {
        name = (p && p.t && p.t[a.dataset.t]) ? p.t[a.dataset.t] : a.dataset.t;
      } else {
        var box = a.closest(".card, .txt"), h = box ? box.querySelector("h3, h2") : null;
        name = h ? h.textContent.trim() : "";
      }
      t = t.replace("{t}", name);
    }
    a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(t);
    a.target = "_blank"; a.rel = "noopener";
  });
}

function applyLang(lang){
  var d = LANGS[lang] ? LANGS[lang].dict : null;
  if (lang !== "ru" && !d) lang = "ru";
  root.setAttribute("lang", lang);
  document.querySelectorAll("[data-i]").forEach(function(el){
    var v = pick(el.dataset.i, d); if (v !== undefined) el.innerHTML = v;
  });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){
    var v = pick(el.dataset.iAlt, d); if (v !== undefined) el.alt = v;
  });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){
    var v = pick(el.dataset.iAria, d); if (v !== undefined) el.setAttribute("aria-label", v);
  });
  document.querySelectorAll("[data-i-c]").forEach(function(el){
    var v = pick(el.dataset.iC, d); if (v !== undefined) el.setAttribute("content", v);
  });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){
    var v = pick(el.dataset.iPh, d); if (v !== undefined) el.setAttribute("placeholder", v);
  });
  var t = document.querySelector("title[data-i-t]");
  if (t) { var tv = pick(t.dataset.iT, d); if (tv !== undefined) t.textContent = tv; }
  var og = document.querySelector('meta[property="og:locale"]');
  if (og) og.setAttribute("content", lang === "kk" ? "kk_KZ" : (lang === "en" ? "en_US" : "ru_RU"));
  document.querySelectorAll(".lang button").forEach(function(b){
    var on = b.getAttribute("data-lang") === lang;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  try { localStorage.setItem("wxt-lang", lang); } catch(e){}
  setWaLinks();
  fillTicker();
  fitText();
  requestAnimationFrame(fitText);
}
/* ?lang= в URL сильнее localStorage: русское объявление не должно открыть казахскую версию.
   Язык по navigator.language не угадываем - казахский и английский только явным выбором. */
function initLang(){
  var url = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("wxt-lang"); } catch(e){}
  var lang = (url === "kk" || url === "ru" || url === "en") ? url : ((saved === "kk" || saved === "en") ? saved : "ru");
  setLang(lang);
}
function setLang(lang){
  if (lang === "kk" || lang === "en") loadLang(lang, function(){ applyLang(lang); });
  else applyLang("ru");
}
document.querySelectorAll(".lang button").forEach(function(b){
  b.addEventListener("click", function(){ setLang(b.getAttribute("data-lang")); });
});

/* дисплейные строки: казахский длиннее - ужимаем, пока не влезет */
function fitText(){
  document.querySelectorAll(".h1 span, .kphone").forEach(function(el){
    el.style.fontSize = "";
    var box = el.parentElement.clientWidth;
    if (!box) return;
    var size = parseFloat(getComputedStyle(el).fontSize), base = size;
    while (el.scrollWidth > box + 1 && size > base * 0.5) {
      size *= 0.95;
      el.style.fontSize = size + "px";
    }
  });
}

/* ---------------- БЕГУЩИЕ СТРОКИ ---------------- */
function fillRow(el, list, speed){
  if (!el) return;
  var one = list.map(function(t){ return "<b>" + t + "</b>"; }).join("");
  el.innerHTML = one;
  var w = el.scrollWidth || 1000;
  var need = Math.max(2, Math.ceil((innerWidth * 2) / w) + 1);
  var html = "";
  for (var i = 0; i < need; i++) html += one;
  el.innerHTML = html;
  el.style.setProperty("--tkw", w + "px");
  el.style.setProperty("--tkd", Math.max(14, w / speed) + "s");
}
function fillTicker(){
  var p = pack();
  fillRow(document.getElementById("ticker"), (p && p.tick) || TICK_RU, 46);
  fillRow(document.getElementById("brands1"), BRANDS, 38);
  fillRow(document.getElementById("brands2"), BRANDS.slice().reverse(), 32);
}
var rsTimer;
addEventListener("resize", function(){ clearTimeout(rsTimer); rsTimer = setTimeout(function(){ fillTicker(); fitText(); palState(); }, 200); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fillTicker(); fitText(); });

/* ---------------- МЕНЮ ---------------- */
var burger = document.getElementById("burger");
var mnav = document.getElementById("mnav");
function closeMenu(){
  document.body.classList.remove("menu-open");
  if (burger) burger.setAttribute("aria-expanded", "false");
}
if (burger) burger.addEventListener("click", function(){
  var open = document.body.classList.toggle("menu-open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
});
if (mnav) mnav.addEventListener("click", function(e){ if (e.target.closest("a")) closeMenu(); });
addEventListener("keydown", function(e){ if (e.key === "Escape") closeMenu(); });

/* ---------------- ЯКОРЯ ----------------
   Плиты (.pw) встают на верх экрана, обычные секции и карточки - под шапку. */
var HH = function(){ return parseFloat(getComputedStyle(root).getPropertyValue("--hh")) || 70; };
function goTo(id, smooth){
  var t = document.getElementById(id); if (!t) return false;
  var top = t.getBoundingClientRect().top + scrollY - (t.classList.contains("pw") ? 0 : HH() + 12);
  if (!smooth) root.style.scrollBehavior = "auto";
  scrollTo({ top: Math.max(0, top), behavior: (smooth && !RED) ? "smooth" : "auto" });
  if (!smooth) setTimeout(function(){ root.style.scrollBehavior = ""; }, 50);
  return true;
}
document.addEventListener("click", function(e){
  var a = e.target.closest('a[href^="#"]'); if (!a) return;
  var id = a.getAttribute("href").slice(1); if (!id) return;
  if (!document.getElementById(id)) return;
  e.preventDefault();
  closeMenu();
  goTo(id, true);
  try { history.pushState(null, "", "#" + id); } catch(err){}
});

/* ---------------- ШАПКА ---------------- */
var hdr = document.getElementById("hdr");
function hdrState(){ if (hdr) hdr.classList.toggle("solid", scrollY > 40); }

/* ---------------- ПЛИТЫ ----------------
   Один слушатель scroll через rAF. На каждую .pw пишем --enter/--exit/--stay и --open
   (раскрытие решётки у фото-плит). Герой получает --f (интро: лазер прочерчивает решётку). */
function clamp(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
function easeOut(t){ return 1 - Math.pow(1 - t, 2.4); }
var heroPw = document.getElementById("top");
var hero = document.getElementById("hero");
var pws = [].slice.call(document.querySelectorAll(".pw"));
var bar = document.getElementById("bar");
var kont = document.getElementById("kontakty");
var hudx = document.getElementById("hudx"), hudy = document.getElementById("hudy"), hudp = document.getElementById("hudp");
var introK = 1, introDone = true;
function hud(f, stay){
  if (!hudx) return;
  /* координаты головы лазера: по интро идёт по контуру окна, по скроллу - раскрытие */
  var p = f;
  var x = p < .5 ? 1220 * (p / .5) : 1220 * (1 - (p - .5) / .5);
  var y = p < .5 ? 0 : 3050 * ((p - .5) / .5);
  hudx.textContent = "X " + x.toFixed(1).padStart(6, "0");
  hudy.textContent = "Y " + y.toFixed(1).padStart(6, "0");
  var lab = (pack() && pack().hud) || HUD_RU;
  hudp.textContent = lab + " " + Math.round(100 * Math.max(f, stay)) + "%";
}
function update(){
  var H = innerHeight || root.clientHeight;
  pws.forEach(function(pw){
    var r = pw.getBoundingClientRect();
    var enter = clamp(1 - r.top / H);
    var exit  = clamp(1 - r.bottom / H);
    var stay  = r.height > H + 1 ? clamp(-r.top / (r.height - H)) : enter;
    var open  = pw === heroPw ? 1 : easeOut(clamp((enter - .42) / .5));
    pw.style.setProperty("--enter", enter.toFixed(3));
    pw.style.setProperty("--exit",  exit.toFixed(3));
    pw.style.setProperty("--stay",  stay.toFixed(3));
    pw.style.setProperty("--open",  open.toFixed(3));
    pw.classList.toggle("gone", exit >= 1);
    pw.classList.toggle("on", enter > 0.6);
    if (pw === heroPw) { pw.style.setProperty("--f", easeOut(introK).toFixed(3)); hud(easeOut(introK), stay); }
  });
  hdrState();
  if (bar) {
    var onKont = kont && kont.getBoundingClientRect().top < H * 0.6;
    bar.classList.toggle("show", scrollY > H * 0.55 && !onKont);
  }
}
if (RED) {
  root.classList.add("no-plate");
  root.classList.add("no-intro");
  if (hero) hero.classList.add("on");
  pws.forEach(function(pw){ pw.classList.add("on"); });
  hud(1, 0);
  addEventListener("scroll", function(){ hdrState(); if (bar) bar.classList.toggle("show", scrollY > innerHeight * 0.55); }, {passive:true});
  hdrState();
} else {
  var tick = false;
  addEventListener("scroll", function(){
    if (tick) return; tick = true;
    requestAnimationFrame(function(){ tick = false; update(); });
  }, {passive:true});
  addEventListener("resize", update);
  addEventListener("load", update);
  /* интро 1500 мс: лазер прочерчивает решётку, сквозь ячейки проступает кадр, текст поднимается.
     Пропускаем при хэше / прокрутке - человек из рекламы сразу видит собранный экран. */
  var skip = location.hash || scrollY > 80;
  if (skip) {
    root.classList.add("no-intro");
    if (hero) hero.classList.add("on");
    update();
  } else {
    introK = 0; introDone = false; update();
    var t0 = null;
    var step = function(ts){
      if (introDone) return;
      if (t0 === null) t0 = ts;
      var p = clamp((ts - t0) / 1500);
      introK = p;
      update();
      if (p < 1) requestAnimationFrame(step);
      else introDone = true;
    };
    requestAnimationFrame(function(){ requestAnimationFrame(step); });
    setTimeout(function(){ if (hero) hero.classList.add("on"); }, 560);
    setTimeout(function(){ if (!introDone) { introDone = true; introK = 1; update(); } }, 2100);
  }
}
window.plateSync = function(){ introDone = true; introK = 1; if (hero) hero.classList.add("on"); update(); };
addEventListener("hashchange", function(){
  root.classList.add("no-intro");
  var id = location.hash.slice(1); if (!id || !document.getElementById(id)) return;
  goTo(id, false);
  setTimeout(function(){ goTo(id, false); }, 420);
});

/* ---------------- ПОЯВЛЕНИЕ В КАТАЛОЖНЫХ СЕКЦИЯХ ---------------- */
if (HAS_IO) {
  if (!RED) root.classList.add("js");
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {threshold:.08, rootMargin:"0px 0px -5% 0px"});
  document.querySelectorAll(".rv").forEach(function(el){ io.observe(el); });
  setTimeout(function(){ document.querySelectorAll(".rv:not(.in)").forEach(function(el){
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in");
  }); }, 1500);
} else {
  document.querySelectorAll(".rv").forEach(function(el){ el.classList.add("in"); });
}

/* ---------------- ПАЛИТРА: стрелки листают ровно одну карточку ---------------- */
var pal = document.getElementById("pal"), palPrev = document.getElementById("palPrev"), palNext = document.getElementById("palNext");
function palStep(){
  var li = pal && pal.querySelector("li"); if (!li) return 160;
  var gap = parseFloat(getComputedStyle(pal).columnGap || getComputedStyle(pal).gap) || 0;
  return li.getBoundingClientRect().width + gap;
}
function palState(){
  if (!pal || !palPrev) return;
  var max = pal.scrollWidth - pal.clientWidth;
  var none = max <= 1;
  palPrev.hidden = none; palNext.hidden = none;
  palPrev.disabled = pal.scrollLeft <= 1;
  palNext.disabled = pal.scrollLeft >= max - 1;
}
if (pal) {
  palPrev.addEventListener("click", function(){ pal.scrollBy({left: -palStep(), behavior: RED ? "auto" : "smooth"}); });
  palNext.addEventListener("click", function(){ pal.scrollBy({left: palStep(), behavior: RED ? "auto" : "smooth"}); });
  pal.addEventListener("scroll", function(){ requestAnimationFrame(palState); }, {passive:true});
  palState();
  addEventListener("load", palState);
}

/* ---------------- ФОРМА → WhatsApp ---------------- */
var form = document.getElementById("form");
if (form) form.addEventListener("submit", function(e){
  e.preventDefault();
  var ok = document.getElementById("fmok"), err = document.getElementById("fmerr");
  if (form.company && form.company.value) return;          /* honeypot */
  var phone = form.phone.value.trim();
  if (phone.replace(/\D/g, "").length < 10) { err.hidden = false; ok.hidden = true; form.phone.focus(); return; }
  err.hidden = true;
  var p = pack(), F = (p && p.form) || FORM_RU;
  var sel = form.what, what = sel.value ? sel.options[sel.selectedIndex].textContent.trim() : F.none;
  var name = form.name.value.trim(), msg = form.msg.value.trim();
  var t = F.hello + "\n" + (name ? F.name + ": " + name + "\n" : "") + F.what + ": " + what + "\n" + F.phone + ": " + phone + (msg ? "\n" + F.msg + ": " + msg : "");
  ok.hidden = false;
  conv("lead");
  window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(t), "_blank", "noopener");
});

/* ---------------- СТАРТ ---------------- */
snapshot();
initLang();
fillTicker();
fitText();
hdrState();
/* прямой переход по якорю: встать на блок, интро уже пропущено */
if (location.hash) {
  var hid = location.hash.slice(1);
  if (document.getElementById(hid)) {
    setTimeout(function(){ goTo(hid, false); }, 60);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (location.hash.slice(1) === hid) goTo(hid, false); });
  }
}
})();
