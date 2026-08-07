#!/usr/bin/env node
/**
 * importFromExcel.js
 *
 * One-way sync: Category x Level Matrix workbook -> MongoDB.
 * The workbook is the source of truth for curriculum content; this script
 * is how it lands in the app. Safe to re-run any time the workbook changes —
 * every write is an upsert keyed on a stable field (catNumber / moduleKey /
 * qId / quizKey), never on Mongo _id, so re-running doesn't duplicate data
 * and picks up edits (a corrected question, a swapped video) automatically.
 *
 * Usage:
 *   node src/scripts/importFromExcel.js /path/to/workbook.xlsx
 *   node src/scripts/importFromExcel.js /path/to/workbook.xlsx --dry-run
 *
 * Requires the `xlsx` package (not yet a project dependency):
 *   npm install xlsx
 */

const path = require('path');
const XLSX = require('xlsx');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Module = require('../models/Module');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

const LEVEL_ORDER = ['apprentice', 'adept', 'master', 'legend'];

// Sourced from the "Quiz Blueprint" sheet, Part A ("THE FOUR GATES" table).
// This table is small, human-curated, and rarely changes — hardcoding it
// here (documented, in one place) is a deliberate trade-off against writing
// a parser for a merged-cell-heavy summary table for four rows of data. If
// the blueprint sheet changes, update this object to match.
const LEVEL_GATES = {
  apprentice: { totalQuestions: 15, duration: 25, passPercentage: 70, hasCaseStudy: false },
  adept:      { totalQuestions: 20, duration: 40, passPercentage: 75, hasCaseStudy: false },
  master:     { totalQuestions: 20, duration: 60, passPercentage: 80, hasCaseStudy: false },
  legend:     { totalQuestions: 12, duration: 90, passPercentage: 80, hasCaseStudy: true },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const filePath = args.find((a) => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  if (!filePath) {
    console.error('Usage: node importFromExcel.js <workbook.xlsx> [--dry-run]');
    process.exit(1);
  }
  return { filePath: path.resolve(filePath), dryRun };
}

// "L1 · Apprentice" -> "apprentice". Tolerant of whatever separator/spacing
// shows up (the workbook uses a middle-dot, but don't bet the parser on it).
function parseLevel(raw) {
  if (!raw) return null;
  const match = String(raw).match(/L(\d)/i);
  if (!match) return null;
  const idx = parseInt(match[1], 10) - 1;
  return LEVEL_ORDER[idx] || null;
}

// Question Bank and Answer Key sheets both carry non-data rows mixed in
// with real ones — trailing "BANK INCOMPLETE - L1: 40 of 45..." footer rows
// and (in the Answer Key) repeated section/column-header rows between each
// level's block. A truthy check on column A isn't enough to exclude these;
// only a real Q-ID matches this shape (e.g. "C4-L1-001", "C10-L2-014").
function isQId(val) {
  return typeof val === 'string' && /^[A-Z]\d+-L\d-\d+$/i.test(val.trim());
}

function rowsFrom(sheet, { headerRow = 4 } = {}) {
  // header row index is 0-based for sheet_to_json's range option
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1, range: headerRow, defval: null });
  return json.filter((r) => r[0] !== null && r[0] !== undefined && r[0] !== '');
}

