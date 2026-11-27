import { animate, stagger, createTimeline } from '../vendor/anime.esm.min.js';

const INTRO_KEY = 'orv-intro-seen';
const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reduceQuery.matches;

const selectAll = (selector) => Array.from(document.querySelectorAll(selector));

const session = {
  get(key) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      /* storage may be unavailable */
    }
  },
};

const modulo = (value, max) => ((value % max) + max) % max;

const clearMotionStyles = (targets) => {
  const elements = typeof targets === 'string' ? selectAll(targets) : targets;
  elements.forEach((element) => {
    element.style.opacity = '';
    element.style.transform = '';
  });
};

let wipeBusy = false;

function playWipe(onCovered) {
  const wipe = document.getElementById('signal-wipe');
  if (!wipe || wipeBusy || reduced()) {
    onCovered();
    return;
  }

  wipeBusy = true;
  animate(wipe, {
    scaleX: [0, 1],
    duration: 260,
    ease: 'inQuad',
    onComplete: () => {
      onCovered();
      animate(wipe, {
        scaleX: [1, 0],
        duration: 420,
        delay: 120,
        ease: 'outQuad',
        onComplete: () => {
          wipeBusy = false;
        },
      });
    },
  });
}

function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const still = reduced();
  let stars = [];
  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;
  let rafId = 0;

  const buildStars = () => {
    const count = window.innerWidth < 700 ? 60 : 120;
    stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      depth: 0.25 + Math.random() * 0.75,
      radius: 0.4 + Math.random() * 1.3,
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    const scroll = window.scrollY || 0;

    for (const star of stars) {
      const x = modulo(star.x * width + pointerX * 12 * star.depth, width);
      const y = modulo(star.y * height + pointerY * 9 * star.depth + scroll * 0.05 * star.depth, height);
      const twinkle = still ? 0.8 : 0.55 + Math.sin(time / 1100 + star.phase) * 0.3;

      ctx.globalAlpha = Math.max(twinkle * star.depth, 0.08);
      ctx.fillStyle = '#cfe8ff';
      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (still) draw(0);
  };

  const loop = (time) => {
    draw(time);
    rafId = requestAnimationFrame(loop);
  };

  const start = () => {
    if (still || rafId) return;
    rafId = requestAnimationFrame(loop);
  };

  const stop = () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (still) return;

  window.addEventListener('pointermove', (event) => {
    pointerX = (event.clientX / width - 0.5) * 2;
    pointerY = (event.clientY / height - 0.5) * 2;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  start();
}

function initIntro(onDone) {
  const overlay = document.getElementById('intro-overlay');
  const skip = document.getElementById('intro-skip');

  if (!overlay || reduced() || session.get(INTRO_KEY) === '1') {
    onDone();
    return;
  }

  let dismissed = false;
  let timer = 0;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    window.clearTimeout(timer);
    session.set(INTRO_KEY, '1');
    document.removeEventListener('keydown', onKey);
    skip?.removeEventListener('click', dismiss);
    onDone();

    animate(overlay, {
      opacity: [1, 0],
      duration: 450,
      ease: 'inQuad',
      onComplete: () => {
        overlay.classList.remove('is-open');
        overlay.style.opacity = '';
        document.documentElement.style.overflow = '';
        playWipe(() => {});
      },
    });
  };

  const onKey = (event) => {
    if (event.key === 'Enter' || event.key === 'Escape') dismiss();
  };

  overlay.classList.add('is-open');
  document.documentElement.style.overflow = 'hidden';

  createTimeline({ defaults: { ease: 'outExpo' } })
    .add('.intro-window', { opacity: [0, 1], y: [20, 0], duration: 700 })
    .add('#intro-skip', { opacity: [0, 1], duration: 400 }, 250);

  skip?.addEventListener('click', dismiss);
  document.addEventListener('keydown', onKey);
  timer = window.setTimeout(dismiss, 2400);
}

let revealsReady = false;

function initReveals() {
  revealsReady = true;
  const items = selectAll('[data-reveal]:not(.is-revealed)');
  if (!items.length) return;

  if (reduced() || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-revealed'));
    return;
  }

  const show = (targets) => {
    animate(targets, {
      opacity: [0, 1],
      y: [22, 0],
      duration: 650,
      delay: stagger(70),
      ease: 'outExpo',
      onComplete: () => clearMotionStyles(targets),
    });
    targets.forEach((target) => target.classList.add('is-revealed'));
  };

  const observer = new IntersectionObserver((entries) => {
    const targets = entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target);

    targets.forEach((target) => observer.unobserve(target));
    if (targets.length) show(targets);
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  items.forEach((item) => observer.observe(item));

  // Safety: reveal anything still visible above the fold if the observer stalls.
  window.setTimeout(() => {
    items.forEach((item) => {
      if (!item.classList.contains('is-revealed') && item.getBoundingClientRect().top < window.innerHeight) {
        observer.unobserve(item);
        item.classList.add('is-revealed');
      }
    });
  }, 3000);
}

function initHud() {
  const fill = document.getElementById('probability-fill');
  if (!fill) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    fill.style.transform = `scaleX(${progress})`;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener('resize', update, { passive: true });
  update();
}

function initNavWipe() {
  document.addEventListener('click', (event) => {
    if (reduced()) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.classList.contains('skip-link')) return;

    const hash = link.getAttribute('href');
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (!target) return;

    event.preventDefault();
    playWipe(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  });
}

function initRenderHooks() {
  document.addEventListener('portfolio:rendered', (event) => {
    const type = event.detail?.type;

    if (type === 'skills') {
      const chips = selectAll('.skill-chip');
      if (!reduced()) {
        animate(chips, {
          opacity: [0, 1],
          y: [12, 0],
          duration: 480,
          delay: stagger(20),
          ease: 'outQuad',
          onComplete: () => clearMotionStyles(chips),
        });
      }
      chargeSkills(chips);
    }

    if (type === 'projects' && !reduced()) {
      const cards = selectAll('.project-card');
      animate(cards, {
        opacity: [0, 1],
        y: [20, 0],
        duration: 520,
        delay: stagger(50),
        ease: 'outQuad',
        onComplete: () => clearMotionStyles(cards),
      });
    }

    if (type === 'certifications' && !reduced()) {
      const cards = selectAll('.cert-card');
      animate(cards, {
        opacity: [0, 1],
        y: [16, 0],
        duration: 460,
        delay: stagger(40),
        ease: 'outQuad',
        onComplete: () => clearMotionStyles(cards),
      });
    }
  });
}

function chargeSkills(chips) {
  if (!chips.length) return;

  const charge = () => {
    chips.forEach((chip, index) => {
      window.setTimeout(() => chip.classList.add('is-charged'), reduced() ? 0 : index * 35);
    });
  };

  const container = document.getElementById('skills-container');
  if (reduced() || !container || !('IntersectionObserver' in window)) {
    charge();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    charge();
  }, { threshold: 0.15 });

  observer.observe(container);
}

function initContactStamp() {
  document.addEventListener('portfolio:contact-success', () => {
    const stamp = document.getElementById('scenario-stamp');
    if (!stamp) return;

    if (reduced()) {
      stamp.style.opacity = '1';
      return;
    }

    animate(stamp, {
      opacity: [0, 1],
      scale: [0.7, 1],
      rotate: [-8, -3],
      duration: 520,
      ease: 'outBack',
    });
  });
}

function boot() {
  if (!reduced()) {
    document.documentElement.classList.add('js-motion');

    // If the reveal module never starts, never leave the page hidden.
    window.setTimeout(() => {
      if (!revealsReady) {
        selectAll('[data-reveal]').forEach((element) => element.classList.add('is-revealed'));
      }
    }, 4000);
  }

  initStarfield();
  initHud();
  initNavWipe();
  initRenderHooks();
  initContactStamp();
  initIntro(initReveals);
}

boot();
