/* ============================================================
   KINCHOR FOUNDATION — SHARED SITE SCRIPT
   Loaded on every page. Each feature checks for its elements
   before running, so it's safe to include everywhere.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('page-enter');

  /* ---------- MOBILE NAV ---------- */
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  if (header && hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = header.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }

  /* ---------- PAGE TRANSITIONS ----------
     Internal links fade the page out, then navigate, so moving
     between pages feels like one continuous site instead of a
     hard reload. */
  if (!reduceMotion) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank') return;
      if (link.hostname && link.hostname !== location.hostname) return;
      link.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.add('page-exit');
        setTimeout(() => { window.location.href = href; }, 260);
      });
    });
  }

  /* ---------- SCROLL PROGRESS BAR ---------- */
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      progress.style.width = scrolled + '%';
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- SCROLL REVEAL (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .stagger');
  if (revealEls.length) {
    if (reduceMotion) {
      revealEls.forEach(el => el.classList.add('in-view'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ---------- HERO PARALLAX ---------- */
  const blob = document.querySelector('.hero-blob');
  const ball = document.querySelector('.ball');
  if ((blob || ball) && !reduceMotion) {
    document.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (blob) blob.style.transform = `translateY(${y * 0.15}px)`;
      if (ball) ball.style.transform = `translateY(${y * 0.25}px)`;
    }, { passive: true });
  }

  /* ---------- ANIMATED STAT COUNTERS (trigger on scroll into view) ---------- */
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const run = () => {
      const duration = 1000;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(p * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { run(); io.unobserve(entry.target); } });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------- GALLERY LIGHTBOX (with prev/next) ---------- */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const photos = Array.from(document.querySelectorAll('.photo'));
    const lbImg = document.getElementById('lightbox-img');
    const lbCap = document.getElementById('lightbox-cap');
    let idx = 0;
    const show = (i) => {
      idx = (i + photos.length) % photos.length;
      const btn = photos[idx];
      lbImg.src = btn.querySelector('img').src;
      lbImg.alt = btn.querySelector('img').alt;
      if (lbCap) lbCap.textContent = btn.querySelector('.cap')?.textContent || '';
    };
    photos.forEach((btn, i) => btn.addEventListener('click', () => { show(i); lightbox.classList.add('open'); }));
    const close = () => lightbox.classList.remove('open');
    document.getElementById('lightbox-close')?.addEventListener('click', close);
    document.getElementById('lightbox-prev')?.addEventListener('click', () => show(idx - 1));
    document.getElementById('lightbox-next')?.addEventListener('click', () => show(idx + 1));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }

  /* ---------- INTERACTIVE STEP CARDS (volunteer page) ---------- */
  document.querySelectorAll('.step-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('open'));
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('open'); } });
  });

  /* ---------- COPY TO CLIPBOARD (contact page) ---------- */
  const toast = document.querySelector('.toast');
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        if (toast) {
          toast.textContent = 'Copied ' + text;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 1800);
        }
      } catch (err) {
        console.error('Copy failed', err);
      }
    });
  });

  /* ---------- BACK TO TOP ---------- */
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    document.addEventListener('scroll', () => {
      toTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }
});
