'use strict';

/**
 * Seed script – populates the database with one sample project and
 * representative documents so the app can be explored without real uploads.
 *
 * Usage: node scripts/seed.js
 * (or via npm: npm run seed --workspace=server)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Project    = require('../src/models/Project');
const SourceFile = require('../src/models/SourceFile');
const Section    = require('../src/models/Section');
const Claim      = require('../src/models/Claim');
const Finding    = require('../src/models/Finding');
const Feedback   = require('../src/models/Feedback');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scrutiny';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  // ── Wipe existing seed data ──────────────────────────────────────────────
  await Promise.all([
    Project.deleteMany({ name: 'Sample Project' }),
    SourceFile.deleteMany({}),
    Section.deleteMany({}),
    Claim.deleteMany({}),
    Finding.deleteMany({}),
    Feedback.deleteMany({}),
  ]);

  // ── Project ──────────────────────────────────────────────────────────────
  const project = await Project.create({
    name: 'Sample Project',
    projectType: 'product-spec',
  });
  console.log('Created project:', project._id.toString());

  // ── Source file ──────────────────────────────────────────────────────────
  const sourceFile = await SourceFile.create({
    projectId: project._id,
    filename: 'requirements-v1.md',
    mimeType: 'text/markdown',
    contentHash: 'sha256:abc123placeholder',
    status: 'done',
  });
  console.log('Created source file:', sourceFile._id.toString());

  // ── Section ──────────────────────────────────────────────────────────────
  const section = await Section.create({
    fileId: sourceFile._id,
    heading: '3. Data Retention',
    text: 'User data must be retained for a minimum of 7 years to comply with regulatory requirements. Deletion requests must be fulfilled within 30 days.',
    startLine: 42,
    endLine: 45,
    startChar: 1820,
    endChar: 2010,
  });
  console.log('Created section:', section._id.toString());

  // ── Claims ───────────────────────────────────────────────────────────────
  const claim = await Claim.create({
    sectionId: section._id,
    kind: 'constraint',
    text: 'User data must be retained for at least 7 years.',
    quote: 'retained for a minimum of 7 years',
    startChar: 1835,
    endChar: 1869,
    categories: ['compliance', 'data-retention'],
  });
  console.log('Created claim:', claim._id.toString());

  // ── Finding ──────────────────────────────────────────────────────────────
  const finding = await Finding.create({
    projectId: project._id,
    type: 'gap',
    title: 'Retention policy conflicts with GDPR right to erasure',
    question:
      'How can a 7-year retention mandate co-exist with a 30-day deletion SLA under GDPR?',
    whyItMatters:
      'Failure to reconcile these requirements exposes the company to regulatory fines and reputational damage.',
    recommendation:
      'Define a legal-basis matrix that maps each data category to its retention schedule and deletion exemption, and review with legal counsel.',
    scores: {
      severity:      4,
      likelihood:    3,
      blastRadius:   4,
      lateDetection: 3,
      confidence:    4,
    },
    priority: 1,
    tier: 'P1',
    isHypothesis: false,
    status: 'open',
    evidence: [
      {
        claimId: claim._id,
        quote: 'retained for a minimum of 7 years',
        location: 'requirements-v1.md:43',
      },
    ],
  });
  console.log('Created finding:', finding._id.toString());

  // ── Feedback ─────────────────────────────────────────────────────────────
  const feedback = await Feedback.create({
    findingId: finding._id,
    action: 'accepted',
    editedText: 'Agree – scheduling legal review for sprint 14.',
  });
  console.log('Created feedback:', feedback._id.toString());

  console.log('\nSeed complete ✓');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
