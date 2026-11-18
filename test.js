process.env.NODE_ENV = 'test';
process.env.SQLITE_DB_PATH = 'test_portfolio.db';
delete process.env.MONGODB_URI;

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const app = require('./server');
process.env.MONGODB_URI = '';
const { initDb, seedDatabase } = require('./src/db');
const { DatabaseSync } = require('node:sqlite');

async function runTests() {
  const projects = JSON.parse(fs.readFileSync('./data/projects.json', 'utf-8'));
  const skills = JSON.parse(fs.readFileSync('./data/skills.json', 'utf-8'));
  const certs = JSON.parse(fs.readFileSync('./data/certifications.json', 'utf-8'));

  await initDb();
  await seedDatabase({ projects, skills, certifications: certs });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthJson.status, 'ok');

    const htmlRes = await fetch(`${baseUrl}/`);
    const htmlText = await htmlRes.text();
    assert.strictEqual(htmlRes.status, 200);
    assert(htmlText.includes('Kadhiravan K'));
    assert(htmlText.includes('View my projects'));

    const cssRes = await fetch(`${baseUrl}/css/style.css`);
    const cssText = await cssRes.text();
    assert.strictEqual(cssRes.status, 200);
    assert(cssText.includes('--accent-primary'));

    const jsRes = await fetch(`${baseUrl}/js/app.js`);
    const jsText = await jsRes.text();
    assert.strictEqual(jsRes.status, 200);
    assert(jsText.includes('loadProjects'));

    const pdfRes = await fetch(`${baseUrl}/Kadhiravan_K_Resume_Professional.pdf`);
    const pdfBuf = await pdfRes.arrayBuffer();
    assert.strictEqual(pdfRes.status, 200);
    assert(pdfBuf.byteLength > 100);

    const projRes = await fetch(`${baseUrl}/api/projects`);
    const projJson = await projRes.json();
    assert.strictEqual(projRes.status, 200);
    assert.strictEqual(projJson.length, 3);
    assert.strictEqual(projJson[0].title, 'To-Do List App (CodSoft Task 1)');
    assert(Array.isArray(projJson[0].tech_stack));

    const skillRes = await fetch(`${baseUrl}/api/skills`);
    const skillJson = await skillRes.json();
    assert.strictEqual(skillRes.status, 200);
    assert(skillJson['Languages']);
    assert(skillJson['Web']);
    assert(skillJson['Databases']);
    assert(skillJson['AI/ML and data']);
    assert(skillJson['Tools']);
    assert(skillJson['Soft skills']);

    const certRes = await fetch(`${baseUrl}/api/certifications`);
    const certJson = await certRes.json();
    assert.strictEqual(certRes.status, 200);
    assert.strictEqual(certJson.length, 8);

    const badContactRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'not-an-email', message: 'hi' })
    });
    assert.strictEqual(badContactRes.status, 400);

    const contactPayload = {
      name: 'Thiranex Evaluator',
      email: 'evaluator@thiranex.com',
      message: 'Great full-stack portfolio implementation!'
    };
    const goodContactRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactPayload)
    });
    const goodContactJson = await goodContactRes.json();
    assert.strictEqual(goodContactRes.status, 201);
    assert.strictEqual(goodContactJson.success, true);
    assert(goodContactJson.data.id);

    const testDb = new DatabaseSync('test_portfolio.db');
    const msgRows = testDb.prepare('SELECT * FROM messages WHERE email = ?').all('evaluator@thiranex.com');
    assert.strictEqual(msgRows.length, 1);
    assert.strictEqual(msgRows[0].name, 'Thiranex Evaluator');
    assert.strictEqual(msgRows[0].message, 'Great full-stack portfolio implementation!');

    console.log('All tests passed successfully! Everything is fully verified.');
  } finally {
    server.close();
    try {
      if (fs.existsSync('test_portfolio.db')) {
        fs.unlinkSync('test_portfolio.db');
      }
    } catch (_) {}
  }
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});