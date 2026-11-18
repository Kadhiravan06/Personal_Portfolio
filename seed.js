require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { seedDatabase } = require('./src/db');

async function runSeed() {
  const projectsPath = path.join(__dirname, 'data', 'projects.json');
  const skillsPath = path.join(__dirname, 'data', 'skills.json');
  const certsPath = path.join(__dirname, 'data', 'certifications.json');

  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
  const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));
  const certifications = JSON.parse(fs.readFileSync(certsPath, 'utf-8'));

  await seedDatabase({ projects, skills, certifications });
  console.log('Database seeded successfully.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});