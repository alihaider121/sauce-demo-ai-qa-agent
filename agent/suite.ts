/** The AI-written part of the suite (tests/generated/): what is already there, and safe names for new tests. */
import fs from 'node:fs';
import path from 'node:path';
import { GENERATED_DIR } from './guardrails';

/** Titles of the AI-written tests already in tests/generated/, so the planner can avoid duplicates. */
export function existingTestTitles(): string[] {
  return fs
    .readdirSync(GENERATED_DIR)
    .filter((f) => f.endsWith('.spec.ts'))
    .flatMap((f) => {
      const code = fs.readFileSync(path.join(GENERATED_DIR, f), 'utf8');
      return [...code.matchAll(/\btest\(\s*(['"`])(.+?)\1/g)].map((m) => m[2]);
    });
}

/** A file name for a new scenario that never overwrites an existing test. */
export function freeFileName(id: string): string {
  const slug = id.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60);
  let file = path.join('tests/generated', `${slug}.spec.ts`);
  for (let n = 2; fs.existsSync(file); n++) file = path.join('tests/generated', `${slug}-${n}.spec.ts`);
  return file;
}
