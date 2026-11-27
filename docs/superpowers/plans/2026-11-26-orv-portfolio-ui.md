# ORV Portfolio UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio front end as an ORV-inspired "Star Stream" experience with fluid anime.js motion.

**Architecture:** Static one-page site served by Express. `index.html` is restructured into scenarios; `style.css` is rewritten around dark/light tokens; `app.js` keeps API fetching and adds render hooks; a new `animations.js` ES module owns anime.js choreography, the starfield and the intro. anime.js is vendored, so production has no CDN dependency.

**Tech Stack:** Vanilla HTML/CSS/JS, anime.js 4.5.0 (vendored ESM), Express (unchanged), Node test script.

**Spec:** `docs/superpowers/specs/2026-11-26-orv-portfolio-ui-design.md`

## Global Constraints

- Preserve `View my projects` text, CSS custom property `--accent-primary`, and `loadProjects` in `app.js` (test anchors).
- Preserve IDs: `skills-container`, `projects-container`, `certifications-container`, `contact-form`, `form-alert`, `submit-btn`, `theme-toggle`, `mobile-toggle`, `nav-menu`.
- No framework, build step, or new runtime dependency besides `public/vendor/anime.esm.min.js` (MIT) and its license.
- Content visible without JS. JS may hide `[data-reveal]` only after adding `html.js-motion`, and must always reveal it (IntersectionObserver plus a safety timeout).
- Respect `prefers-reduced-motion: reduce` (no intro, no parallax, instant reveals).
- No copyrighted art or long quotes. CSS/SVG/canvas + original copy only.
- Dark is the default theme; light is the "webnovel page". Same `portfolio-theme` localStorage key.
- Target widths 360 / 768 / 1440; body text AA contrast.

## Review Focus

- **No JS / failed module load:** every section and all real text must still render and be readable (no animation-only visibility).
- **Reduced motion:** intro skipped, starfield static/absent, nav scroll not delayed, reveals instant.
- **360px viewport:** angled cuts, oversized display type and fixed HUD must not cause horizontal scroll or cover content.
- **Light theme:** every panel, chip, form field and footer must be readable, not just the hero.
- **Late API data:** projects/skills/certs fetched after load must appear and animate without errors.

Each is pinned by a static assertion in `test.js` and a Playwright check in the owning task.

---

### Task 1: Vendor anime.js

**Files:**
- Create: `public/vendor/anime.esm.min.js`, `public/vendor/anime.LICENSE`
- Test: `test.js`

**Interfaces:**
- Produces: `public/vendor/anime.esm.min.js`, importable as `../vendor/anime.esm.min.js` exporting `animate`, `stagger`, `createTimeline`, `utils`.

- [ ] **Step 1: Add failing vendor assertions to `test.js`**

After the CSS/JS fetch checks, add:

```js
const animeRes = await fetch(`${baseUrl}/vendor/anime.esm.min.js`);
const animeText = await animeRes.text();
assert.strictEqual(animeRes.status, 200);
assert(animeText.includes('Anime.js'));
assert(animeText.length > 10000);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: assertion failure because `/vendor/anime.esm.min.js` returns 404.

- [ ] **Step 3: Extract the vendored files**

```bash
npm pack animejs@4.5.0
tar -xzf animejs-4.5.0.tgz package/dist/bundles/anime.esm.min.js package/LICENSE
mkdir -p public/vendor
cp package/dist/bundles/anime.esm.min.js public/vendor/anime.esm.min.js
cp package/LICENSE public/vendor/anime.LICENSE
rm -rf package animejs-4.5.0.tgz
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add public/vendor test.js
git commit -m "Vendor anime.js 4.5 for the UI rebuild"
```

---

### Task 2: Restructure the page into scenarios

**Files:**
- Modify: `public/index.html` (full rewrite)
- Test: `test.js`

**Interfaces:**
- Produces DOM hooks used by later tasks: `#starfield` (canvas), `#intro-overlay`, `#intro-skip`, `#hud`, `#hud-section`, `#probability-fill`, `#signal-wipe`, `.skip-link`, `#scenario-stamp`, `[data-scenario]` sections, `[data-reveal]` children, `.scenario-label`.

- [ ] **Step 1: Add failing markup assertions to `test.js`**

