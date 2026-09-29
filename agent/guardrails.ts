/**
 * Guardrails: the rules that keep an autonomous agent safe and honest.
 * An agent with no human in the loop needs hard limits it cannot talk its way past.
 */
import path from 'node:path';

export const LIMITS = {
  maxScenarios: Number(process.env.MAX_SCENARIOS || 5), // tests to generate per run
  maxHealAttempts: 3, // fix attempts per failing test
  maxLlmCalls: Number(process.env.MAX_LLM_CALLS || 30), // stays well inside the free tier
};

export const GENERATED_DIR = path.resolve('tests/generated');

/** Rule 1: the agent may only write inside tests/generated/. */
export function assertSafePath(file: string) {
  const resolved = path.resolve(file);
  if (!resolved.startsWith(GENERATED_DIR + path.sep)) {
    throw new Error(`Guardrail: refused to write outside tests/generated: ${file}`);
  }
  if (!resolved.endsWith('.spec.ts')) {
    throw new Error(`Guardrail: generated files must be .spec.ts: ${file}`);
  }
}

/** Rule 2: generated code must look like a Playwright test and stay on saucedemo.com. */
export function checkCode(code: string): string | null {
  if (!code.includes("from '@playwright/test'") && !code.includes('from "@playwright/test"')) {
    return 'must import from @playwright/test';
  }
  if (!/\bexpect\(/.test(code)) return 'must contain at least one expect() assertion';
  if (/test\.(skip|fixme|only)\b/.test(code)) return 'must not use test.skip / test.fixme / test.only';
  if (/page\.route\(|child_process|fs\./.test(code)) return 'must not mock the network or touch the file system';
  // force skips Playwright's "is it really clickable?" checks; fixed sleeps hide timing bugs
  if (/force\s*:\s*true|waitForTimeout\(/.test(code)) return 'must not use { force: true } or waitForTimeout';
  const gotos = [...code.matchAll(/goto\(\s*['"`](https?:\/\/[^'"`]+)/g)].map((m) => m[1]);
  if (gotos.some((u) => !u.includes('saucedemo.com'))) return 'must only visit saucedemo.com';
  return null;
}

/**
 * Rule 4: only these users have deliberate defects on Sauce Demo, so only their tests
 * may be flagged as "app bug". For anyone else an "app bug" verdict is far more likely
 * a broken test the model gave up on — accepting it would hide it behind test.fail() forever.
 */
export const DEFECT_USERS = ['problem_user', 'error_user', 'visual_user', 'performance_glitch_user'];

export function canBeAppBug(user: string): boolean {
  return DEFECT_USERS.includes(user);
}

/**
 * Rule 3 (the important one): a "fix" must not cheat.
 * An agent can always make a test pass by deleting its assertions.
 * We reject any healed version that has fewer expect() calls than the original.
 */
export function isWeakened(original: string, healed: string): boolean {
  const count = (s: string) => (s.match(/\bexpect\(/g) || []).length;
  return count(healed) < count(original);
}
