/**
 * The autonomous QA agent.
 *
 *   OBSERVE → PLAN → WRITE → RUN → REFLECT/HEAL → REPORT
 *
 * No human in the loop: it decides what to test, writes the code, runs it,
 * reads its own failures, fixes its own mistakes, tells real bugs apart from
 * broken tests, and writes a report. Guardrails (guardrails.ts) keep it honest.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { observeSite, snapshotsToText } from './observe';
import { ask, askJson, stripFences, llmCallsUsed } from './llm';
import { PLANNER, WRITER, HEALER } from './prompts';
import { LIMITS, GENERATED_DIR, assertSafePath, canBeAppBug, checkCode, isWeakened } from './guardrails';
import { writeReport, type Outcome } from './report';

interface Scenario {
  id: string;
  title: string;
  user: string;
  steps: string[];
  expected: string;
}

interface RunResult {
  passed: boolean;
  error: string;
}

// ---------- RUN: execute one test file and read the JSON result ----------
function runTest(file: string): RunResult {
  const jsonOut = path.resolve('agent-output', `run-${path.basename(file)}.json`);
  fs.rmSync(jsonOut, { force: true }); // never read a stale result from a previous attempt
  // run Playwright's CLI with node directly: no shell, so it works the same on Windows and Linux
  const cli = path.resolve('node_modules', '@playwright', 'test', 'cli.js');
  // Playwright treats the file argument as a regex, so Windows backslashes must become forward slashes
  const filter = file.split(path.sep).join('/');
  spawnSync(process.execPath, [cli, 'test', filter, '--reporter=json'], {
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: jsonOut },
    encoding: 'utf8',
  });
  if (!fs.existsSync(jsonOut)) return { passed: false, error: 'Playwright produced no result (syntax error?)' };

  const report = JSON.parse(fs.readFileSync(jsonOut, 'utf8'));
  const errors: string[] = [];
  let failed = report.errors?.length > 0; // e.g. TypeScript/compile errors
  for (const e of report.errors ?? []) errors.push(e.message ?? String(e));

  const walk = (suite: any) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        for (const r of t.results ?? []) {
          if (r.status !== 'passed') {
            failed = true;
            if (r.error?.message) errors.push(r.error.message);
          }
        }
      }
    }
    (suite.suites ?? []).forEach(walk);
  };
  (report.suites ?? []).forEach(walk);

  // strip terminal colour codes so the model gets clean text
  const error = errors.join('\n').replace(/\u001b\[[0-9;]*m/g, '').slice(0, 2500);
  return { passed: !failed, error };
}

/** Mark a test that exposes a real app bug with Playwright's test.fail() — honest, and it
 *  will alert us (by "unexpectedly passing") the day the bug is fixed. */
function markKnownBug(code: string, reason: string): string {
  const note = `test.fail(true, ${JSON.stringify('Known app bug found by AI agent: ' + reason)});`;
  return code.replace(/(async\s*\(\s*\{[^}]*\}\s*\)\s*=>\s*\{)/, `$1\n  ${note}`);
}