```js
assert(htmlText.includes('id="starfield"'));
assert(htmlText.includes('id="intro-overlay"'));
assert(htmlText.includes('SCENARIO 00'));
assert(htmlText.includes('class="skip-link"'));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: assertion failure on `id="starfield"`.

- [ ] **Step 3: Rewrite `public/index.html`**

Keep all current content, links, SVGs, IDs and the resume download. Apply:
- head: Cormorant Garamond / IBM Plex Sans / IBM Plex Mono font link; existing meta.
- body start: skip link, `<canvas id="starfield" aria-hidden="true">`, intro overlay with `■ THE STAR STREAM IS OPEN` and a skip button, HUD (`STAR STREAM // ONLINE`, `#hud-section`, `PROBABILITY` + `#probability-fill`), `#signal-wipe`.
- hero: `data-scenario="home"`, scenario label `■ SCENARIO 00 — THE READER`, keep `View my projects`, resume button, socials.
- each section: `class="section scenario"`, `data-scenario="<id>"`, scenario label `■ SCENARIO 0N — NAME`, `[data-reveal]` on headers/cards/blocks.
- contact: `■ FINAL SCENARIO — MESSAGE THE CONSTELLATION`, hidden `#scenario-stamp` (`SCENARIO COMPLETE`).
- footer restyled copy, same links.
- end of body: `<script src="js/app.js"></script>` then `<script type="module" src="js/animations.js"></script>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: all tests pass (4 projects assertions unchanged).

- [ ] **Step 5: Commit**

```bash
git add public/index.html test.js
git commit -m "Restructure portfolio markup into ORV scenarios"
```

---

### Task 3: Rewrite the stylesheet

**Files:**
- Modify: `public/css/style.css` (full rewrite)
- Test: `test.js`

**Interfaces:**
- Produces theme tokens (`--bg-primary`, `--bg-panel`, `--text-primary`, `--accent-primary`, `--accent-gold`, `--border-glow`, spacing/font tokens), `.scenario-window`, `.scenario-label`, `.hud`, `.starfield`, `.rarity-*`, `.probability-bar` styles, light theme via `[data-theme="light"]`.

- [ ] **Step 1: Add failing stylesheet assertions**

```js
assert(cssText.includes('[data-theme="light"]'));
assert(cssText.includes('prefers-reduced-motion'));
assert(cssText.includes('--accent-gold'));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: failure on `--accent-gold`.

- [ ] **Step 3: Rewrite `public/css/style.css`**

Dark tokens first, then `[data-theme="light"]` overrides. Build: reset/base, skip link, HUD, intro overlay, hero, scenario windows with corner brackets, about stats, skills probability bars, project cards (rarity edges, `::after` speed-line sweep on hover), experience timeline, education, certification filters/cards, contact form and stamp, footer, signal wipe. Include `.js-motion [data-reveal]:not(.is-revealed) { opacity: 0 }` so reveals do not flash (JS adds `.js-motion` and always reveals via observer + timeout). Include `@media (max-width: 768px)` and `(max-width: 420px)`, `:focus-visible`, and a `prefers-reduced-motion` block. Keep `--accent-primary` defined.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add public/css/style.css test.js
git commit -m "Rebuild stylesheet with ORV Star Stream theme"
```

---

### Task 4: Adapt data rendering to the new markup

**Files:**
- Modify: `public/js/app.js`
- Test: `test.js`

**Interfaces:**
- Produces: `document.dispatchEvent(new CustomEvent('portfolio:rendered', { detail: { type: 'skills' | 'projects' | 'certifications' } }))` after each render, and `portfolio:contact-success` after a successful form POST. Existing function names stay.

- [ ] **Step 1: Add failing hook assertions**

```js
assert(jsText.includes('portfolio:rendered'));
assert(jsText.includes('portfolio:contact-success'));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: failure on `portfolio:rendered`.

- [ ] **Step 3: Update renderers in `public/js/app.js`**

