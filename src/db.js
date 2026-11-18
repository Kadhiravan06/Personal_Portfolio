const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { DatabaseSync } = require('node:sqlite');

const isMongo = Boolean(process.env.MONGODB_URI);

let sqliteDb = null;

const ProjectSchema = new mongoose.Schema({
  id: Number,
  title: String,
  slug: String,
  description: String,
  tech_stack: [String],
  my_part: String,
  github_url: String,
  demo_url: String,
  featured: Boolean,
  sort_order: Number
});

const SkillSchema = new mongoose.Schema({
  id: Number,
  category: String,
  name: String,
  level: String
});

const CertificationSchema = new mongoose.Schema({
  id: Number,
  title: String,
  issuer: String,
  issued_on: String,
  type: String,
  details: String,
  verify_url: String
});

const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  created_at: { type: Date, default: Date.now }
});

const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const SkillModel = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
const CertificationModel = mongoose.models.Certification || mongoose.model('Certification', CertificationSchema);
const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);

function getSqliteDb() {
  if (!sqliteDb) {
    const dbPath = path.resolve(process.env.SQLITE_DB_PATH || 'portfolio.db');
    sqliteDb = new DatabaseSync(dbPath);
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT NOT NULL,
        tech_stack TEXT NOT NULL,
        my_part TEXT NOT NULL,
        github_url TEXT NOT NULL,
        demo_url TEXT,
        featured INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        level TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        issuer TEXT NOT NULL,
        issued_on TEXT NOT NULL,
        type TEXT NOT NULL,
        details TEXT NOT NULL,
        verify_url TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }
  return sqliteDb;
}

async function initDb() {
  if (isMongo) {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  } else {
    getSqliteDb();
  }
}

async function getProjects() {
  await initDb();
  if (isMongo) {
    return await ProjectModel.find().sort({ sort_order: 1 }).lean();
  }
  const db = getSqliteDb();
  const rows = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all();
  return rows.map(r => ({
    ...r,
    featured: Boolean(r.featured),
    tech_stack: typeof r.tech_stack === 'string' ? JSON.parse(r.tech_stack) : r.tech_stack
  }));
}

async function getSkills() {
  await initDb();
  if (isMongo) {
    return await SkillModel.find().sort({ id: 1 }).lean();
  }
  const db = getSqliteDb();
  return db.prepare('SELECT * FROM skills ORDER BY id ASC').all();
}

async function getCertifications() {
  await initDb();
  if (isMongo) {
    return await CertificationModel.find().sort({ id: 1 }).lean();
  }
  const db = getSqliteDb();
  return db.prepare('SELECT * FROM certifications ORDER BY id ASC').all();
}

async function saveMessage({ name, email, message }) {
  await initDb();
  if (isMongo) {
    const doc = await MessageModel.create({ name, email, message });
    return doc.toObject();
  }
  const db = getSqliteDb();
  const stmt = db.prepare('INSERT INTO messages (name, email, message, created_at) VALUES (?, ?, ?, ?)');
  const createdAt = new Date().toISOString();
  const info = stmt.run(name, email, message, createdAt);
  return { id: info.lastInsertRowid, name, email, message, created_at: createdAt };
}

async function seedDatabase({ projects, skills, certifications }) {
  await initDb();
  if (isMongo) {
    await ProjectModel.deleteMany({});
    await SkillModel.deleteMany({});
    await CertificationModel.deleteMany({});
    if (projects?.length) await ProjectModel.insertMany(projects);
    if (skills?.length) await SkillModel.insertMany(skills);
    if (certifications?.length) await CertificationModel.insertMany(certifications);
    return;
  }
  const db = getSqliteDb();
  db.exec('DELETE FROM projects; DELETE FROM skills; DELETE FROM certifications;');
  
  if (projects?.length) {
    const insertProject = db.prepare(`
      INSERT INTO projects (id, title, slug, description, tech_stack, my_part, github_url, demo_url, featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of projects) {
      insertProject.run(
        p.id,
        p.title,
        p.slug,
        p.description,
        JSON.stringify(p.tech_stack),
        p.my_part,
        p.github_url || '',
        p.demo_url || '',
        p.featured ? 1 : 0,
        p.sort_order || 0
      );
    }
  }

  if (skills?.length) {
    const insertSkill = db.prepare('INSERT INTO skills (id, category, name, level) VALUES (?, ?, ?, ?)');
    for (const s of skills) {
      insertSkill.run(s.id, s.category, s.name, s.level);
    }
  }

  if (certifications?.length) {
    const insertCert = db.prepare('INSERT INTO certifications (id, title, issuer, issued_on, type, details, verify_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const c of certifications) {
      insertCert.run(c.id, c.title, c.issuer, c.issued_on, c.type, c.details, c.verify_url);
    }
  }
}

module.exports = {
  initDb,
  getProjects,
  getSkills,
  getCertifications,
  saveMessage,
  seedDatabase
};