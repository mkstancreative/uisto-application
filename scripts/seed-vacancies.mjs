#!/usr/bin/env node
/*
  Seeds the career-portal API with sample recruitment data, in dependency order:
    1. requirements (per cadre)
    2. subcadres (for Non-Academic positions)
    3. positions (linked to requirements + department/subcadre)
    4. five open vacancies (one per position)

  Safe to re-run: anything that already exists (matched by name/title) is reused,
  and a position that already has an active vacancy is skipped.

  Usage:
    npm run seed:vacancies
    API_URL=https://… npm run seed:vacancies
    SEED_EMAIL=you@uisto.edu.ng npm run seed:vacancies   (password is always prompted)

  Requires a registrar or HR manager account that has already changed its
  first-sign-in password. The password prompt does not echo anything.
*/
import readline from 'node:readline';

const API_URL = (process.env.API_URL || 'https://career-portal-uisto.onrender.com').replace(/\/+$/, '');
const BASE = `${API_URL}/api/v1`;
const DEADLINE_DAYS = Number(process.env.DEADLINE_DAYS || 30);

/* ════════════════════════════════════════
   Seed data
════════════════════════════════════════ */
const REQUIREMENTS = {
  Academic: [
    'PhD in a relevant field',
    "Master's degree in a relevant field",
    'Minimum of 3 publications in reputable journals',
    'Minimum of 8 publications in reputable journals',
    'Evidence of university-level teaching experience',
    'Registration with the relevant professional body',
    'NYSC discharge or exemption certificate',
  ],
  'Non-Academic': [
    "Bachelor's degree or HND in a relevant field",
    'NYSC discharge or exemption certificate',
    'Proficiency in Microsoft Office',
    'Relevant professional certification',
    'Minimum of 3 years of relevant work experience',
  ],
};

const SUBCADRES = ['Administrative Cadre', 'Technical Cadre'];

const POSITIONS = [
  {
    title: 'Lecturer I',
    cadre: 'Academic',
    department: 'Computer Science',
    requiredYearsExperience: 3,
    requirements: [
      'PhD in a relevant field',
      'Minimum of 3 publications in reputable journals',
      'NYSC discharge or exemption certificate',
    ],
    vacancy: {
      description:
        'Teach undergraduate and postgraduate courses in Computer Science, supervise student projects, ' +
        'conduct and publish research, and take part in departmental and community service.',
      extraRequirements: ['Evidence of university-level teaching experience'],
    },
  },
  {
    title: 'Senior Lecturer',
    cadre: 'Academic',
    department: 'Civil Engineering',
    requiredYearsExperience: 7,
    requirements: [
      'PhD in a relevant field',
      'Minimum of 8 publications in reputable journals',
      'Registration with the relevant professional body',
    ],
    vacancy: {
      description:
        'Lead courses in structural and geotechnical engineering, mentor junior academic staff, ' +
        'secure research funding and coordinate the departmental research group.',
      extraRequirements: ['Evidence of university-level teaching experience'],
    },
  },
  {
    title: 'Assistant Lecturer',
    cadre: 'Academic',
    department: 'Accounting',
    requiredYearsExperience: 1,
    requirements: ["Master's degree in a relevant field", 'NYSC discharge or exemption certificate'],
    vacancy: {
      description:
        'Support teaching of introductory accounting and finance courses, assist with tutorials and ' +
        'assessments, and pursue doctoral research within the department.',
      extraRequirements: ['Registration with the relevant professional body'],
    },
  },
  {
    title: 'Administrative Officer II',
    cadre: 'Non-Academic',
    subcadre: 'Administrative Cadre',
    requiredYearsExperience: 2,
    requirements: [
      "Bachelor's degree or HND in a relevant field",
      'NYSC discharge or exemption certificate',
      'Proficiency in Microsoft Office',
    ],
    vacancy: {
      description:
        'Handle correspondence and records for the Registry, prepare minutes of meetings, support ' +
        'student and staff administration, and coordinate office logistics.',
      extraRequirements: [],
    },
  },
  {
    title: 'Systems Analyst II',
    cadre: 'Non-Academic',
    subcadre: 'Technical Cadre',
    requiredYearsExperience: 3,
    requirements: [
      "Bachelor's degree or HND in a relevant field",
      'Relevant professional certification',
    ],
    vacancy: {
      description:
        "Maintain the university's information systems, support staff and students with ICT issues, " +
        'manage user accounts and help roll out new digital services.',
      extraRequirements: ['Minimum of 3 years of relevant work experience'],
    },
  },
];