async function run() {
  const { filePath, dryRun } = parseArgs();
  const summary = { categories: 0, modules: 0, videosApproved: 0, videosNeedsReview: 0,
    questions: 0, questionMismatches: [], quizzes: 0, skippedCategories: [] };

  console.log(`Reading workbook: ${filePath}${dryRun ? '  [DRY RUN — no writes]' : ''}`);
  const wb = XLSX.readFile(filePath);

  // ---- Step 1: Categories, from the "Category Matrix" sheet -------------
  const matrixSheet = wb.Sheets['Category Matrix'];
  if (!matrixSheet) throw new Error('Sheet "Category Matrix" not found');
  const matrixRows = rowsFrom(matrixSheet).filter((r) => Number.isInteger(r[0]));

  // Build a lookup of which workbook sheets exist per category number, since
  // sheet names aren't perfectly uniform (content sheet has a variable
  // suffix, e.g. "Cat04 Comms" vs "Cat01 Control").
  const sheetsByCat = {}; // { 4: { content: 'Cat04 Comms', questionBank: 'Cat04 Question Bank', answerKey: 'Cat04 Answer Key' } }
  for (const name of wb.SheetNames) {
    const m = name.match(/^Cat(\d{2})\s+(.+)$/);
    if (!m) continue;
    const num = parseInt(m[1], 10);
    const label = m[2];
    sheetsByCat[num] = sheetsByCat[num] || {};
    if (label === 'Question Bank') sheetsByCat[num].questionBank = name;
    else if (label === 'Answer Key') sheetsByCat[num].answerKey = name;
    else sheetsByCat[num].content = name; // e.g. "Comms", "Control", "Safety"
  }

  const categoryDocs = {}; // catNumber -> saved Category doc

  for (const row of matrixRows) {
    const [catNumber, name, whyItExists] = row;
    const slug = `cat${String(catNumber).padStart(2, '0')}`;
    const hasQB = !!sheetsByCat[catNumber]?.questionBank;
    const hasContent = !!sheetsByCat[catNumber]?.content;
    const curationStatus = hasQB ? 'question_bank_ready' : hasContent ? 'content_curated' : 'not_started';

    const payload = { catNumber, name, slug, whyItExists: whyItExists || '', order: catNumber, curationStatus };
    console.log(`Category ${catNumber}: ${name}  [${curationStatus}]`);
    summary.categories += 1;
    if (curationStatus === 'not_started') summary.skippedCategories.push(name);

    if (!dryRun) {
      categoryDocs[catNumber] = await Category.findOneAndUpdate(
        { catNumber }, payload, { upsert: true, new: true }
      );
    }
  }

  // ---- Step 2: Modules (44 cells) + videos from content sheets ----------
  for (const row of matrixRows) {
    const catNumber = row[0];
    const sheets = sheetsByCat[catNumber] || {};
    const contentSheet = sheets.content ? wb.Sheets[sheets.content] : null;
    const videosByLevel = { apprentice: [], adept: [], master: [], legend: [] };

    if (contentSheet) {
      // Header row is at the same offset as every other sheet type — verified
      // against the actual workbook rather than assumed (see design doc).
      const contentRows = rowsFrom(contentSheet);
      for (const r of contentRows) {
        const level = parseLevel(r[0]);
        const type = r[1]; // VIDEO | DOCUMENT | NEEDS REVIEW
        if (!level || !type) continue;

        const video = {
          title: r[3] || '(untitled)',
          url: r[5] || '',
          source: r[4] || '',
          moduleTopic: r[2] || '',
          whySelected: r[6] || '',
          rubric: {
            depth: r[12] ?? null, credibility: r[13] ?? null, clarity: r[14] ?? null,
            neutrality: r[15] ?? null, length: r[16] ?? null, engagement: r[17] ?? null,
            total: r[18] ?? null,
          },
          status: type === 'NEEDS REVIEW' ? 'needs_review' : 'approved',
        };
        videosByLevel[level].push(video);
        if (video.status === 'approved') summary.videosApproved += 1;
        else summary.videosNeedsReview += 1;
      }
    }

    for (let i = 0; i < LEVEL_ORDER.length; i++) {
      const level = LEVEL_ORDER[i];
      const prerequisites = i === 0
        ? []
        : [{ categoryId: categoryDocs[catNumber]?._id, level: LEVEL_ORDER[i - 1] }];

      const payload = {
        moduleKey: `${slugFor(catNumber)}-l${i + 1}`, // "cat04-l1", stable and unambiguous
        categoryId: categoryDocs[catNumber]?._id,
        level,
        title: `${row[1]} — ${capitalize(level)}`,
        videos: videosByLevel[level],
        prerequisites,
      };

      console.log(`  Module ${payload.moduleKey}: ${payload.videos.length} videos`);
      summary.modules += 1;

      if (!dryRun) {
        await Module.findOneAndUpdate(
          { moduleKey: payload.moduleKey }, payload, { upsert: true, new: true }
        );
      }
    }
  }

  // ---- Step 3 & 4: Questions + Quizzes, only for categories with a bank --
  for (const row of matrixRows) {
    const catNumber = row[0];
    const sheets = sheetsByCat[catNumber] || {};
    if (!sheets.questionBank) continue; // most categories don't have one yet — expected, not an error

    const qbRows = rowsFrom(wb.Sheets[sheets.questionBank]);
    const answerKeyMap = buildAnswerKeyMap(sheets.answerKey ? wb.Sheets[sheets.answerKey] : null);

    const questionsByLevel = { apprentice: [], adept: [], master: [], legend: [] };

    for (const r of qbRows) {
      const [qId, levelRaw, moduleTopic, type, question, A, B, C, D, E, answer, rationale, status] = r;
      if (!isQId(qId)) continue; // drops the trailing "BANK INCOMPLETE..." / notes footer rows
      const level = parseLevel(levelRaw);
      if (!level || !type) continue;

      // Cross-check against the Answer Key sheet. The two are meant to
      // agree (Answer Key is a "compact marking sheet" derived from the
      // same data) — a mismatch means someone edited one sheet and not the
      // other, and should block that question rather than import silently.
      const keyAnswer = answerKeyMap.get(qId);
      if (keyAnswer && keyAnswer !== answer) {
        summary.questionMismatches.push({ qId, questionBankAnswer: answer, answerKeyAnswer: keyAnswer });
        continue; // skip importing this one until it's reconciled by hand
      }

      const payload = {
        qId, question, type,
        options: { A: A || '', B: B || '', C: C || '', D: D || '', E: E || '' },
        correctAnswer: answer,
        category: row[1],
        level,
        moduleTopic: moduleTopic || '',
        rationale: rationale || '',
        reviewStatus: status === 'Draft' ? 'draft' : 'reviewed',
      };

      questionsByLevel[level].push(payload);
      summary.questions += 1;

      if (!dryRun) {
        await Question.findOneAndUpdate({ qId }, payload, { upsert: true, new: true });
      }
    }

    // One quiz per level per category, pool = every question just imported
    // for that (category, level). The quiz does NOT freeze a fixed question
    // list — Question.quizId / the pool relationship is what the attempt-
    // time sampler (bank target = 3x exam) draws from.
    for (let i = 0; i < LEVEL_ORDER.length; i++) {
      const level = LEVEL_ORDER[i];
      const pool = questionsByLevel[level];
      if (pool.length === 0) continue; // this category/level has no bank yet

      const gate = LEVEL_GATES[level];
      const quizKey = `${slugFor(catNumber)}-l${i + 1}-quiz`;
      const moduleKey = `${slugFor(catNumber)}-l${i + 1}`;

      const payload = {
        quizKey,
        title: `${row[1]} — ${capitalize(level)} Gate`,
        level,
        totalQuestions: gate.totalQuestions,
        totalMarks: gate.totalQuestions, // 1 mark/question by default; adjust if marks vary
        passMarks: Math.ceil(gate.totalQuestions * (gate.passPercentage / 100)),
        passPercentage: gate.passPercentage,
        duration: gate.duration,
        hasCaseStudy: gate.hasCaseStudy,
        status: 'draft', // admin promotes to 'published' after reviewing imported content — never auto-publish
      };

      console.log(`  Quiz ${quizKey}: pool of ${pool.length} questions, draws ${gate.totalQuestions}`);
      summary.quizzes += 1;

      if (!dryRun) {
        const savedQuestions = await Question.find({ qId: { $in: pool.map((p) => p.qId) } }).select('_id');
        const quizDoc = await Quiz.findOneAndUpdate(
          { quizKey },
          { ...payload, questions: savedQuestions.map((q) => q._id) },
          { upsert: true, new: true }
        );
        await Module.findOneAndUpdate({ moduleKey }, { quizId: quizDoc._id });
      }
    }
  }

  printSummary(summary, dryRun);
}

