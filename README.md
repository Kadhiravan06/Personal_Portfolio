# Kadhiravan K | Full Stack Portfolio

A full-stack personal portfolio website showcasing web applications, technical skills, certifications, and practical engineering projects.

---

## 🔗 Live Demo & Repository

- **Live URL:** [https://personal-portfolio-i2nl.onrender.com/](https://personal-portfolio-i2nl.onrender.com/)
- **GitHub Repository:** [https://github.com/Kadhiravan06/Personal_Portfolio](https://github.com/Kadhiravan06/Personal_Portfolio)

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, Modern CSS3 (Dark/Light mode via CSS variables, flexbox, grid, mobile-first responsive), Vanilla JavaScript (ES6+ `fetch` API)
- **Backend:** Node.js & Express.js REST API with CORS support and input validation
- **Database:** MongoDB (via Mongoose on MongoDB Atlas) with local SQLite fallback (`node:sqlite`)
- **Hosting:** Render (Web Service) & MongoDB Atlas (Cloud Database)

---

## ✨ Key Features

- **Dynamic API Architecture:** Projects, skills, and certifications are stored in the database and loaded asynchronously through REST API endpoints (`/api/projects`, `/api/skills`, `/api/certifications`).
- **Interactive Contact Form:** Validates user inputs client-side and server-side, storing messages directly into the database.
- **Theme Switcher:** Seamless Dark and Light theme toggle with `localStorage` persistence.
- **Mobile-First Responsive Design:** Optimized layout for phones, tablets, and desktop displays.
- **Data Seeding:** Seed script (`npm run seed`) loads records from structured JSON files into the database.

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
- Node.js (v18+)
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

---

## 👤 Author

**Kadhiravan K**
- B.E. Computer Science and Engineering, Rajalakshmi Institute of Technology, Chennai
- Email: [kadhiravankalamegam2006@gmail.com](mailto:kadhiravankalamegam2006@gmail.com)
- GitHub: [@Kadhiravan06](https://github.com/Kadhiravan06)
- LinkedIn: [in/kadhiravan-k-31b79632b](https://www.linkedin.com/in/kadhiravan-k-31b79632b/)
