/* =========================================================
   Gnana Tulasi Makineni — Portfolio Interactive Engine
   Visual Data Science Animations, Neural Canvas & Notebook Lab
   ========================================================= */

(() => {
  'use strict';

  /* =========================================================
     0. NOTEBOOK BOOT / ENTRANCE OVERLAY
     Plays a short "kernel starting → cells running → checkpoint
     saved" sequence, then fades into the site. Skippable, shown
     once per session, and skipped entirely under reduced-motion.
     ========================================================= */
  const initBootScreen = () => {
    const screen = document.getElementById('boot-screen');
    if (!screen) return;

    const dismiss = () => {
      screen.classList.add('done');
      document.body.classList.remove('booting');
      setTimeout(() => screen.remove(), 700);
    };

    document.body.classList.add('booting');
    const linesEl = document.getElementById('boot-lines');
    const barEl = document.getElementById('boot-bar-fill');
    const statusEl = document.getElementById('boot-status');

    const steps = [
      { t: 250,  pct: 15,  status: 'Connecting to kernel', line: '[<span class="tag">I</span>] Starting Python 3.11 kernel…' },
      { t: 700,  pct: 38,  status: 'Kernel ready',         line: '[<span class="tag">I</span>] Kernel connected · ipykernel' },
      { t: 1150, pct: 64,  status: 'Running all cells',    line: '[<span class="tag">I</span>] Executing notebook cells…' },
      { t: 1600, pct: 86,  status: 'Rendering outputs',    line: '[<span class="tag">I</span>] Rendering models &amp; visualizations…' },
      { t: 2050, pct: 100, status: 'Checkpoint saved',     line: '<span class="ok">✓</span> Checkpoint saved · portfolio ready' },
    ];

    let live = true;
    const skip = () => { if (live) { live = false; dismiss(); } };
    screen.addEventListener('click', skip);
    window.addEventListener('keydown', skip, { once: true });

    steps.forEach((s) => setTimeout(() => {
      if (!live) return;
      if (statusEl) statusEl.innerHTML = s.status + '<span class="boot-cursor">▍</span>';
      if (barEl) barEl.style.width = s.pct + '%';
      if (linesEl) {
        const div = document.createElement('div');
        div.className = 'boot-line';
        div.innerHTML = s.line;
        linesEl.appendChild(div);
      }
    }, s.t));

    setTimeout(() => { if (live) { live = false; dismiss(); } }, 2650);
  };
  initBootScreen();

  /* =========================================================
     8. SCROLL REVEAL OBSERVER
     ========================================================= */
  const initScrollReveals = () => {
    const reveals = document.querySelectorAll('[data-reveal]');
    
    // Immediately reveal elements near top on load
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add('is-in');
      }
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

      reveals.forEach((el) => {
        if (!el.classList.contains('is-in')) io.observe(el);
      });
    } else {
      reveals.forEach((el) => el.classList.add('is-in'));
    }
  };

  /* =========================================================
     1. HERO NEURAL NETWORK & DATA STREAM CANVAS
     ========================================================= */

  const initHeroCanvas = () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 18), 75);

    // Background Floating ML Math & Humor Strings
    const mathJokes = [
      "all models are wrong, some are useful",
      "correlation is not causation",
      "in God we trust, all others bring data",
      "garbage in, garbage out",
      "the simplest model that works, wins",
      "signal over noise",
      "validate before you celebrate",
      "let the data decide",
      "significant, and it matters",
      "measure twice, model once",
      "features beat parameters",
      "reproducibility is a feature",
      "clean data, clear decisions",
      "the best model is the deployed one",
      "trust the process, verify the data",
      "beware the p-value trap"
    ];

    const floatingTexts = [];
    const textCount = 10; // fewer than the joke pool so there are always spares to rotate in
    const colors = ['#f37626', '#38bdf8', '#a3e635', '#c084fc', '#14b8a6', '#fb7185', '#fbbf24'];
    const fontSizes = [11, 12, 13, 14, 15];

    // Keep jokes off the hero's text elements only (name/tagline sit directly on the
    // background). Everything else on the page is inside opaque cards that cover them,
    // so this lets the aphorisms fill the gaps and margins without hitting any text.
    const avoidEls = ['.hero-title', '.hero-tagline', '.pronounce', '.hero-meta', '.hero-actions', '.nb-cell--hero', '.hero .md-bar']
      .map((s) => document.querySelector(s)).filter(Boolean);
    const PADX = 48, PADY = 22; // generous clearance so nothing crowds the text
    const overText = (x, y) => avoidEls.some((el) => {
      const r = el.getBoundingClientRect();           // viewport coords == canvas coords
      if (!r.width) return false;
      return x > r.left - PADX && x < r.right + PADX && y > r.top - PADY && y < r.bottom + PADY;
    });
    const safeSpawn = () => {
      let x, y, tries = 0;
      do {
        x = Math.random() * width;
        y = Math.random() * height;
        tries++;
      } while (overText(x, y) && tries < 25);
      return { x, y };
    };

    // Start with a shuffled, non-repeating set of jokes
    const shuffled = [...mathJokes].sort(() => Math.random() - 0.5);
    for (let i = 0; i < textCount; i++) {
      const pos = safeSpawn();
      floatingTexts.push({
        text: shuffled[i],
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        opacity: Math.random() * 0.22 + 0.34,
        color: colors[i % colors.length],
        fontSize: fontSizes[i % fontSizes.length]
      });
    }

    // Every 1.8s swap one joke for a fresh one that isn't currently on screen
    setInterval(() => {
      const visible = new Set(floatingTexts.map((f) => f.text));
      const spares = mathJokes.filter((j) => !visible.has(j));
      if (!spares.length) return;
      const t = floatingTexts[Math.floor(Math.random() * floatingTexts.length)];
      const pos = safeSpawn();
      t.text = spares[Math.floor(Math.random() * spares.length)];
      t.x = pos.x; t.y = pos.y;
      t.color = colors[Math.floor(Math.random() * colors.length)];
      t.fontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];
      t.opacity = Math.random() * 0.22 + 0.34;
    }, 1800);

    let mouse = { x: width / 2, y: height / 2, radius: 140 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1.5,
        color: i % 4 === 0 ? '#f37626' : (i % 3 === 0 ? '#14b8a6' : '#3b82f6'),
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background floating ML & Stats text jokes across the whole screen,
      // fading out only while passing behind the hero title box.
      floatingTexts.forEach((t) => {
        t.x += t.vx;
        t.y += t.vy;

        if (t.x < -300 || t.x > width + 300) t.vx *= -1;
        if (t.y < -50 || t.y > height + 50) t.vy *= -1;

        if (overText(t.x, t.y)) return; // never draw over the hero name/text

        ctx.save();
        ctx.font = `${t.fontSize}px "JetBrains Mono", "Courier New", monospace`;
        ctx.globalAlpha = t.opacity;
        ctx.shadowBlur = 12;
        ctx.shadowColor = t.color;
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction signal glow
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < mouse.radius) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(243, 118, 38, ${0.35 * (1 - mdist / mouse.radius)})`;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (running) requestAnimationFrame(animate);
    };

    // The ambient background always floats (gentle, intentional). Only pause it when
    // the hero is scrolled away or the tab is hidden, to save CPU.
    let running = true;
    animate();
    const resume = () => { if (!running) { running = true; animate(); } };
    if ('IntersectionObserver' in window) {
      const heroEl = document.querySelector('.hero') || canvas;
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) resume();
        else running = false;
      }, { threshold: 0 }).observe(heroEl);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) running = false; else resume();
    });
  };

  /* =========================================================
     TOAST NOTIFICATIONS & MOBILE MENU TOGGLE
     ========================================================= */
  const showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  /* =========================================================
     2. JUPYTER NOTEBOOK CELL INTERACTIVITY & TAB SWITCHER
     ========================================================= */
  const initNotebookLab = () => {
    let globalExecCount = 1;

    // Attach toast feedback to Jupyter Notebook Header buttons
    document.querySelectorAll('.jp-tb-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('title') || 'Notebook Action';
        if (title.includes('Save')) showToast('Notebook checkpoint saved to local session.');
        else if (title.includes('Insert')) showToast('Inserted new cell below [Code].');
        else if (title.includes('Interrupt')) showToast('Kernel execution interrupted.');
        else if (title.includes('Restart')) { showToast('Python 3.11 kernel restarted.'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      });
    });

    const runCell = (cell) => {
      return new Promise((resolve) => {
        const btn = cell.querySelector('.cell-run');
        const prompt = cell.querySelector('.cell-prompt');
        const outPrompt = cell.querySelector('.out-prompt');

        prompt.textContent = 'In [*]:';
        btn.style.opacity = '0.5';

        setTimeout(() => {
          globalExecCount += 1;
          prompt.textContent = `In [${globalExecCount}]:`;
          if (outPrompt) outPrompt.textContent = `Out[${globalExecCount}]:`;
          btn.style.opacity = '1';
          showToast(`Executed cell In [${globalExecCount}]`);
          cell.classList.add('is-run'); // reveals the output
          resolve();
        }, 320);
      });
    };

    // Hide each cell's output until its ▶ is clicked.
    document.querySelectorAll('.cell-collapsed-hint, .cell-toggle').forEach((el) => el.remove());
    document.querySelectorAll('.nb-cell').forEach((cell) => {
      if (cell.querySelector('.cell-out')) cell.classList.add('collapsible');
    });

    // The bar ▶ toggles: 1st click runs and shows the output, 2nd click hides it again.
    document.querySelectorAll('.cell-run').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const cell = e.target.closest('.nb-cell');
        if (!cell) return;
        if (cell.classList.contains('collapsible') && cell.classList.contains('is-run')) {
          cell.classList.remove('is-run'); // hide on second click
        } else {
          runCell(cell);
        }
      });
    });

    // Run All Cells button
    const runAllBtn = document.getElementById('nb-runall-btn');
    if (runAllBtn) {
      runAllBtn.addEventListener('click', async () => {
        runAllBtn.style.opacity = '0.6';
        runAllBtn.textContent = 'Running...';
        for (const cell of document.querySelectorAll('.nb-cell')) {
          await runCell(cell);
          await new Promise((r) => setTimeout(r, 120));
        }
        // Also expand the df.* accordion cells (projects / experience / skills / contact).
        for (const acc of document.querySelectorAll('.df-accordion-container')) {
          if (!acc.classList.contains('expanded')) {
            acc.classList.add('expanded');
            acc.querySelector('.df-accordion-header')?.setAttribute('aria-expanded', 'true');
            await new Promise((r) => setTimeout(r, 120));
          }
        }
        runAllBtn.style.opacity = '1';
        runAllBtn.textContent = '▶ Run All';
      });
    }

    // Tab switcher smooth jump
    const tabs = document.querySelectorAll('.nb-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const targetId = tab.dataset.tab;
        if (targetId === 'all') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (targetId === 'claim-routing') {
          document.getElementById('proj-claim-routing')?.scrollIntoView({ behavior: 'smooth' });
        } else if (targetId === 'libbey-kpi') {
          document.getElementById('proj-libbey-kpi')?.scrollIntoView({ behavior: 'smooth' });
        } else if (targetId === 'bio-age') {
          document.getElementById('proj-bio-age')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  };

  /* =========================================================
     3. PROJECT 1: CLAIM SAVINGS SIMULATOR
     ========================================================= */
  const initClaimSimulator = () => {
    const inputVol = document.getElementById('input-volume');
    const inputRate = document.getElementById('input-rate');
    const lblVol = document.getElementById('lbl-volume');
    const lblRate = document.getElementById('lbl-rate');
    const outputVal = document.getElementById('sim-result-output');
    const barFill = document.getElementById('sim-bar-fill');
    const simVolValCode = document.getElementById('sim-vol-val');

    if (!inputVol || !inputRate) return;

    const updateSavings = () => {
      const vol = parseInt(inputVol.value, 10);
      const rate = parseInt(inputRate.value, 10);

      lblVol.textContent = vol.toLocaleString();
      lblRate.textContent = `${rate}%`;
      if (simVolValCode) simVolValCode.textContent = vol;

      // Savings model formula derived from actual project analytics
      const annualSavings = Math.round((vol * 12) * (rate / 100) * 1.05);
      outputVal.textContent = `$${annualSavings.toLocaleString()}`;

      const pct = Math.min(100, Math.max(10, (annualSavings / 500000) * 100));
      if (barFill) barFill.style.width = `${pct}%`;
    };

    inputVol.addEventListener('input', updateSavings);
    inputRate.addEventListener('input', updateSavings);
    updateSavings();
  };

  /* =========================================================
     4. PROJECT 2: REAL-TIME FACTORY STREAM CANVAS (60FPS)
     ========================================================= */
  const initFactoryStreamCanvas = () => {
    const canvas = document.getElementById('factory-stream-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let running = true; // always stream the live sensor
    let metricMode = 'yield'; // yield, oee, energy
    const dataPoints = new Array(60).fill(98.4);
    let step = 0;

    const streamValDisplay = document.getElementById('stream-val-display');
    const toggleBtns = document.querySelectorAll('.stream-btn');

    toggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        metricMode = btn.dataset.metric;
      });
    });

    const drawStream = () => {
      step += 0.08;
      let targetVal = 98.4;
      let strokeColor = '#14b8a6';

      if (metricMode === 'yield') {
        targetVal = 98.2 + Math.sin(step) * 1.2 + (Math.random() - 0.5) * 0.4;
        strokeColor = '#14b8a6';
        if (streamValDisplay) streamValDisplay.textContent = `Yield: ${targetVal.toFixed(1)}%`;
      } else if (metricMode === 'oee') {
        targetVal = 87.0 + Math.cos(step * 0.8) * 2.5 + (Math.random() - 0.5) * 0.8;
        strokeColor = '#8b5cf6';
        if (streamValDisplay) streamValDisplay.textContent = `OEE: ${targetVal.toFixed(1)} Score`;
      } else if (metricMode === 'energy') {
        targetVal = 420 + Math.sin(step * 1.5) * 35 + (Math.random() - 0.5) * 10;
        strokeColor = '#f59e0b';
        if (streamValDisplay) streamValDisplay.textContent = `Power: ${Math.round(targetVal)} kW`;
      }

      dataPoints.push(targetVal);
      dataPoints.shift();

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Grid background lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 20; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Min/Max normalize for graph bounds
      const min = Math.min(...dataPoints) - 2;
      const max = Math.max(...dataPoints) + 2;

      ctx.beginPath();
      const stepX = w / (dataPoints.length - 1);

      dataPoints.forEach((val, i) => {
        const x = i * stepX;
        const normY = h - ((val - min) / (max - min)) * (h - 40) - 20;
        if (i === 0) ctx.moveTo(x, normY);
        else ctx.lineTo(x, normY);
      });

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Glow fill under curve
      const lastX = w;
      const lastNormY = h - ((dataPoints[dataPoints.length - 1] - min) / (max - min)) * (h - 40) - 20;
      ctx.lineTo(lastX, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const fillGradient = ctx.createLinearGradient(0, 0, 0, h);
      fillGradient.addColorStop(0, strokeColor.replace('1)', '0.25)').replace('#14b8a6', 'rgba(20,184,166,0.2)'));
      fillGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = fillGradient;
      ctx.fill();

      // Pulsing head point
      ctx.beginPath();
      ctx.arc(lastX - 4, lastNormY, 5, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = strokeColor;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (running) requestAnimationFrame(drawStream);
    };

    const resume = () => { if (!running) { running = true; drawStream(); } };
    drawStream(); // always stream (pauses only when offscreen / tab hidden)

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) resume();
        else running = false;
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) running = false; else resume();
    });
  };

  /* =========================================================
     5. PROJECT 3: BIOLOGICAL AGE ML CALCULATOR
     ========================================================= */
  const initBioAgeCalculator = () => {
    const inputChrono = document.getElementById('bio-chrono');
    const inputBmi = document.getElementById('bio-bmi');
    const inputSleep = document.getElementById('bio-sleep');
    const inputBp = document.getElementById('bio-bp');

    const lblChrono = document.getElementById('lbl-chrono');
    const lblBmi = document.getElementById('lbl-bmi');
    const lblSleep = document.getElementById('lbl-sleep');
    const lblBp = document.getElementById('lbl-bp');

    const resultAge = document.getElementById('bio-result-age');
    const resultDiff = document.getElementById('bio-result-diff');

    const shapBmi = document.getElementById('shap-bmi');
    const shapSleep = document.getElementById('shap-sleep');
    const shapBp = document.getElementById('shap-bp');

    if (!inputChrono || !inputBmi) return;

    const calcBioAge = () => {
      const chrono = parseFloat(inputChrono.value);
      const bmi = parseFloat(inputBmi.value);
      const sleep = parseFloat(inputSleep.value);
      const bp = parseFloat(inputBp.value);

      lblChrono.textContent = chrono;
      lblBmi.textContent = bmi;
      lblSleep.textContent = sleep;
      lblBp.textContent = bp;

      // Non-linear ML surrogate function based on NHANES XGBoost model
      const bmiDelta = (bmi - 24.5) * 0.45;
      const sleepDelta = (7.5 - sleep) * 0.9;
      const bpDelta = (bp - 120) * 0.12;

      const bioAge = chrono + bmiDelta + sleepDelta + bpDelta;
      const diff = bioAge - chrono;

      if (resultAge) resultAge.innerHTML = `${bioAge.toFixed(1)} <span class="bio-unit">yrs</span>`;

      if (resultDiff) {
        if (diff <= 0) {
          resultDiff.className = 'bio-diff-tag good';
          resultDiff.textContent = `${Math.abs(diff).toFixed(1)} years younger than calendar age`;
        } else {
          resultDiff.className = 'bio-diff-tag bad';
          resultDiff.textContent = `+${diff.toFixed(1)} years accelerated bio-aging`;
        }
      }

      // Dynamic SHAP impact bar updates
      if (shapBmi) shapBmi.style.width = `${Math.min(100, Math.abs(bmiDelta) * 18 + 20)}%`;
      if (shapSleep) shapSleep.style.width = `${Math.min(100, Math.abs(sleepDelta) * 22 + 25)}%`;
      if (shapBp) shapBp.style.width = `${Math.min(100, Math.abs(bpDelta) * 16 + 15)}%`;
    };

    [inputChrono, inputBmi, inputSleep, inputBp].forEach((el) => el.addEventListener('input', calcBioAge));
    calcBioAge();
  };



  /* =========================================================
     7. DATAFRAME ACCORDIONS
     ========================================================= */
  const initDataframeAccordions = () => {
    const sections = [
      { id: 'work',       label: 'df.projects',   comment: 'featured work' },
      { id: 'experience', label: 'df.experience', comment: 'career timeline' },
      { id: 'skills',     label: 'df.skills',      comment: 'the toolkit' },
      { id: 'contact',    label: 'df.contact',     comment: 'say hello' }
    ];

    sections.forEach((sec, i) => {
      const el = document.getElementById(sec.id);
      if (!el) return;

      // The accordion header now plays the "cell" role, so drop the section's own
      // markdown-bar AND its section-label to avoid stacking redundant headers.
      el.querySelector('.md-bar')?.remove();
      el.querySelector('.section-label')?.remove();

      // Cells inside the accordion always show their output — the accordion IS the
      // collapse, so don't double-hide them (that made df.projects look empty).
      el.querySelectorAll('.nb-cell').forEach((c) => c.classList.remove('collapsible'));

      // Create accordion container
      const wrapper = document.createElement('div');
      wrapper.className = 'df-accordion-container';

      // Render the header as a Jupyter code cell: ▶ · In [n]: · df.projects()
      const header = document.createElement('button');
      header.className = 'df-accordion-header';
      header.setAttribute('aria-expanded', 'false');
      header.innerHTML =
        `<span class="df-run" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>` +
        `<span class="cell-prompt">In&nbsp;[${7 + i}]:</span>` +
        `<code class="cell-code"><span class="k-var">${sec.label}</span>()  <span class="k-com"># ${sec.comment}</span></code>` +
        `<span class="df-arrow" aria-hidden="true">▸</span>`;

      const content = document.createElement('div');
      content.className = 'df-accordion-content';
      
      const inner = document.createElement('div');
      inner.className = 'df-accordion-inner';
      
      // Wrap the section
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(header);
      wrapper.appendChild(content);
      content.appendChild(inner);
      inner.appendChild(el);

      // Setup click listener
      header.addEventListener('click', () => {
        const open = wrapper.classList.toggle('expanded');
        header.setAttribute('aria-expanded', String(open));
      });
    });

    // Nav links (notebook-header menu bar): expand the target's accordion FIRST,
    // then smooth-scroll once it's open so the jump lands at the right spot.
    document.querySelectorAll('.jp-menu-bar a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();
        const el = document.getElementById(href.substring(1));
        if (!el) return;
        const wrapper = el.closest('.df-accordion-container');
        const wasCollapsed = wrapper && !wrapper.classList.contains('expanded');
        if (wrapper) {
          wrapper.classList.add('expanded');
          wrapper.querySelector('.df-accordion-header')?.setAttribute('aria-expanded', 'true');
        }
        // Wait for the accordion's expand transition before scrolling (else it lands short).
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), wasCollapsed ? 260 : 0);
      });
    });
  };

  /* =========================================================
     ANIMATED METRIC COUNTERS
     ========================================================= */
  const initMetricCounters = () => {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.count, 10);
      const prefix = counter.dataset.prefix || '';
      const suffix = counter.dataset.suffix || '';
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));

      const update = () => {
        current += step;
        if (current >= target) {
          counter.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
        } else {
          counter.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
          requestAnimationFrame(update);
        }
      };

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            update();
            observer.disconnect();
          }
        }, { threshold: 0.2 });
        observer.observe(counter);
      } else {
        update();
      }
    });
  };

  /* =========================================================
     INITIALIZATION ON DOM LOAD
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
    initNotebookLab();
    initClaimSimulator();
    initFactoryStreamCanvas();
    initBioAgeCalculator();
    initDataframeAccordions();
    initMetricCounters();
    initScrollReveals();
  });

})();
