# Personal Portfolio Website - Kadhiravan K

A full-stack personal portfolio website built as Task 1 of the Full Stack Development Internship at **Thiranex EduTech LLP** (12 Nov 2026 – 11 Dec 2026).

---

## 🔗 Project Links

- **Live URL:** [https://personal-portfolio-i2nl.onrender.com/](https://personal-portfolio-i2nl.onrender.com/)
- **GitHub Repository:** [https://github.com/Kadhiravan06/Personal_Portfolio](https://github.com/Kadhiravan06/Personal_Portfolio)

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** HTML5, Modern CSS3 (Dark/Light mode via CSS variables, flexbox, grid, mobile-first responsive), Vanilla JavaScript (ES6+ `fetch` API).
- **Backend:** Node.js & Express.js REST API with CORS support and input validation.
- **Database:** MongoDB (via Mongoose for MongoDB Atlas in production) with automatic local SQLite fallback (`node:sqlite`) for zero-setup offline development.
- **Testing:** Automated integration test suite (`test.js`) verifying all API routes and database transactions.

---

## 🔄 How the Frontend, Backend, and Database Connect

```
┌────────────────────────────────────────────────────────┐
│                        BROWSER                         │
│   (HTML5 + CSS3 + Vanilla JavaScript + Fetch API)      │
└──────────────────────────┬─────────────────────────────┘
                           │
             HTTP Requests │ JSON Responses
             (GET / POST)  │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   EXPRESS.JS BACKEND                   │
│                    (REST API Server)                   │
│                                                        │
│  • GET  /api/projects       • GET  /api/certifications │
│  • GET  /api/skills         • POST /api/contact        │
└──────────────────────────┬─────────────────────────────┘
                           │
                  Queries  │ Result Sets
              (Mongoose /  │
               SQLite)     ▼
┌────────────────────────────────────────────────────────┐
│                    DATABASE TIER                       │
│                                                        │
│  Production: MongoDB Atlas (via MONGODB_URI)           │
│  Development: SQLite (local portfolio.db)              │
│                                                        │
│  Collections/Tables:                                   │
│  • projects        • certifications                    │
│  • skills          • messages                          │
└────────────────────────────────────────────────────────┘
```

### The Request-Response Lifecycle (Explain this in your review):

1. **Page Load:**
   The browser requests `http://localhost:3000/`. Express serves `public/index.html`, along with `public/css/style.css` and `public/js/app.js`.

2. **Fetching Data Dynamically:**
   Instead of hardcoding projects, skills, or certifications inside the HTML, `public/js/app.js` executes asynchronous `fetch()` requests:
   - `fetch('/api/projects')` retrieves all project records.
   - `fetch('/api/skills')` retrieves skills grouped by category.
   - `fetch('/api/certifications')` retrieves certificates, hackathons, and workshops.

3. **Backend Processing:**
   Express routes in `server.js` receive the requests, call query functions in `src/db.js`, which query the active database (MongoDB Atlas if `MONGODB_URI` is configured, or local SQLite).

4. **DOM Rendering:**
   Once the JSON data arrives in the browser, JavaScript dynamically generates and injects the HTML cards, chips, and badges into the page.

5. **Contact Form Submission:**
   When a visitor enters their name, email, and message and clicks **Send Message**:
   - `app.js` performs client-side validation.
   - A `POST` request with a JSON payload is dispatched to `/api/contact`.
   - Express validates the input fields (minimum length, valid email syntax).
   - The message is stored in the `messages` collection/table with a timestamp.
   - A success response is returned to the browser, displaying a confirmation message and clearing the form.

---

## 🗄️ Database Collections / Tables

### 1. `projects`
- `id` (Integer): Unique identifier
- `title` (String): Project name
- `slug` (String): URL-safe slug
- `description` (String): Overview of functionality
- `tech_stack` (Array / JSON): List of technologies used
- `my_part` (String): Personal role and contributions
- `github_url` (String): Repository URL or placeholder
- `demo_url` (String): Live demo link (optional)
- `featured` (Boolean): Highlight flag
- `sort_order` (Integer): Display sequence

### 2. `skills`
- `id` (Integer): Unique identifier
- `category` (String): Group (Languages, Web, Databases, AI/ML and data, Tools, Soft skills)
- `name` (String): Skill name
- `level` (String): Proficiency level (Working knowledge, Beginner, learning, etc.)

### 3. `certifications`
- `id` (Integer): Unique identifier
- `title` (String): Certificate or event title
- `issuer` (String): Issuing body or organizer
- `issued_on` (String): Issue date
- `type` (String): `certificate`, `hackathon`, or `workshop`
- `details` (String): Key score or participation description
- `verify_url` (String): Direct validation link or placeholder

### 4. `messages`
- `id` (Integer / ObjectId): Auto-generated ID
- `name` (String): Sender's full name
- `email` (String): Sender's email address
- `message` (String): Message body
- `created_at` (String / Date): Submission timestamp

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js (v18 or higher; Node 22 recommended)
- npm (comes with Node.js)

### 1. Clone the repository
```bash
git clone https://github.com/Kadhiravan06/Personal_Portfolio.git
cd Personal_Portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Seed the database
The seed command reads `data/projects.json`, `data/skills.json`, and `data/certifications.json` and populates the database:
```bash
npm run seed
```

### 4. Run tests
Verify that all API endpoints and database operations pass:
```bash
npm test
```

### 5. Start the server
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## ➕ How to Add a Project Without Changing Code

To add a new project (e.g. from upcoming Thiranex internship weeks):
1. Open `data/projects.json`.
2. Add your new project object to the array:
   ```json
   {
     "id": 4,
     "title": "Full Stack Task 2",
     "slug": "full-stack-task-2",
     "description": "Project description here.",
     "tech_stack": ["Node.js", "Express", "MongoDB"],
     "my_part": "Built frontend and backend API.",
     "github_url": "https://github.com/Kadhiravan06/task-2",
     "demo_url": "",
     "featured": true,
     "sort_order": 4
   }
   ```
3. Run the seed script:
   ```bash
   npm run seed
   ```
The new project immediately appears on the website.

---

## 🌐 Free Deployment Guide

### Option 1: Render (Recommended for full-stack Node.js + Express)

1. **Create a Free Database on MongoDB Atlas:**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up for a free M0 cluster (512MB free tier, no credit card required).
   - Under **Database Access**, create a database user (e.g., `kadhiravan`) with a secure password.
   - Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere).
   - Click **Connect** -> **Drivers** -> Copy the connection string:
     `mongodb+srv://kadhiravan:<password>@cluster0.abcde.mongodb.net/portfolio?retryWrites=true&w=majority`

2. **Deploy Backend to Render:**
   - Sign up at [render.com](https://render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository `Kadhiravan06/Personal_Portfolio`.
   - Settings:
     - **Runtime:** `Node`
     - **Build Command:** `npm install && npm run seed`
     - **Start Command:** `npm start`
     - **Instance Type:** `Free`
   - Under **Environment Variables**, add:
     - `MONGODB_URI`: `<your-mongodb-atlas-connection-string>`
     - `NODE_ENV`: `production`
   - Click **Deploy Web Service**.
   - Your site will be live at `https://<your-app-name>.onrender.com`.

### Option 2: Vercel

1. Install the Vercel CLI or connect via the Vercel dashboard:
   - Import your GitHub repo on [vercel.com](https://vercel.com).
2. Set Environment Variables:
   - `MONGODB_URI`: `<your-mongodb-atlas-connection-string>`
3. Deploy! Vercel uses `vercel.json` to route `/api/*` requests to Express and serves the static files from `public/`.

---

## 📁 Project Structure

```
Personal_Portfolio/
├── data/
│   ├── projects.json              # Seed data for projects
│   ├── skills.json                # Seed data for skills
│   └── certifications.json        # Seed data for certifications & hackathons
├── public/
│   ├── css/
│   │   └── style.css              # Modern CSS (dark/light mode, responsive)
│   ├── js/
│   │   └── app.js                 # Frontend logic (dynamic API rendering, form handling)
│   ├── index.html                 # Semantic single-page portfolio layout
│   └── Kadhiravan_K_Resume_Professional.pdf  # Resume download file
├── src/
│   └── db.js                      # Database adapter (MongoDB Mongoose + SQLite fallback)
├── server.js                      # Express application & REST API routes
├── seed.js                        # Database population script
├── test.js                        # Automated API & DB test suite
├── package.json                   # Dependencies & npm scripts
├── vercel.json                    # Vercel deployment configuration
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
└── README.md                      # Documentation & review explanation
```

---

## 👤 Author

**Kadhiravan K**
- B.E. Computer Science and Engineering, Rajalakshmi Institute of Technology, Chennai
- Full Stack Development Intern, Thiranex EduTech LLP
- Email: [kadhiravankalamegam2006@gmail.com](mailto:kadhiravankalamegam2006@gmail.com)
- GitHub: [github.com/Kadhiravan06](https://github.com/Kadhiravan06)
- LinkedIn: [linkedin.com/in/kadhiravan-k-31b79632b](https://www.linkedin.com/in/kadhiravan-k-31b79632b/)
