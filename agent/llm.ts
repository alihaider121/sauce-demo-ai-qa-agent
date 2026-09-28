/**
 * The agent's "brain": a thin wrapper around GitHub Models.
 *
 * GitHub Models speaks the OpenAI API, so we use the official `openai` package
 * and just point it at GitHub's endpoint. In GitHub Actions the built-in
 * GITHUB_TOKEN works (with `permissions: models: read`), so no API key is needed.
 *
 * Any other OpenAI-compatible provider works too: set LLM_BASE_URL + LLM_API_KEY
 * (and MODEL to one of that provider's model names).
 */
import OpenAI from 'openai';
import 'dotenv/config';
import { LIMITS } from './guardrails';

const BASE_URL = process.env.LLM_BASE_URL || 'https://models.github.ai/inference';
const token = process.env.LLM_API_KEY || process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error(
    'No LLM key set. Locally: copy .env.example to .env and add a GITHUB_TOKEN with "Models: read" ' +
      '(or LLM_BASE_URL + LLM_API_KEY for another provider). ' +
      'In GitHub Actions: add `permissions: models: read` to the workflow.',
  );
}

const client = new OpenAI({
  baseURL: BASE_URL,
  apiKey: token,
});

// MODEL may list fallbacks, e.g. "gemini-3.6-flash,gemini-3.8-flash": a busy model hands over to the next one.
const MODELS = (process.env.MODEL || 'openai/gpt-4o-mini').split(',').map((m) => m.trim()).filter(Boolean);
const MAX_ATTEMPTS = 4 * MODELS.length;
let callsUsed = 0;

export function llmCallsUsed() {
  return callsUsed;
}

/** Ask the model something. Set json=true to force a JSON object reply. */
export async function ask(system: string, user: string, json = false): Promise<string> {
  if (callsUsed >= LIMITS.maxLlmCalls) {
    throw new Error(`Guardrail: LLM call budget of ${LIMITS.maxLlmCalls} used up`);
  }
  callsUsed++;

  // Free tiers have per-minute limits and busy spells, so retry politely.
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const model = MODELS[(attempt - 1) % MODELS.length];
    try {
      const res = await client.chat.completions.create({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        ...(json ? { response_format: { type: 'json_object' as const } } : {}),
      });
      if (!Array.isArray(res?.choices)) {
        // e.g. a proxy or unavailable service answering 200 with plain text instead of a completion
        throw new Error(
          `LLM endpoint ${BASE_URL} did not return a chat completion (got: ${JSON.stringify(res).slice(0, 200)}). ` +
            'Check the service is reachable from this network, or set LLM_BASE_URL/LLM_API_KEY to another provider.',
        );
      }
      return res.choices[0]?.message?.content ?? '';
    } catch (err: any) {
      // 429 = rate limited; 500/502/503 = provider temporarily overloaded
      if ([429, 500, 502, 503].includes(err?.status) && attempt < MAX_ATTEMPTS) {
        const why = err.status === 429 ? 'rate limited' : `busy (${err.status})`;
        if (attempt % MODELS.length !== 0) {
          console.log(`  ↪️  ${model} ${why}, trying the next model...`);
          continue;
        }
        // every model refused: back off longer after each full round
        const wait = 15_000 * (attempt / MODELS.length);
        console.log(`  ⏳ ${model} ${why}, waiting ${wait / 1000}s...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}

/** Ask for JSON and parse it. */
export async function askJson<T>(system: string, user: string): Promise<T> {
  const text = await ask(system, user, true);
  return JSON.parse(stripFences(text)) as T;
}

/** Models love wrapping code in ```ts fences — remove them. */
export function stripFences(text: string): string {
  const m = text.match(/```(?:\w+)?\s*\n([\s\S]*?)```/);
  return (m ? m[1] : text).trim();
}
