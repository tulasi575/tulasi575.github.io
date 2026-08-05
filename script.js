/* =========================================================
   Gnana Tulasi Makineni — Portfolio
   Interactivity: cursor, reveals, nav, hover effects
   ========================================================= */

(() => {
  'use strict';

  /* ---------- jupyter notebook cells ---------- */
  const cells = [...document.querySelectorAll('[data-cell]')];
  if (cells.length) {
    document.body.classList.add('nb-ready');
    const kernel = document.querySelector('.nb-kernel');
    const kernelState = document.querySelector('.nb-kernel-state');
    let execCount = 0;

    const runCell = (cell, fast) => new Promise((resolve) => {
      if (cell.dataset.run === '1') return resolve();
      cell.dataset.run = '1';
      const btn = cell.querySelector('.cell-run');
      const prompt = cell.querySelector('.cell-prompt');
      const outPrompt = cell.querySelector('.out-prompt');
      const out = cell.querySelector('.cell-out');

      btn.classList.remove('hint');
      btn.classList.add('busy');
      prompt.textContent = 'In [*]:';
      kernel?.classList.add('busy');
      if (kernelState) kernelState.textContent = 'running';

      setTimeout(() => {
        execCount += 1;
        prompt.textContent = `In [${execCount}]:`;
        if (outPrompt) outPrompt.textContent = `Out[${execCount}]:`;
        btn.classList.remove('busy');
        btn.classList.add('done');
        out?.classList.add('is-run');
        cell.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
        kernel?.classList.remove('busy');
        if (kernelState) kernelState.textContent = 'idle';
        resolve();
      }, fast ? 260 : 560); // ponytail: fake compute delay — cosmetic, tune freely
    });

    cells.forEach((c) => c.querySelector('.cell-run').addEventListener('click', () => runCell(c)));
    cells[0]?.querySelector('.cell-run').classList.add('hint');

    document.querySelector('.nb-runall')?.addEventListener('click', async () => {
      for (const c of cells) { await runCell(c, true); await new Promise((r) => setTimeout(r, 130)); }
    });

    // clicking a nav link executes its target cell on the way there
    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.addEventListener('click', () => {
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target?.hasAttribute('data-cell')) runCell(target);
      });
    });
  }

  /* ---------- custom cursor ---------- */
  const cursor = document.querySelector('.cursor-dot');
  if (cursor && window.matchMedia('(min-width: 901px)').matches) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx, cy = my;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    const tick = () => {
      cx += (mx - cx) * 0.10;
      cy += (my - cy) * 0.10;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    const hoverables = document.querySelectorAll('a, button, .mini-card, .contact-card, .chips span');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- scroll reveals ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- nav stays put; subtle solidify on scroll ---------- */
  const nav = document.querySelector('.nav');
  let ticking = false;
  const onScroll = () => {
    nav?.classList.toggle('is-scrolled', window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- mini-card spotlight follow ---------- */
  const miniCards = document.querySelectorAll('.mini-card');
  miniCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });

  /* ---------- magnetic buttons ---------- */
  const magneticEls = document.querySelectorAll('.btn, .nav-cta, .footer-top');
  magneticEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.18;
      const dy = (e.clientY - cy) * 0.18;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  /* ---------- title characters wonkify on hero hover ---------- */
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.addEventListener('mouseenter', () => {
      heroTitle.style.fontVariationSettings = '"opsz" 144, "SOFT" 100, "WONK" 1';
    });
    heroTitle.addEventListener('mouseleave', () => {
      heroTitle.style.fontVariationSettings = '"opsz" 144, "SOFT" 30, "WONK" 0';
    });
  }

  /* ---------- year in footer ---------- */
  const yearEl = document.querySelector('.footer-meta span:first-child');
  if (yearEl) yearEl.textContent = `© ${new Date().getFullYear()}`;

})();
