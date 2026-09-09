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

    // ── A layered neural net that animates a forward pass (blue signal flowing
    //    left→right) then a backward pass (orange gradient flowing right→left) —
    //    i.e. backpropagation, drawn as the ambient background.
    const BLUE = '56,189,248', ORANGE = '243,118,38';
    let layers = [];   // array of layers; each layer = array of {x,y}
    let edges = [];     // {a:{x,y}, b:{x,y}, li} between layer li and li+1

    const buildNet = () => {
      const shape = width < 700 ? [4, 6, 5, 3] : [5, 8, 8, 6, 4, 2];
      const leftX = width * 0.05, rightX = width - width * 0.05;
      // Start the network vertically right after the title ("...BI Engineer"),
      // filling the hero space below it.
      const titleEl = document.querySelector('.hero-title');
      const topY = titleEl ? titleEl.getBoundingClientRect().bottom + 28 : height * 0.45;
      const botY = height - 24;
      const colGap = (rightX - leftX) / (shape.length - 1);
      layers = shape.map((count, li) => {
        const x = leftX + li * colGap;
        const rowGap = (botY - topY) / (count + 1);
        return Array.from({ length: count }, (_, i) => ({ x, y: topY + (i + 1) * rowGap }));
      });
      edges = [];
      for (let li = 0; li < layers.length - 1; li++) {
        layers[li].forEach((a) => layers[li + 1].forEach((b) => edges.push({ a, b, li })));
      }
    };
    buildNet();
    window.addEventListener('resize', buildNet);

    // Wave front sweeps 0→(L-1) forward, then back to 0; the color flips per direction.
    const L = () => layers.length;
    let front = 0, dir = 1;         // dir: +1 forward (blue), -1 backward (orange)
    const SPEED = 0.018;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      front += dir * SPEED;
      if (front >= L() - 1) { front = L() - 1; dir = -1; }
      else if (front <= 0)  { front = 0;       dir = 1;  }
      const col = dir > 0 ? BLUE : ORANGE;

      // Edges — faint baseline, brighter where the wave is crossing
      edges.forEach((e) => {
        const prog = front - e.li;                 // 0..1 while the wave crosses this gap
        const active = prog > -0.15 && prog < 1.15;
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.strokeStyle = active
          ? `rgba(${col},${0.10 + 0.22 * (1 - Math.abs(prog - 0.5) * 2)})`
          : 'rgba(148,163,184,0.05)';
        ctx.lineWidth = active ? 1.1 : 0.5;
        ctx.stroke();

        // A travelling pulse dot riding this edge in the wave's direction
        if (active && prog >= 0 && prog <= 1) {
          const t = dir > 0 ? prog : 1 - prog;
          const px = e.a.x + (e.b.x - e.a.x) * t;
          const py = e.a.y + (e.b.y - e.a.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${col},0.9)`;
          ctx.shadowBlur = 8; ctx.shadowColor = `rgba(${col},0.9)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Nodes — glow as the wave front reaches their layer
      layers.forEach((layer, li) => {
        const near = 1 - Math.min(1, Math.abs(front - li));   // 1 at the front, fades away
        layer.forEach((n) => {
          const r = 4 + near * 3;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = near > 0.05 ? `rgba(${col},${0.35 + near * 0.5})` : 'rgba(148,163,184,0.28)';
          if (near > 0.05) { ctx.shadowBlur = 14 * near; ctx.shadowColor = `rgba(${col},0.9)`; }
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(${col},${0.2 + near * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });

      if (running) requestAnimationFrame(animate);
    };

    let running = true;
    animate();
    const resume = () => { if (!running) { running = true; animate(); } };

    // Show the background only through the hero's summary-metrics cell; fade it out
    // and pause it once the reader scrolls past that cell.
    canvas.style.transition = 'opacity 0.5s ease';
    const cutoffEl = document.getElementById('cell-0') || document.querySelector('.hero');
    const updateVisibility = () => {
      let past = false;
      if (cutoffEl) {
        const bottom = cutoffEl.getBoundingClientRect().bottom;
        past = bottom < window.innerHeight * 0.25; // metrics cell scrolled mostly out of view
      }
      canvas.style.opacity = past ? '0' : '1';
      if (past) { running = false; } else { resume(); }
    };
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    updateVisibility();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) running = false; else updateVisibility();
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
