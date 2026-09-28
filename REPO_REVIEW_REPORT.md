# Sauce Demo AI QA Agent — Repository Review Report

**Date:** 2026-09-28
**Scope:** Full review of the repository's code and configuration, plus a local check of whether it builds and runs.

---

## 1. Summary

This project is an **autonomous AI QA agent** for [saucedemo.com](https://www.saucedemo.com). It decides what to test, writes Playwright tests, runs them, repairs its own broken tests, recognises real app bugs, and publishes a report. It runs nightly in GitHub Actions and uses **GitHub Models** (free tier, `openai/gpt-4o-mini`) as its LLM.

| Area | Status at review | Status now (end of 2026-09-28) |
|---|---|---|
| Code complete | ✅ All agent stages are implemented | ✅ Plus the hardening listed in section 8 |
| TypeScript typecheck (`tsc --noEmit`) | ✅ Passes, 0 errors | ✅ Passes |
| Dependencies installed | ✅ `node_modules` present | ✅ |
| Playwright browser | ❌ Download of Chromium timed out | ✅ Uses the installed Edge (`PW_CHANNEL=msedge`) |
| Hand-written tests (8) | ❌ All fail, only because no browser is installed | ✅ 8/8 pass |
| `.env` / LLM access | ❌ Not created | ✅ Gemini configured (GitHub Models unreachable locally) |
| Agent end-to-end run | — | ⚠️ Runs to completion; clean run pending on the Gemini daily quota |
| Git repository | ❌ Not initialised | ✅ Initialised, first commit on `main` |
| GitHub Actions workflow | ⚠️ Exists but sits in the wrong folder | ✅ In `.github/workflows/`, supports Gemini |

**Bottom line at review:** the code was essentially finished. What was left was **environment setup, a first real run, and publishing to GitHub**. Progress since then is in section 8.

---

## 2. How the agent works

```
OBSERVE ──▶ PLAN ──▶ WRITE ──▶ RUN ──▶ REFLECT / HEAL ──▶ REPORT
                                ▲            │
                                └── fix ─────┘  (max 3 attempts)
```

| Stage | File | What happens |
|---|---|---|
| Observe | `agent/observe.ts` | Opens Login, Inventory, Product detail, Cart and Checkout pages; captures the accessibility snapshot and all `data-test` ids |
| Plan | `agent/run.ts` + `agent/prompts.ts` | The LLM proposes N test scenarios as JSON (default 5) |
| Write | `agent/run.ts` | The LLM writes one `.spec.ts` per scenario into `tests/generated/` |
| Run | `agent/run.ts` → `runTest()` | Runs Playwright with the JSON reporter and parses the pass/fail status and error messages |
| Reflect / Heal | `agent/run.ts` + `HEALER` prompt | The LLM decides whether the failure is a `test_bug` (fix the test and rerun) or an `app_bug` (mark the test `test.fail()`) |
| Quarantine | `agent/run.ts` | Tests still failing after 3 fix attempts move to `agent-output/quarantine/` |
| Report | `agent/report.ts` | Writes `agent-output/summary.md` and the GitHub job summary |

### Guardrails (`agent/guardrails.ts`)
- **Path:** the agent may write only `.spec.ts` files inside `tests/generated/`.
- **Code checks:** generated code must import `@playwright/test` and contain `expect()`. It must not use `test.skip`, `test.fixme`, `test.only`, `page.route`, `fs.` or `child_process`, and it may only visit saucedemo.com.
- **Anti-cheating:** a "fix" with fewer `expect()` calls than the original is rejected.
- **Budgets:** 5 scenarios per run, 3 heal attempts per test and 30 LLM calls per run (set by `MAX_SCENARIOS` / `MAX_LLM_CALLS`).

### LLM layer (`agent/llm.ts`)
- The official `openai` SDK points at `https://models.github.ai/inference`.
- The `GITHUB_TOKEN` is the API key; in CI the built-in token works with `permissions: models: read`.
- On HTTP 429 (rate limit) it retries after 15s, 30s and 45s.

---

## 3. Supporting code

| File | Purpose |
|---|---|
| `pages/LoginPage.ts` | Username and password fields, login button, error message |
| `pages/InventoryPage.ts` | Title, cart badge, cart link, sort dropdown, item names and prices, `addToCart()` |
| `pages/CartPage.ts` | Cart items, checkout, continue shopping, remove |
| `pages/CheckoutPage.ts` | Checkout info form, finish, completion header, error |
| `tests/manual/login.spec.ts` | Standard login, locked-out user, wrong password (3 tests) |
| `tests/manual/checkout.spec.ts` | Cart badge, full purchase, missing first name (3 tests) |
| `tests/manual/problem-user.spec.ts` | `problem_user` login and cart (2 tests) |
| `playwright.config.ts` | Base URL, `testIdAttribute: 'data-test'`, list/HTML/JSON reporters, Chromium, 0 retries |
| `MOVE-TO-.github-workflows/agent.yml` | Nightly, on-push and manual CI: baseline tests → agent → HTML report → GitHub Pages → PR |

---

## 4. Verification results (local run)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean |
| `npx playwright install chromium` | ❌ `Request to https://cdn.playwright.dev/... timed out after 30000ms` (5 retries) |
| `npx playwright test tests/manual` | ❌ 8 of 8 failed with "Executable doesn't exist" (the browser is missing, not a test bug) |
| `npm run agent` | Not run: no `GITHUB_TOKEN` and no browser |

---

## 5. Issues found

### High priority
1. **"App bug" verdicts are accepted without checking.** When the LLM says `app_bug`, the test gets `test.fail()` and stops there. If the LLM is wrong, a broken test will pass as an "expected failure" forever and hide real problems.
   *Suggestion:* only accept `app_bug` for users with known deliberate defects (`problem_user`, `error_user`, `visual_user`), or ask for a second confirming verdict.
2. **The workflow file is in the wrong place.** GitHub only reads `.github/workflows/`, so the workflow in `MOVE-TO-.github-workflows/` will never run.

### Medium priority
3. **An old result file can be read as a new result.** `runTest()` never deletes the previous `agent-output/run-<file>.json`. If a rerun produces no output (for example, a crash), the result of the earlier attempt is read instead.
   *Fix:* call `fs.rmSync(jsonOut, { force: true })` before each run.
4. **The agent runs on every push to `main`.** Every commit uses up free-tier LLM quota, and the PR step is skipped for push runs anyway.
   *Suggestion:* trigger the agent only on `schedule` and `workflow_dispatch`, and run only the manual tests on push.

### Low priority
5. The README says "6 hand-written tests", but there are 8.
6. The README badge and report URL still contain `YOUR_USERNAME`.
7. There are typos in `PROJECT_PROGRESS_SUMMARY.md` ("thema", "playright.config.ts").

---

## 6. Recommended next steps

1. **Install the browser.** Run `npx playwright install chromium` on a stable connection. If it keeps timing out, add `channel: 'msedge'` to the chromium project in `playwright.config.ts` to use the Edge browser that comes with Windows.
2. **Check the baseline.** Run `npm run test:manual`; all 8 should pass.
3. **Configure the token.** Copy `.env.example` to `.env` and add a fine-grained GitHub token with **Models: read**.
4. **Run the agent once.** Run `npm run agent`, then review `agent-output/summary.md` and `tests/generated/`.
5. **Move the workflow.** Move `MOVE-TO-.github-workflows/agent.yml` to `.github/workflows/agent.yml`.
6. **Publish.** Run `git init`, commit and push to GitHub. Enable **Pages (Source: GitHub Actions)** and tick **Allow GitHub Actions to create and approve pull requests**, then run the workflow manually.
7. **Harden the agent.** Fix issues 1, 3 and 4 above.
8. **Polish.** Update the README placeholders and the test count.

---

## 7. Tech stack
Playwright · TypeScript · Node 22 · `tsx` · GitHub Actions · GitHub Pages · GitHub Models (OpenAI-compatible API) · Page Object Model

---

## 8. Progress log — 2026-09-28

### Issues from section 5
| # | Issue | Status |
|---|---|---|
| 1 | "App bug" verdicts accepted without checking | ✅ Fixed: only allowed for users with deliberate defects, and the test must really fail on the live site when rerun with `test.fail()` |
| 2 | Workflow in the wrong folder | ✅ Moved to `.github/workflows/agent.yml` |
| 3 | Stale result file read after a crash | ✅ Fixed: the result file is deleted before each run |
| 4 | Agent runs on every push | ✅ Fixed: pushes run only the hand-written tests |
| 5–6 | README test count and `YOUR_USERNAME` placeholders | ✅ Fixed |

### New problems found while running it, and fixed
| Problem | Fix |
|---|---|
| **Windows: Playwright found "No tests found"** because the file path had backslashes, which Playwright reads as a regex pattern. This was in the original code, and it made the AI waste every fix attempt and even report a **false app bug**. | The path now uses forward slashes, and Playwright's CLI is run through Node without a shell |
| `models.github.ai` answers every request from this network with a bare `200 OK` instead of a completion, so the agent crashed with `reading '0'` | Any OpenAI-compatible provider now works (`LLM_BASE_URL`, `LLM_API_KEY`), and a non-completion reply gives a clear error |
| `gemini-2.5-flash` no longer available to new users | Switched to the Gemini 3.x flash models |
| Gemini often returns "busy" (503) and allows only 20 requests per model per day | `MODEL` takes a comma-separated fallback list. Busy or rate-limited models hand over to the next one, and 500/502/503 are retried as well as 429 |
| One unavailable AI call crashed the whole run | That scenario is quarantined with a note and the run continues |
| Chromium download times out on this network | `PW_CHANNEL=msedge` uses the installed Edge for both the tests and the observe step |

### Remaining
- **Today:** first git commit, push to GitHub, enable Pages and pull-request permissions, and add the Gemini secret and variables.
- **After the quota resets:** a clean 5-scenario agent run, checking its results, then triggering the workflow on GitHub.