- keep `loadSkills` / `loadProjects` / `loadCertifications` / `initContactForm` / `initTheme` / `initMobileNav` / `initScrollSpy`.
- update generated markup: `.skill-chip` gains a `.probability-bar` with level-derived fill; project card gets `rarity-${['common','rare','epic','legendary'][(p.id - 1) % 4]}` and `data-reveal`; cert cards get `data-reveal`.
- after each successful render, dispatch `portfolio:rendered` with the matching `detail.type`.
- after successful contact POST, dispatch `portfolio:contact-success`.
- replace the hard-coded scroll listener in `initScrollSpy` with an IntersectionObserver that sets `.active` on nav links and writes the current label to `#hud-section`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add public/js/app.js test.js
git commit -m "Hook portfolio rendering into the new scenario UI"
```

---

### Task 5: Add anime.js choreography and starfield

**Files:**
- Create: `public/js/animations.js`
- Test: `test.js`

**Interfaces:**
- Consumes: `../vendor/anime.esm.min.js`, DOM hooks from Task 2, `portfolio:rendered` / `portfolio:contact-success` events from Task 4.
- Produces: module that self-initialises on DOMContentLoaded, adds `.js-motion` to `<html>`, and exposes no globals.

- [ ] **Step 1: Add failing animation module assertions**

```js
const animRes = await fetch(`${baseUrl}/js/animations.js`);
const animText = await animRes.text();
assert.strictEqual(animRes.status, 200);
assert(animText.includes('prefers-reduced-motion'));
assert(animText.includes('createTimeline'));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: 404 for `/js/animations.js`.

- [ ] **Step 3: Implement `public/js/animations.js`**

```js
import { animate, stagger, createTimeline, utils } from '../vendor/anime.esm.min.js';
```

- `const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;`
- starfield: canvas 2D, ~120 stars (60 on mobile), DPR capped at 2, parallax from scrollY and pointer, `requestAnimationFrame` loop paused on `visibilitychange`; if `reduced`, draw one static frame.
- intro: skip if `sessionStorage.getItem('orv-intro-seen')` or reduced; timeline fades overlay out after 2.2s; skip button/Enter/Escape dismisses.
- hero: timeline staggering `.hero-title` lines, badge, lead, buttons; diagonal scan element sweep.
- reveals: add `html.js-motion` unless reduced; IntersectionObserver on `[data-reveal]`, `animate(el, { opacity: [0, 1], y: [24, 0], duration: 650, delay: stagger(60) })`, add `.is-revealed`, unobserve after; a 3s safety timeout reveals anything still pending.
- nav wipe: delegated click on `a[href^="#"]`; animate `#signal-wipe` in/out (~350ms) then `scrollIntoView`; anchor default kept under reduced motion.
- HUD: scroll progress → `scaleX` on `#probability-fill` via rAF.
- `portfolio:rendered`: animate newly added `.skill-chip`, `.project-card`, `.cert-card` with stagger.
- `portfolio:contact-success`: show `#scenario-stamp` with scale/rotate timeline.
- guard every animation on `reduced` (set final styles or skip).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Playwright smoke check**

Start `npm start`, open `http://127.0.0.1:3000` with Playwright MCP. Assert: no console errors, intro appears then dismisses, sections reveal on scroll, nav wipe scrolls, HUD updates. Take a 1440px screenshot.

- [ ] **Step 6: Commit**

```bash
git add public/js/animations.js test.js
git commit -m "Add anime.js Star Stream choreography and starfield"
```

---

### Task 6: Micro-interactions and final polish

**Files:**
- Modify: `public/js/animations.js`, `public/css/style.css`, `public/js/app.js` (only if hooks are missing)

- [ ] **Step 1: Add card/button motion**

Project card hover: border glow + speed-line sweep; button pointerdown/press skew with anime; probability bars fill once via IntersectionObserver; certification filter re-render uses the `portfolio:rendered` stagger.

- [ ] **Step 2: Verify with Playwright**

Check hover states, certification filters, contact success stamp (use a local SQLite run), light theme. Screenshots at 360, 768, 1440.

- [ ] **Step 3: Commit**

```bash
git add public/js/animations.js public/css/style.css public/js/app.js
git commit -m "Polish ORV micro-interactions"
```

---

### Task 7: Accessibility and final verification

**Files:**
- Modify: `public/css/style.css`, `public/index.html`, `test.js` if fixes are needed.

- [ ] **Step 1: Reduced motion pass**

Playwright with `reducedMotion: 'reduce'`: no intro, no parallax loop, sections visible immediately, nav scroll works.

- [ ] **Step 2: Keyboard, no-JS and responsive pass**

Tab through nav, theme, form; focus rings visible. Disable JS and reload: all sections, projects/skills (static fallback is API-dependent — at minimum all static text) remain readable. Check 360/768/1440 for horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`).

- [ ] **Step 3: Full test run**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "Fix accessibility and responsive issues in ORV UI"
```
