# Kadhiravan K | Full Stack Portfolio

A full-stack personal portfolio website showcasing web applications, technical skills, certifications, and practical engineering projects — presented as an *Omniscient Reader's Viewpoint*-inspired **"Star Stream"**: numbered scenarios, glowing system windows, a live HUD, and a cream "webnovel page" light mode.

---

## 🔗 Live Demo & Repository

- **Live URL:** [https://personal-portfolio-i2nl.onrender.com/](https://personal-portfolio-i2nl.onrender.com/)
- **GitHub Repository:** [https://github.com/Kadhiravan06/Personal_Portfolio](https://github.com/Kadhiravan06/Personal_Portfolio)

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, Modern CSS3 (custom properties, grid/flexbox, fluid type, dark/light themes), Vanilla JavaScript (ES modules, `fetch` API), Canvas 2D starfield, IntersectionObserver
- **Animation:** anime.js 4.5 (vendored ESM build, MIT licensed) — no CDN and no build step
- **Backend:** Node.js & Express.js REST API with CORS support and input validation
- **Database:** MongoDB (via Mongoose on MongoDB Atlas) with local SQLite fallback (`node:sqlite`)
- **Hosting:** Render (Web Service) & MongoDB Atlas (Cloud Database)

---

## ✨ Key Features

- **ORV "Star Stream" Interface:** Scenario-numbered sections, glowing system-window panels, a fixed HUD with live scroll progress, a parallax starfield, and a once-per-session intro overlay.
- **anime.js Choreography:** Staggered scroll reveals, signal-wipe navigation, rarity-coded project cards, probability bars that charge on view, and a stamped contact confirmation — all transform/opacity based and disabled under `prefers-reduced-motion`.
- **Dynamic API Architecture:** Projects, skills, and certifications are stored in the database and loaded asynchronously through REST API endpoints (`/api/projects`, `/api/skills`, `/api/certifications`).
- **Interactive Contact Form:** Validates user inputs client-side and server-side, storing messages directly into the database.
- **Dual Theme:** Cosmic dark mode and a cream "webnovel page" light mode, persisted with `localStorage`.
- **Responsive & Accessible:** Verified at 360/768/1440 px, with keyboard focus rings, a skip link, readable no-JS fallback, and reduced-motion support.
- **Data Seeding:** Seed script (`npm run seed`) loads records from structured JSON files into the database.

---

## 📁 Project Structure

```
.
├── server.js            Express entry point and API routes
├── seed.js              Seeds MongoDB/SQLite from data/*.json
├── test.js              API + static UI assertions
├── data/                Projects, skills, and certifications content
├── src/db.js            Mongoose / node:sqlite data layer
└── public/
    ├── index.html       Single-page scenario layout
    ├── css/style.css    Star Stream theme (dark + light)
    ├── js/app.js        API rendering, theme, form, scrollspy
    ├── js/animations.js anime.js choreography + starfield
    └── vendor/          Vendored anime.js 4.5 + MIT license
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/projects` | Returns all projects ordered by sort sequence |
| `GET` | `/api/skills` | Returns technical skills grouped by category |
| `GET` | `/api/certifications` | Returns all certificates, hackathons, and workshops |
| `POST` | `/api/contact` | Validates and saves contact form submissions |
| `GET` | `/api/health` | Service health status check |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 24+ (uses the built-in `node:sqlite` module)
- npm

### 1. Clone repository
```bash
git clone https://github.com/Kadhiravan06/Personal_Portfolio.git
cd Personal_Portfolio
```

### 2. Install dependencies
```bash
npm install
```
There is no frontend build step — the site runs directly from `public/`.

### 3. Configure environment
Create a `.env` file based on `.env.example`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
```
*(If `MONGODB_URI` is omitted, the application automatically uses a local SQLite database for zero-config offline execution).*

### 4. Seed the database & run
```bash
npm run seed
npm start
```
Open `http://localhost:3000` in your browser.

### 5. Run tests
```bash
npm test
```
The suite boots the app against a temporary SQLite database and verifies the REST endpoints plus the static UI contract (test anchors, vendored anime.js, markup hooks, and stylesheet themes).

---

## 👤 Author

**Kadhiravan K**
- B.E. Computer Science and Engineering, Rajalakshmi Institute of Technology, Chennai
- Email: [kadhiravankalamegam2006@gmail.com](mailto:kadhiravankalamegam2006@gmail.com)
- GitHub: [@Kadhiravan06](https://github.com/Kadhiravan06)
- LinkedIn: [in/kadhiravan-k-31b79632b](https://www.linkedin.com/in/kadhiravan-k-31b79632b/)
