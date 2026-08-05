/* =========================================================
   Gnana Tulasi Makineni — Portfolio
   Interactivity: cursor, reveals, nav, hover effects
   ========================================================= */

(() => {
  'use strict';

  /* ---------- field deployment boot sequence ---------- */
  const boot = document.getElementById('boot');
  if (boot) {
    const log = document.getElementById('bootLog');
    const enterBtn = document.getElementById('bootEnter');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = (() => { try { return sessionStorage.getItem('booted'); } catch { return null; } })();

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      try { sessionStorage.setItem('booted', '1'); } catch {}
      boot.classList.add('is-done');
      document.body.classList.remove('boot-lock');
      window.removeEventListener('keydown', dismiss);
      setTimeout(() => boot.remove(), 720);
    };

    if (reduce || seen) {
      boot.remove();
    } else {
      // deployment log — real work, in field-console voice
      const lines = [
        '<span class="tag">[ ok ]</span> uplink to field site · <span class="val">unison health</span>',
        '<span class="tag">[ ok ]</span> mount /data · <span class="val">20k records</span>',
        '<span class="tag">[ ok ]</span> load models · randomforest · xgboost · elasticnet',
        '<span class="tag">[ ok ]</span> deploy agents · <span class="val">claude · gpt · gemini</span>',
        '<span class="tag">[ ok ]</span> power bi service · <span class="val">5 dashboards online</span>',
        '<span class="tag">[ ok ]</span> alert daemon · &minus;10% energy · +20% asset life',
        '<span class="tag-warn">[ $$ ]</span> savings engine · <span class="val">~$180k identified</span>',
        '<span class="tag">[ ok ]</span> deployment nominal',
      ];

      document.body.classList.add('boot-lock');
      window.addEventListener('keydown', dismiss);
      boot.addEventListener('click', dismiss);
      enterBtn?.addEventListener('click', dismiss);

      let i = 0;
      const step = () => {
        if (i >= lines.length) {
          boot.classList.add('is-ready');
          setTimeout(() => { if (!dismissed) dismiss(); }, 4200); // auto-continue hook
          return;
        }
        const el = document.createElement('div');
        el.className = 'boot-line';
        el.innerHTML = lines[i];
        log?.appendChild(el);
        i += 1;
        setTimeout(step, 240);
      };
      setTimeout(step, 260);

      // safety: never trap the visitor if something stalls
      setTimeout(dismiss, 9000);
    }
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

  /* ---------- nav hide on scroll down, show on scroll up ---------- */
  const nav = document.querySelector('.nav');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) < 6) { ticking = false; return; }

    if (y > lastY && y > 200) {
      nav?.classList.add('is-hidden');
    } else {
      nav?.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
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