async function main() {
  fs.mkdirSync('agent-output', { recursive: true });
  // fresh start: remove last run's generated tests
  for (const f of fs.readdirSync(GENERATED_DIR)) if (f.endsWith('.spec.ts')) fs.rmSync(path.join(GENERATED_DIR, f));

  // 1. OBSERVE
  console.log('\n1️⃣  OBSERVE — looking at the site');
  const snapText = snapshotsToText(await observeSite());

  // 2. PLAN
  console.log('\n2️⃣  PLAN — deciding what to test');
  const plan = await askJson<{ scenarios: Scenario[] }>(
    PLANNER,
    `Propose exactly ${LIMITS.maxScenarios} scenarios.\n\n${snapText}`,
  );
  const scenarios = plan.scenarios.slice(0, LIMITS.maxScenarios);
  scenarios.forEach((s) => console.log(`  📝 ${s.title} (${s.user})`));

  const outcomes: Outcome[] = [];

  for (const s of scenarios) {
    const slug = s.id.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60);
    const file = path.join('tests/generated', `${slug}.spec.ts`);
    assertSafePath(file);
    console.log(`\n▶️  ${s.title}`);

    // 3. WRITE
    let code: string;
    try {
      code = stripFences(await ask(WRITER, `Scenario:\n${JSON.stringify(s, null, 2)}\n\nPage snapshots:\n${snapText}`));
    } catch (err: any) {
      // one unavailable/over-budget LLM call should cost this scenario, not the whole run
      console.log(`  🚧 AI unavailable while writing — skipped: ${err.message}`);
      outcomes.push({ title: s.title, file, status: 'quarantined', attempts: 0, notes: `AI unavailable: ${err.message}` });
      continue;
    }
    const problem = checkCode(code);
    if (problem) {
      console.log(`  🛑 guardrail rejected generated code: ${problem}`);
      outcomes.push({ title: s.title, file, status: 'rejected', attempts: 0, notes: problem });
      continue;
    }
    fs.writeFileSync(file, code);
    const original = code;

    // 4. RUN → 5. REFLECT/HEAL loop
    let result = runTest(file);
    let attempts = 0;
    let outcome: Outcome | null = null;
    let llmError = '';

    while (!result.passed && attempts < LIMITS.maxHealAttempts) {
      attempts++;
      console.log(`  ❌ failed — reflecting (attempt ${attempts}/${LIMITS.maxHealAttempts})`);
      let verdict: { verdict: string; reason: string; fixedCode?: string };
      try {
        verdict = await askJson(
          HEALER,
          `Scenario:\n${JSON.stringify(s)}\n\nTest code:\n${code}\n\nError:\n${result.error}\n\nPage snapshots:\n${snapText.slice(0, 8000)}`,
        );
      } catch (err: any) {
        llmError = `AI unavailable while healing: ${err.message}`;
        console.log(`  🚧 ${llmError}`);
        break; // falls through to quarantine below
      }

      if (verdict.verdict === 'app_bug' && !canBeAppBug(s.user)) {
        console.log(`  🛑 guardrail rejected "app bug" verdict: ${s.user} has no known defects`);
        continue; // try again; the budget still counts, and quarantine is the honest fallback
      }

      if (verdict.verdict === 'app_bug') {
        // prove it: with test.fail() added the run must "pass", i.e. the assertions really fail on the site
        fs.writeFileSync(file, markKnownBug(code, verdict.reason));
        if (!runTest(file).passed) {
          console.log(`  🛑 guardrail rejected "app bug" verdict: the test does not actually fail on the site`);
          fs.writeFileSync(file, code);
          continue;
        }
        console.log(`  🐞 real app bug: ${verdict.reason}`);
        outcome = { title: s.title, file, status: 'bug', attempts, notes: verdict.reason };
        break;
      }

      const fixed = stripFences(verdict.fixedCode ?? '');
      const bad = !fixed ? 'no fix returned' : checkCode(fixed) ?? (isWeakened(original, fixed) ? 'fix removed assertions (cheating)' : null);
      if (bad) {
        console.log(`  🛑 guardrail rejected the fix: ${bad}`);
        continue; // try again; the budget still counts
      }
      console.log(`  🔧 healing: ${verdict.reason}`);
      code = fixed;
      fs.writeFileSync(file, code);
      result = runTest(file);
    }

    if (!outcome) {
      if (result.passed) {
        console.log(attempts ? '  ✅ passed after self-healing' : '  ✅ passed first time');
        outcome = { title: s.title, file, status: attempts ? 'healed' : 'passed', attempts, notes: '' };
      } else {
        // could not fix it: quarantine so it doesn't pollute the suite
        const q = path.join('agent-output', 'quarantine', path.basename(file));
        fs.mkdirSync(path.dirname(q), { recursive: true });
        fs.renameSync(file, q);
        console.log('  🚧 could not heal — quarantined');
        outcome = { title: s.title, file: q, status: 'quarantined', attempts, notes: llmError || result.error.split('\n')[0] };
      }
    }
    outcomes.push(outcome);
  }

  // 6. REPORT
  console.log('\n6️⃣  REPORT');
  writeReport(outcomes, llmCallsUsed());
}

main().catch((err) => {
  console.error('Agent crashed:', err);
  process.exit(1);
});