/* ════════════════════════════════════════
   HTTP helpers
════════════════════════════════════════ */
let accessToken = null;

class HttpError extends Error {
  constructor(status, body) {
    super(body?.message || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text.slice(0, 200) };
  }
  if (!res.ok || json?.success === false) throw new HttpError(res.status, json);
  return json;
}

const idOf = (x) => x?._id ?? x?.id;
const norm = (s) => String(s ?? '').trim().toLowerCase();

/* ════════════════════════════════════════
   Prompts (password input is hidden)
════════════════════════════════════════ */
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => {
    rl.close();
    resolve(a.trim());
  }));
}

/** Reads a line without echoing anything (no characters, no mask). */
function askHidden(question) {
  const { stdin, stdout } = process;
  stdout.write(question);

  // Piped input (e.g. CI): nothing is displayed anyway
  if (!stdin.isTTY) {
    return new Promise((resolve) => {
      const rl = readline.createInterface({ input: stdin });
      rl.once('line', (line) => {
        rl.close();
        resolve(line);
      });
    });
  }

  return new Promise((resolve) => {
    let value = '';
    const cleanup = () => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
    };
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          cleanup();
          resolve(value);
          return;
        }
        if (ch === '\u0003') {
          cleanup();
          process.exit(130);
        }
        if (ch === '\u007f' || ch === '\b') value = value.slice(0, -1);
        else if (ch >= ' ') value += ch;
      }
    };
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();
    stdin.on('data', onData);
  });
}

/* ════════════════════════════════════════
   Steps
════════════════════════════════════════ */
async function signIn() {
  const email = process.env.SEED_EMAIL || (await ask('Staff email (registrar or HR manager): '));
  const password = await askHidden('Password: ');
  const res = await call('POST', '/auth/login', { email, password });
  const user = res.data?.user;
  if (user?.mustChangePassword) {
    throw new Error('This account must change its password first. Sign in to the portal, set a new password, then re-run.');
  }
  if (!['hrm', 'registrar'].includes(user?.role)) {
    throw new Error(`Signed in as "${user?.role}", which is read-only. Use a registrar or HR manager account.`);
  }
  accessToken = res.data.accessToken;
  console.log(`✓ Signed in as ${user.name} (${user.role})\n`);
  return res.data.refreshToken;
}

async function ensureRequirements() {
  console.log('Requirements');
  const byCadre = {};
  for (const [cadre, names] of Object.entries(REQUIREMENTS)) {
    const existing = (await call('GET', `/requirements?page=1&limit=1000&cadre=${encodeURIComponent(cadre)}`)).data ?? [];
    byCadre[cadre] = new Map(existing.map((r) => [norm(r.name), r]));
    for (const name of names) {
      const found = byCadre[cadre].get(norm(name));
      if (found) {
        if (found.isActive === false) {
          await call('PATCH', `/requirements/${idOf(found)}/toggle`);
          console.log(`  ↺ reactivated  ${cadre} · ${name}`);
        } else {
          console.log(`  = exists       ${cadre} · ${name}`);
        }
        continue;
      }
      const created = (await call('POST', '/requirements', { name, cadre })).data;
      byCadre[cadre].set(norm(name), created);
      console.log(`  + created      ${cadre} · ${name}`);
    }
  }
  console.log('');
  return (cadre, name) => {
    const r = byCadre[cadre]?.get(norm(name));
    if (!r) throw new Error(`Requirement not found: ${cadre} · ${name}`);
    return idOf(r);
  };
}

