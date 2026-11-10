const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

const BASE_URL = 'http://localhost:5000/api';

test('1. GET /api/health should return ok', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});

test('2. GET /api/opportunities/stats should return summary counts', async () => {
  const res = await fetch(`${BASE_URL}/opportunities/stats`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(typeof data.opportunities === 'number');
  assert.ok(typeof data.internships === 'number');
  assert.ok(typeof data.jobs === 'number');
  assert.ok(typeof data.domains === 'number');
  assert.ok(typeof data.applications === 'number');
});

test('3. GET /api/opportunities should list opportunities', async () => {
  const res = await fetch(`${BASE_URL}/opportunities`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.count > 0);
  assert.ok(Array.isArray(data.data));
});

test('4. GET /api/opportunities?search=react should filter by keyword', async () => {
  const res = await fetch(`${BASE_URL}/opportunities?search=react`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.count >= 1);
});

test('5. GET /api/opportunities/domains should return distinct domain list', async () => {
  const res = await fetch(`${BASE_URL}/opportunities/domains`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.count >= 5);
  assert.ok(data.data.includes('Software Development'));
});

test('6. Full CRUD on Opportunity and Application lifecycle', async () => {
  // A. Create opportunity
  const newOpp = {
    title: 'QA Automation Engineer Intern',
    company: 'TestFlow Labs',
    domain: 'Software Development',
    location: 'Hyderabad (Remote)',
    experience: '0-1 years',
    type: 'Internship',
    description: 'Automate end-to-end tests using Playwright and Jest.',
    applicationLink: 'https://testflow.example.com/apply',
  };

  const createRes = await fetch(`${BASE_URL}/opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOpp),
  });
  assert.equal(createRes.status, 201);
  const createdOpp = await createRes.json();
  const oppId = createdOpp.data._id;
  assert.equal(createdOpp.data.title, newOpp.title);

  // B. Get details by ID
  const detailRes = await fetch(`${BASE_URL}/opportunities/${oppId}`);
  assert.equal(detailRes.status, 200);
  const detail = await detailRes.json();
  assert.equal(detail.company, newOpp.company);

  // C. Update opportunity
  const updateRes = await fetch(`${BASE_URL}/opportunities/${oppId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: 'Bengaluru (Hybrid)' }),
  });
  assert.equal(updateRes.status, 200);
  const updated = await updateRes.json();
  assert.equal(updated.data.location, 'Bengaluru (Hybrid)');

  // D. Submit application
  const appData = {
    opportunityId: oppId,
    name: 'Ananya Verma',
    email: 'ananya.verma@example.com',
    phone: '9876543211',
    resumeLink: 'https://drive.example.com/resume/ananya.pdf',
    coverLetter: 'Experienced with JavaScript and Playwright.',
  };

  const appSubmitRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appData),
  });
  assert.equal(appSubmitRes.status, 201);
  const submittedApp = await appSubmitRes.json();
  const appId = submittedApp.data._id;
  assert.equal(submittedApp.data.name, appData.name);

  // E. Get application confirmation (populated with opportunity)
  const confRes = await fetch(`${BASE_URL}/applications/${appId}`);
  assert.equal(confRes.status, 200);
  const conf = await confRes.json();
  assert.equal(conf.name, appData.name);
  assert.equal(conf.opportunity.title, newOpp.title);

  // F. Update application status (Admin)
  const statusRes = await fetch(`${BASE_URL}/applications/${appId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Under Review' }),
  });
  assert.equal(statusRes.status, 200);
  const statusBody = await statusRes.json();
  assert.equal(statusBody.data.status, 'Under Review');

  // G. Delete opportunity (should cascade delete its applications)
  const delOppRes = await fetch(`${BASE_URL}/opportunities/${oppId}`, { method: 'DELETE' });
  assert.equal(delOppRes.status, 200);

  // H. Confirm 404 for deleted opp and deleted app
  const checkOpp = await fetch(`${BASE_URL}/opportunities/${oppId}`);
  assert.equal(checkOpp.status, 404);

  const checkApp = await fetch(`${BASE_URL}/applications/${appId}`);
  assert.equal(checkApp.status, 404);
});

test('7. Validation error handling: missing fields and bad email', async () => {
  // Missing fields on opportunity
  const badOppRes = await fetch(`${BASE_URL}/opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Incomplete' }),
  });
  assert.equal(badOppRes.status, 400);

  // Bad email on application
  const oppsRes = await fetch(`${BASE_URL}/opportunities`);
  const opps = await oppsRes.json();
  const firstOppId = opps.data[0]._id;

  const badEmailRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      opportunityId: firstOppId,
      name: 'John Doe',
      email: 'not-an-email',
    }),
  });
  assert.equal(badEmailRes.status, 400);
});

