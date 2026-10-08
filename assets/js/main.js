/* Comportamiento mínimo del portafolio: tema, menú móvil, revelado, progreso y CTA fijo. */
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tema: sigue al sistema; el visitante puede fijarlo. Nunca depende del almacenamiento.
  var themeBtn = document.getElementById('theme-btn');
  function effectiveTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) { /* sin almacenamiento: se usa el tema del sistema */ }
  function paintThemeLabel() {
    if (themeBtn) themeBtn.textContent = effectiveTheme() === 'dark' ? 'Claro' : 'Oscuro';
  }
  if (themeBtn) {
    paintThemeLabel();
    themeBtn.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      paintThemeLabel();
    });
  }

  // Menú móvil
  var menuBtn = document.getElementById('menu-btn');
  var nav = document.getElementById('nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Revelado al hacer scroll (una sola vez)
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
    // Red de seguridad: si el observador no se dispara (pestaña en segundo plano,
    // captura de vista previa, impresión) el contenido nunca debe quedar oculto.
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add('in'); });
    }, 3500);
  }

  // Barra de progreso de lectura (páginas de caso)
  var bar = document.querySelector('.progress');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // CTA fijo en móvil: aparece al salir del hero
  var cta = document.querySelector('.sticky-cta');
  var hero = document.querySelector('.hero, .case-hero');
  if (cta && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      cta.classList.toggle('show', !entries[0].isIntersecting);
    }).observe(hero);
  }

  // Sección activa en la navegación (home)
  var links = document.querySelectorAll('.nav a.link[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          var a = map[en.target.id];
          if (a) a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }
})();
