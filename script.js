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

  /* ---------- year in footer ---------- */
  const yearEl = document.querySelector('.footer-meta span:first-child');
  if (yearEl) yearEl.textContent = `© ${new Date().getFullYear()}`;

})();