async function ensureSubcadres() {
  console.log('Subcadres');
  const existing = (await call('GET', '/subcadres')).data ?? [];
  const map = new Map(existing.map((s) => [norm(s.name), s]));
  for (const name of SUBCADRES) {
    const found = map.get(norm(name));
    if (found) {
      if (found.isActive === false) {
        await call('PATCH', `/subcadres/${idOf(found)}/toggle`);
        console.log(`  ↺ reactivated  ${name}`);
      } else {
        console.log(`  = exists       ${name}`);
      }
      continue;
    }
    const created = (await call('POST', '/subcadres', { name })).data;
    map.set(norm(name), created);
    console.log(`  + created      ${name}`);
  }
  console.log('');
  return (name) => {
    const s = map.get(norm(name));
    if (!s) throw new Error(`Subcadre not found: ${name}`);
    return idOf(s);
  };
}

async function ensurePositions(reqId, subcadreId) {
  console.log('Positions');
  const existing = (await call('GET', '/positions')).data ?? [];
  const result = new Map();
  for (const p of POSITIONS) {
    const match = existing.find((e) => {
      if (norm(e.title) !== norm(p.title) || e.cadre !== p.cadre) return false;
      if (p.cadre === 'Academic') return norm(e.department) === norm(p.department);
      return String(idOf(e.subcadre) ?? e.subcadre) === String(subcadreId(p.subcadre));
    });
    if (match) {
      console.log(`  = exists       ${p.title} (${p.department ?? p.subcadre})`);
      result.set(p.title, match);
      continue;
    }
    const body = {
      title: p.title,
      cadre: p.cadre,
      requirements: p.requirements.map((n) => reqId(p.cadre, n)),
      requiredYearsExperience: p.requiredYearsExperience,
      ...(p.cadre === 'Academic' ? { department: p.department } : { subcadre: subcadreId(p.subcadre) }),
    };
    const created = (await call('POST', '/positions', body)).data;
    result.set(p.title, created);
    console.log(`  + created      ${p.title} (${p.department ?? p.subcadre})`);
  }
  console.log('');
  return result;
}

async function createVacancies(positions, reqId) {
  console.log('Vacancies');
  const deadline = new Date(Date.now() + DEADLINE_DAYS * 86400000);
  const applicationDeadline = `${deadline.toISOString().slice(0, 10)}T23:59:59.000Z`;
  let created = 0;

  for (const p of POSITIONS) {
    const position = positions.get(p.title);
    try {
      await call('POST', '/jobs', {
        position: idOf(position),
        description: p.vacancy.description,
        extraRequirements: p.vacancy.extraRequirements.map((n) => reqId(p.cadre, n)),
        applicationDeadline,
      });
      created += 1;
      console.log(`  + opened       ${p.title} — closes ${applicationDeadline.slice(0, 10)}`);
    } catch (err) {
      if (err.status === 409) {
        console.log(`  = skipped      ${p.title} — already has an active vacancy`);
      } else {
        throw err;
      }
    }
  }
  console.log(`\n${created} vacanc${created === 1 ? 'y' : 'ies'} opened.`);
}

/* ════════════════════════════════════════
   Run
════════════════════════════════════════ */
async function main() {
  console.log(`Seeding ${BASE}\n`);
  const refreshToken = await signIn();
  try {
    const reqId = await ensureRequirements();
    const subcadreId = await ensureSubcadres();
    const positions = await ensurePositions(reqId, subcadreId);
    await createVacancies(positions, reqId);
  } finally {
    // End this script's session so it doesn't count toward the 5-session limit
    await call('POST', '/auth/logout', { refreshToken }).catch(() => {});
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  if (err.status === 401) console.error('  Check the email and password.');
  if (err.status === 403) console.error('  This account is not allowed to make these changes.');
  process.exitCode = 1;
});
