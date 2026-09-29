/** RUN: execute one generated test with Playwright and read back its verdict. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export interface RunResult {
  passed: boolean;
  error: string;
}

export function runTest(file: string): RunResult {
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

  let testsRun = 0;
  const walk = (suite: any) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        testsRun++;
        // judge by Playwright's verdict, not the raw result: a test.fail() test that fails
        // has result status "failed" but test status "expected" — that is a pass
        if (t.status !== 'expected') {
          failed = true;
          for (const r of t.results ?? []) {
            if (r.error?.message) errors.push(r.error.message);
            else if (r.status === 'passed') errors.push('Test passed but was expected to fail (test.fail)');
          }
        }
      }
    }
    (suite.suites ?? []).forEach(walk);
  };
  (report.suites ?? []).forEach(walk);
  if (testsRun === 0) {
    failed = true;
    if (!errors.length) errors.push('No tests ran');
  }

  // strip terminal colour codes so the model gets clean text
  const error = errors.join('\n').replace(/\u001b\[[0-9;]*m/g, '').slice(0, 2500);
  return { passed: !failed, error };
}

/** Mark a test that exposes a real app bug with Playwright's test.fail() — honest, and it
 *  will alert us (by "unexpectedly passing") the day the bug is fixed. */
export function markKnownBug(code: string, reason: string): string {
  const note = `test.fail(true, ${JSON.stringify('Known app bug found by AI agent: ' + reason)});`;
  return code.replace(/(async\s*\(\s*\{[^}]*\}\s*\)\s*=>\s*\{)/, `$1\n  ${note}`);
}
