# 🤖 Sauce Demo AI QA Agent

[![AI QA Agent](https://github.com/alihaider121/sauce-demo-ai-qa-agent/actions/workflows/agent.yml/badge.svg)](https://github.com/alihaider121/sauce-demo-ai-qa-agent/actions/workflows/agent.yml)
[![Live report](https://img.shields.io/badge/report-live-2ea44f)](https://alihaider121.github.io/sauce-demo-ai-qa-agent/)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

**An AI agent that tests a website on its own.** It explores [saucedemo.com](https://www.saucedemo.com), decides what to test, writes Playwright tests, runs them, repairs the ones it got wrong, and reports real bugs, all without a human writing a line of test code. It runs every night on GitHub Actions and opens a pull request with its new tests for you to review.

<img src="docs/images/cover.png" alt="An AI agent that tests a website on its own" width="520">

---

## ✨ Results so far

- ✅ **Working tests written by AI.** Its tests are merged into the suite, which is **13/13 green** in the [live report](https://alihaider121.github.io/sauce-demo-ai-qa-agent/).
- 🐞 **Real bugs found and proven.** It detected Sauce Demo's planted `problem_user` defects (broken checkout form, broken sorting) and flagged them as bugs instead of bending the tests to pass.
- 🔁 **Fully autonomous pipeline.** Nightly run, then a pull request with new tests, then a report published to GitHub Pages.
- 🛡️ **Guardrails that caught the AI's mistakes.** Including a *false* bug report, which is why every "app bug" verdict must now be proven.
- 💸 **Runs on free AI.** Google Gemini's free tier with automatic model fallbacks, or GitHub Models.

## 📸 What it produces

| The agent opens its own pull requests | Every run publishes a test report |
|---|---|
| ![Pull request opened by the agent](docs/images/pull-request.png) | ![Playwright report, all tests passing](docs/images/test-report.png) |

---

## ⚙️ How it works

```
 ┌──────────┐   ┌────────┐   ┌────────┐   ┌───────┐   ┌──────────────┐   ┌──────────┐
 │ OBSERVE  │──▶│  PLAN  │──▶│ WRITE  │──▶│  RUN  │──▶│ REFLECT/HEAL │──▶│  REPORT  │
 │ read the │   │ AI     │   │ AI     │   │ Play- │   │ test bug→fix │   │ summary, │
 │ pages    │   │ picks  │   │ writes │   │ wright│   │ app bug→flag │   │ PR, site │
 └──────────┘   └────────┘   └────────┘   └───────┘   └──────┬───────┘   └──────────┘
                                              ▲              │ up to 3 fix attempts
                                              └──────────────┘
```

| Step | What happens | Code |
|---|---|---|
| **Observe** | Opens the key pages and records their accessibility tree and `data-test` ids | `agent/observe.ts` |
| **Plan** | The AI proposes new scenarios, avoiding ones already covered | `agent/run.ts`, `agent/prompts.ts` |
| **Write** | The AI writes one `.spec.ts` per scenario into `tests/generated/`. Existing tests are kept, so the suite grows | `agent/run.ts`, `agent/suite.ts` |
| **Run** | Playwright runs the test and the agent reads its verdict | `agent/runner.ts` |
| **Reflect / heal** | On failure, the AI decides whether it's a **test bug** (fix and rerun) or an **app bug** (mark it `test.fail()`) | `agent/run.ts` |
| **Report** | Markdown summary, HTML report on GitHub Pages, and a pull request with the new tests | `agent/report.ts`, workflow |

A test that exposes a real bug stays in the suite marked `test.fail()`: it keeps confirming the bug and will alert you the day the bug is fixed.

## 🛡️ Guardrails: why you can trust it

An agent with nobody watching needs rules it can't talk its way around (`agent/guardrails.ts`):

| Rule | Prevents |
|---|---|
| Writes only `.spec.ts` files inside `tests/generated/` | Touching anything else in the repo |
| A fix may not have fewer `expect()` checks than the original | "Fixing" a test by deleting its assertions |
| "App bug" is only allowed for accounts with planted defects, **and** the test must really fail on the live site when rerun | Invented bugs hiding broken tests forever |
| No `test.skip`, network mocking, file access, `{ force: true }` or `waitForTimeout` | Shortcuts that hide real problems |
| Budgets: scenarios per run, 3 fix attempts per test, a cap on AI calls | Runaway cost and quota use |
| Tests it can't fix are **quarantined**, and one AI outage skips only that scenario | A broken suite, or one failure sinking the whole run |

---

## 🚀 Quick start

**Requirements:** Node.js 22+, plus an API key for [Google Gemini](https://aistudio.google.com/apikey) (free) or a GitHub token with *Models: read*.

```bash
git clone https://github.com/alihaider121/sauce-demo-ai-qa-agent.git
cd sauce-demo-ai-qa-agent
npm install
npx playwright install chromium

npm run test:manual     # the 10 hand-written tests
cp .env.example .env    # then add your key (see Configuration)
npm run agent           # 🤖 run the agent
npm run report          # open the HTML report
```

### Run it on GitHub (nightly, hands-off)

1. Fork the repo.
2. **Settings → Pages → Source:** GitHub Actions.
3. **Settings → Actions → General:** tick *Allow GitHub Actions to create and approve pull requests*.
4. **Settings → Secrets and variables → Actions:** add the secret `LLM_API_KEY` and the variables `LLM_BASE_URL` and `MODEL` (see below). Skip this step to use GitHub Models instead.
5. **Actions → AI QA Agent → Run workflow.** After that it runs every night.

Pushes run only the hand-written tests. The AI runs on the nightly schedule or on demand, which saves quota.

## 🔧 Configuration

Set these in `.env` locally, or as repository secrets and variables in GitHub Actions.

| Variable | Google Gemini (used here) | GitHub Models |
|---|---|---|
| `LLM_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai/` | *(leave empty)* |
| `LLM_API_KEY` | your Gemini key | *(leave empty)* |
| `GITHUB_TOKEN` | — | token with *Models: read* (automatic in Actions) |
| `MODEL` | `gemini-3.7-flash,gemini-3.6-flash,gemini-3.8-flash` | `openai/gpt-4o-mini` |

| Optional | Default | Purpose |
|---|---|---|
| `MAX_SCENARIOS` | `5` | New tests per run |
| `MAX_LLM_CALLS` | `30` | AI call budget per run |
| `PW_CHANNEL` | *(empty)* | Use an installed browser, e.g. `msedge`, if the Chromium download is blocked |

`MODEL` accepts a comma-separated list: if one model is busy or rate-limited, the next is tried. Gemini's free tier allows about 20 requests per model per day, and a run uses roughly 12–15.

---

## 📁 Project structure

```
agent/
  run.ts          the agent loop: observe → plan → write → run → heal → report
  observe.ts      reads the site's pages for the AI
  prompts.ts      instructions for the planner, writer and healer
  llm.ts          AI client: any OpenAI-compatible API, retries, model fallbacks
  guardrails.ts   the rules above
  runner.ts       runs one test and reads Playwright's verdict
  suite.ts        existing AI tests, safe file names for new ones
  report.ts       the markdown summary
pages/            page objects: Login, Inventory, Cart, Checkout, SideMenu
tests/
  manual/         10 hand-written tests (the baseline)
  generated/      tests written by the agent, merged via pull requests
.github/workflows/agent.yml   nightly pipeline: tests → agent → report → PR
```

## 💡 Lessons learned

Building it surfaced problems that are typical for AI agents:

- **Never trust a claim you can check.** The AI once reported a bug that didn't exist, so bugs now have to be proven by a rerun.
- **A plausible result can still be wrong.** A Windows path bug made every test "fail" before it ran, and the AI confidently blamed the website.
- **Flaky tests come from timing.** A test passed locally but failed on CI because the single-page app changed its URL before its content. The fix is to wait for the element you're about to check, never to add a sleep.
- **Free tiers need fallbacks.** Busy models (503) and daily quotas (429) are routine, so the agent rotates models and never lets one outage sink a run.

## 🗺️ Roadmap

- [x] Autonomous nightly pipeline with pull requests and a published report
- [x] Proof-based bug detection and anti-cheating guardrails
- [x] Keep merged tests and grow the suite run by run
- [ ] Repair merged AI tests that start failing later
- [ ] Cover more of the site (product details, the other test accounts)

## 🧰 Tech stack

Playwright · TypeScript · Node.js · GitHub Actions · GitHub Pages · Google Gemini / GitHub Models (OpenAI-compatible API) · Page Object Model
