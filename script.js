/* ==========================================================================
   SIMO — portfolio v3 · interactions
   No dependencies. Everything degrades to a readable page without JS.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  /* ---------------------------------------------------------------- theme */
  const themeBtn = $('#themeToggle');
  const themeMeta = $('meta[name="theme-color"]');
  const figures = $$('iframe[data-figure]');
  function applyTheme(t) {
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    themeMeta.setAttribute('content', t === 'dark' ? '#0c0b0a' : '#f3efe7');
    figures.forEach((f) => f.contentWindow?.postMessage({ type: 'theme', theme: t }, '*'));
  }
  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');

  /* ------------------------------------- live figures (explainers/*.html) */
  // They load lazily, so ask for the right theme up front and repeat it once loaded;
  // each figure reports its height so the iframe never scrolls or letterboxes.
  figures.forEach((f) => {
    if (root.dataset.theme === 'light') f.src = f.getAttribute('src') + '?theme=light';
    f.addEventListener('load', () => f.contentWindow?.postMessage({ type: 'theme', theme: root.dataset.theme }, '*'));
  });
  window.addEventListener('message', (e) => {
    const f = figures.find((x) => x.contentWindow === e.source);
    if (!f || !e.data || e.data.type !== 'figure-height') return;
    const h = Math.round(Number(e.data.height));
    if (h > 120 && h < 2000) f.style.height = h + 'px';
  });
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set('simo-theme', next);
  });

  /* ------------------------------------------------- nav, progress, menu */
  const nav = $('#nav');
  const bar = $('#progressBar');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 12);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  const menuBtn = $('#menuBtn');
  const menu = $('#mobileMenu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('scrolled', open || window.scrollY > 12);
  }
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // highlight the nav link of the section in view
  const navLinks = $$('.nav-links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* --------------------------------------------------------------- reveal */
  const reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    // stagger siblings that enter together
    const io = new IntersectionObserver((entries) => {
      let i = 0;
      entries.filter((en) => en.isIntersecting).forEach((en) => {
        en.target.style.setProperty('--d', `${Math.min(i++, 5) * 0.08}s`);
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ----------------------------------------------------------------- deck */
  const deck = $('#deck');
  if (deck) {
    const cards = $$('.deck-card', deck);
    let order = cards.map((_, i) => i);
    let timer = null;
    let paused = false;

    function layout() {
      order.forEach((cardIndex, pos) => {
        const c = cards[cardIndex];
        c.style.setProperty('--o', pos);
        c.dataset.o = pos;
        c.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
        c.tabIndex = pos === 0 ? 0 : -1;
      });
    }
    function step(dir) {
      if (dir > 0) order.push(order.shift());
      else order.unshift(order.pop());
      layout();
    }
    function restart() {
      clearInterval(timer);
      if (reduceMotion.matches || paused) return;
      timer = setInterval(() => { if (!document.hidden) step(1); }, 4800);
    }

    $('#deckNext').addEventListener('click', () => { step(1); restart(); });
    $('#deckPrev').addEventListener('click', () => { step(-1); restart(); });
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { step(1); restart(); e.preventDefault(); cards[order[0]].focus(); }
      if (e.key === 'ArrowLeft') { step(-1); restart(); e.preventDefault(); cards[order[0]].focus(); }
    });
    const wrap = deck.closest('.deck-wrap');
    wrap.addEventListener('mouseenter', () => { paused = true; restart(); });
    wrap.addEventListener('mouseleave', () => { paused = false; restart(); });
    wrap.addEventListener('focusin', () => { paused = true; restart(); });
    wrap.addEventListener('focusout', () => { paused = false; restart(); });

    // drag / swipe the front card
    let drag = null;
    deck.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.deck-card');
      if (!card || card.dataset.o !== '0' || e.button !== 0) return;
      drag = { card, x: e.clientX, y: e.clientY, dx: 0, moved: false, id: e.pointerId };
    });
    deck.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved) {
        if (Math.abs(drag.dx) < 6) return;
        if (Math.abs(dy) > Math.abs(drag.dx)) { drag = null; return; } // vertical scroll wins
        drag.moved = true;
        drag.card.classList.add('dragging');
        drag.card.setPointerCapture(e.pointerId);
      }
      drag.card.style.transform = `translate3d(${drag.dx}px, ${Math.abs(drag.dx) * 0.04}px, 0) rotate(${drag.dx * 0.03}deg)`;
    });
    function endDrag(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const { card, dx, moved } = drag;
      drag = null;
      if (!moved) return;
      card.classList.remove('dragging');
      card.style.transform = '';
      card.dataset.justDragged = '1';
      setTimeout(() => delete card.dataset.justDragged, 50);
      if (Math.abs(dx) > 70) step(dx < 0 ? 1 : -1);
      restart();
    }
    deck.addEventListener('pointerup', endDrag);
    deck.addEventListener('pointercancel', endDrag);
    // a drag must not follow the card's link
    cards.forEach((c) => c.addEventListener('click', (e) => { if (c.dataset.justDragged) e.preventDefault(); }));
    cards.forEach((c) => c.addEventListener('dragstart', (e) => e.preventDefault()));

    layout();
    restart();
    reduceMotion.addEventListener('change', restart);
  }

  /* ------------------------------------------------------- case studies */
  let opener = null;
  function openCase(id, push = true) {
    const dlg = document.getElementById('cs-' + id);
    if (!dlg || dlg.open) return;
    opener = document.activeElement;
    dlg.showModal();
    dlg.dataset.active = '1';
    dlg.scrollTop = 0;
    root.style.overflow = 'hidden';
    if (push) history.pushState({ cs: id }, '', '#case/' + id);
    const close = $('[data-close]', dlg);
    if (close) close.focus({ preventScroll: true });
  }
  // Cleanup runs synchronously from every close path; the native 'close' event
  // is only a fallback, because some embedded browsers never fire it.
  function cleanupCase(dlg) {
    if (!dlg.dataset.active) return;
    delete dlg.dataset.active;
    root.style.overflow = '';
    const id = dlg.id.slice(3);
    if (location.hash === '#case/' + id) {
      // step back over the entry we pushed, or point the URL back at the project
      if (history.state && history.state.cs === id) history.back();
      else history.replaceState(null, '', '#' + id);
    }
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  }
  function closeCase(dlg) {
    if (dlg.open) dlg.close();
    cleanupCase(dlg);
  }
  $$('.cs').forEach((dlg) => {
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeCase(dlg); });
    dlg.addEventListener('close', () => cleanupCase(dlg));
    $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => closeCase(dlg)));
  });
  $$('[data-case]').forEach((b) => b.addEventListener('click', () => openCase(b.dataset.case)));

  function syncFromHash() {
    const m = location.hash.match(/^#case\/([\w-]+)$/);
    const openDlg = $('.cs[open]');
    if (m) { if (!openDlg || openDlg.id !== 'cs-' + m[1]) { if (openDlg) closeCase(openDlg); openCase(m[1], false); } }
    else if (openDlg) closeCase(openDlg);
  }
  window.addEventListener('popstate', syncFromHash);
  window.addEventListener('hashchange', syncFromHash);
  if (location.hash.startsWith('#case/')) {
    // open after layout so the page behind is in place
    requestAnimationFrame(() => {
      const id = location.hash.slice(6);
      const target = document.getElementById(id);
      if (target) target.scrollIntoView();
      history.replaceState(null, '', '#' + id);
      openCase(id, true);
    });
  }

  /* ------------------------------------------------------------- video */
  $$('.card-video').forEach((video) => {
    const btn = video.parentElement.querySelector('.video-toggle');
    let userPaused = reduceMotion.matches;
    function sync() {
      if (!btn) return;
      btn.hidden = false;
      btn.classList.toggle('paused', video.paused);
      btn.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    }
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    if (btn) {
      btn.hidden = false;
      sync();
      btn.addEventListener('click', () => {
        if (video.paused) { userPaused = false; video.play().catch(() => {}); }
        else { userPaused = true; video.pause(); }
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            video.preload = 'auto';
            if (!userPaused) video.play().catch(() => sync());
          } else if (!video.paused) {
            video.pause();
          }
        });
      }, { threshold: 0.35 }).observe(video);
    }
  });
})();
