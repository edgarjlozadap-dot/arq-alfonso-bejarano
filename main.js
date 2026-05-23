/* ═══════════════════════════════════════════════════════
   MANUAL DE IDENTIDAD — ARQ. ALFONSO BEJARANO
   Scroll interactions
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── PROGRESS BAR ───────────────────────────────────
  const progressBar = document.getElementById('progressBar');

  function updateProgress() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  // ── REVEAL ON SCROLL ───────────────────────────────
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-scale');

  function lockVisible(el) {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
    el.style.transitionDelay = '0s';
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);

          const delay    = parseFloat(getComputedStyle(entry.target).transitionDelay)    * 1000 || 0;
          const duration = parseFloat(getComputedStyle(entry.target).transitionDuration) * 1000 || 900;
          setTimeout(() => lockVisible(entry.target), delay + duration + 50);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // ── ACTIVE NAV DOT ─────────────────────────────────
  const sections = document.querySelectorAll('.section');
  const navDots  = document.querySelectorAll('.nav-dot');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navDots.forEach((dot) => {
            dot.classList.toggle('active', dot.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  // ── SMOOTH DOT CLICK ───────────────────────────────
  navDots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(dot.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── COVER PARALLAX ─────────────────────────────────
  const coverBg   = document.querySelector('.cover-bg');
  const coverGrid = document.querySelector('.cover-grid');

  function parallax() {
    const y = window.scrollY;
    if (coverBg)   coverBg.style.transform   = `translateY(${y * 0.3}px)`;
    if (coverGrid) coverGrid.style.transform = `translateY(${y * 0.15}px)`;
  }

  // ── SCROLL LISTENER ────────────────────────────────
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        parallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── COVER ANIMATION ON LOAD ────────────────────────
  window.addEventListener('load', () => {
    const coverContent = document.querySelector('.cover-content');
    if (coverContent) {
      coverContent.style.opacity = '0';
      coverContent.style.transform = 'translateY(30px)';
      setTimeout(() => {
        coverContent.style.transition = 'opacity 1.2s cubic-bezier(0.19,1,0.22,1), transform 1.2s cubic-bezier(0.19,1,0.22,1)';
        coverContent.style.opacity = '1';
        coverContent.style.transform = 'none';
      }, 200);
    }
  });

  // ── STAGGER CHILDREN IN GRID ───────────────────────
  document.querySelectorAll(
    '.philosophy-grid, .sizes-grid, .colors-grid, .variants-grid, .incorrect-grid, .mockups-grid'
  ).forEach((grid) => {
    const children = grid.querySelectorAll('[class*="reveal-"]');
    children.forEach((child, i) => {
      if (!child.style.getPropertyValue('--delay')) {
        child.style.setProperty('--delay', (i * 0.08) + 's');
      }
    });
  });

  // ── COLOR SWATCH COPY ──────────────────────────────
  document.querySelectorAll('.color-value strong').forEach((el) => {
    el.style.cursor = 'pointer';
    el.title = 'Click para copiar';

    el.addEventListener('click', () => {
      const text = el.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        const orig = el.textContent;
        el.textContent = '¡Copiado!';
        el.style.color = '#8B4560';
        setTimeout(() => {
          el.textContent = orig;
          el.style.color = '';
        }, 1200);
      }).catch(() => {});
    });
  });

  // ── SECTION NAVIGATION (scroll · keyboard · touch) ─
  const sectionIds  = Array.from(sections).map((s) => s.id);
  // navPoints adds an extra stop inside #tipografia so it needs 2 scrolls
  const navPoints   = sectionIds.reduce((acc, id) => {
    acc.push(id);
    if (id === 'tipografia') acc.push('tipografia-p2');
    return acc;
  }, []);
  let currentIdx    = 0;
  let isNavigating  = false;
  const NAV_COOLDOWN = 900; // ms — match smooth-scroll duration

  function goToSection(idx) {
    idx = Math.min(Math.max(idx, 0), navPoints.length - 1);
    if (idx === currentIdx && isNavigating) return;
    isNavigating = true;
    currentIdx   = idx;
    document.getElementById(navPoints[idx])
      .scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Release guard when scroll animation ends (fallback: NAV_COOLDOWN)
    let released = false;
    const release = () => { if (!released) { released = true; isNavigating = false; } };
    window.addEventListener('scrollend', release, { once: true });
    setTimeout(release, NAV_COOLDOWN);
  }

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goToSection(currentIdx + 1);
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goToSection(currentIdx - 1);
    }
  });

  // Mouse wheel — one section per scroll event
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isNavigating) return;
    goToSection(currentIdx + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  // Touch swipe
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (isNavigating) return;
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 50) return;
    goToSection(currentIdx + (delta > 0 ? 1 : -1));
  }, { passive: true });

  // Keep currentIdx in sync with visible section
  const keyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = navPoints.indexOf(entry.target.id);
          if (idx !== -1) currentIdx = idx;
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((s) => keyObserver.observe(s));

  // ── NAV ARROWS (inicio / final) ────────────────────
  document.getElementById('navArrowUp')
    .addEventListener('click', () => goToSection(0));
  document.getElementById('navArrowDown')
    .addEventListener('click', () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

})();