function buildAnswerKeyMap(sheet) {
  const map = new Map();
  if (!sheet) return map;
  // Answer Key sheet repeats its "Q-ID | Type | Answer | Traces to" column
  // header and a "L2 · Adept (36 questions)" section-break row before each
  // level's block — both land in column A and must be rejected by isQId(),
  // a loose "contains a hyphen" check would let the literal string "Q-ID"
  // through and pollute the map.
  const rows = rowsFrom(sheet);
  for (const r of rows) {
    const [qId, , answer] = r;
    if (isQId(qId)) map.set(qId, answer);
  }
  return map;
}

function slugFor(catNumber) {
  return `cat${String(catNumber).padStart(2, '0')}`;
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function printSummary(s, dryRun) {
  console.log('\n' + '='.repeat(60));
  console.log(dryRun ? 'DRY RUN SUMMARY (nothing written)' : 'IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Categories:            ${s.categories}`);
  console.log(`Modules:               ${s.modules}`);
  console.log(`Videos approved:       ${s.videosApproved}`);
  console.log(`Videos needs_review:   ${s.videosNeedsReview}`);
  console.log(`Questions imported:    ${s.questions}`);
  console.log(`Quizzes created:       ${s.quizzes}`);
  if (s.skippedCategories.length) {
    console.log(`\nCategories with no content yet (left curationStatus='not_started'):`);
    s.skippedCategories.forEach((c) => console.log(`  - ${c}`));
  }
  if (s.questionMismatches.length) {
    console.log(`\n⚠ ${s.questionMismatches.length} question(s) SKIPPED — Question Bank and Answer Key disagree:`);
    s.questionMismatches.forEach((m) =>
      console.log(`  - ${m.qId}: bank says "${m.questionBankAnswer}", answer key says "${m.answerKeyAnswer}"`));
    console.log('  Fix the source sheet and re-run; these were not imported.');
  }
}

connectDB()
  .then(run)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  });
