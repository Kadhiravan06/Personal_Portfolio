# ORV Portfolio UI — Design

**Date:** 2026-11-26
**Status:** Approved

## Intent

Rebuild the portfolio front end as an *Omniscient Reader's Viewpoint*-inspired reading experience: a cosmic "Star Stream" with scenario framing, system windows and fluid anime.js motion. The fiction is the wrapper; the resume content stays real and readable.

## Goals

- Full visual rebuild of the existing single page (8 sections, same content and order).
- Persona-free ORV aesthetic: deep navy/black, starfield, ice-blue glow, white serif display type, mono metadata, `■` markers, corner brackets.
- Fluid scroll/action animations with anime.js 4.5, driven by transforms and opacity only.
- Light mode reads as a webnovel page: cream paper, ink text, blue accent.
- Preserve the Express API, contact form, theme persistence and mobile navigation.
- Keep the page usable without JS and with `prefers-reduced-motion`.

## Non-goals

- No backend/API changes, new routes, or new content pages.
- No sound, WebGL/3D, or heavy video assets.
- No copied ORV artwork or long quotations; visuals are CSS/SVG/canvas and copy is original.
- No framework or build step. Vanilla HTML/CSS/JS only.

## Approach (chosen: B — "Constellation Stream")

1. Intro overlay: `■ THE STAR STREAM IS OPEN`, skippable, auto-dismiss ~2.2s, once per session, skipped for reduced motion.
2. Fixed HUD: `STAR STREAM // ONLINE`, current scenario name, scroll progress labelled `PROBABILITY`.
3. Hero (Scenario 00 — The Reader): starfield canvas with parallax, oversized serif name, system-window tagline, availability tag, CTAs, socials.
4. Scenarios 01–06: About, Skills, Projects, Experience, Education, Certifications. Each has `■ SCENARIO 0N — NAME`, a bordered window with corner brackets, and mono metadata. Skills show probability bars; projects are "hidden scenario" cards with rarity edges; certifications are "Records of the Star Stream".
5. Contact (Final Scenario): "Send a message to the Constellation"; success shows a `SCENARIO COMPLETE` stamp.

Alternatives considered: pure CSS-only reskin (rejected: not a rebuild, no interaction), and a full game-shell with HUD transitions (folded into B where it stays performant).

## Visual system

- Dark: base `#05070f`, panel `#0b1020`, accent `#7dd3fc` / `#38bdf8`, text `#e8f1ff`, gold `#f5c76a`.
- Light: paper `#f6f1e7`, ink `#141414`, same blue accent.
- Type: Cormorant Garamond (display), IBM Plex Sans (body), IBM Plex Mono (system labels). Google Fonts with system fallbacks.
- Motifs: `■` markers, 1px glowing borders, corner brackets, scanlines, angled cuts, halftone via gradients.

## Motion system (anime.js 4.5, vendored ESM)

- Starfield: ~120 canvas stars, scroll/pointer parallax, DPR-capped, paused when the tab is hidden; static under reduced motion.
- Intro → hero timeline: line/letter stagger, scan sweep.
- Sections reveal through IntersectionObserver: border draw, label tick, content stagger.
- Nav click: 350ms diagonal signal wipe, then smooth scroll.
- Card hover: border glow + speed-line sweep; buttons skew/press; probability bars fill once.
- Contact success stamp.
- Everything animates transform/opacity, content is visible without JS, reduced motion swaps to instant/short fades.

## Constraints

- Keep `test.js` anchors valid: `View my projects`, `--accent-primary`, `loadProjects`.
- Keep existing element IDs used by JS (`skills-container`, `projects-container`, `certifications-container`, `contact-form`, `form-alert`, `submit-btn`, `theme-toggle`, `mobile-toggle`, `nav-menu`).
- No secrets, no new dependencies beyond vendored anime.js (MIT).
- Target 360 / 768 / 1440 widths; AA contrast for body text.

## Verification

`npm test`; local server; Playwright screenshots of dark, light and mobile; keyboard/focus pass; reduced-motion emulation; console must stay clean; Atlas data still renders.
