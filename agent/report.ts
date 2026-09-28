/** REPORT: turns the agent's work into a readable markdown summary. */
import fs from 'node:fs';

export interface Outcome {
  title: string;
  file: string;
  status: 'passed' | 'healed' | 'bug' | 'quarantined' | 'rejected';
  attempts: number;
  notes: string;
}

const ICON: Record<Outcome['status'], string> = {
  passed: '✅ Passed',
  healed: '🔧 Self-healed',
  bug: '🐞 App bug found',
  quarantined: '🚧 Quarantined',
  rejected: '🛑 Rejected by guardrail',
};

export function writeReport(outcomes: Outcome[], llmCalls: number) {
  const count = (s: Outcome['status']) => outcomes.filter((o) => o.status === s).length;
  const esc = (t: string) => t.replace(/\|/g, '\\|').replace(/\n/g, ' ');

  const md = [
    '# 🤖 AI QA Agent Report',
    '',
    `Target: https://www.saucedemo.com · Run: ${new Date().toISOString()} · LLM calls used: ${llmCalls}`,
    '',
    `| Generated | Passed | Self-healed | Bugs found | Quarantined | Rejected |`,
    `|---|---|---|---|---|---|`,
    `| ${outcomes.length} | ${count('passed')} | ${count('healed')} | ${count('bug')} | ${count('quarantined')} | ${count('rejected')} |`,
    '',
    '## Details',
    '',
    '| Test | Result | Heal attempts | Notes |',
    '|---|---|---|---|',
    ...outcomes.map((o) => `| ${esc(o.title)} | ${ICON[o.status]} | ${o.attempts} | ${esc(o.notes) || '—'} |`),
    '',
  ].join('\n');

  fs.writeFileSync('agent-output/summary.md', md);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  console.log('\n' + md);
}
