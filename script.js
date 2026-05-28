/* =========================================================
   Gnana Tulasi Makineni — Portfolio
   Interactivity: cursor, reveals, nav, hover effects
   ========================================================= */

(() => {
  'use strict';

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
