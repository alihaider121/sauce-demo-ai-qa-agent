# Sauce Demo AI QA Agent – Project Progress Summary

## 1. What this project is

This repository is an autonomous AI-powered QA project built around Playwright and Sauce Demo.

The project aims to:

- observe the UI
- plan valuable test scenarios
- generate Playwright tests automatically
- execute thema
- decide whether a failure is a test bug or an app bug
- self-heal broken tests
- produce a report with results

This is not just a normal Playwright suite. It is designed to behave like a small AI QA agent.

---

## 2. What has already been built

### Core project setup

- Playwright configuration created
- TypeScript config created
- package scripts defined
- GitHub workflow scaffold created
- environment template created
- project structure prepared

### Page Object Model

The project already contains useful page objects:

- LoginPage.ts
- InventoryPage.ts
- CheckoutPage.ts
- CartPage.ts

These objects keep selectors in one place and make tests cleaner, easier to maintain, and easier to extend.

### Manual tests

The project already includes handwritten tests for the main flows:

- login
- locked-out user
- wrong password
- cart badge update
- purchase flow
- required first name validation
- problem-user flow

### AI agent logic

The autonomous agent is already partially implemented with:

- observe.ts
- prompts.ts
- llm.ts
- guardrails.ts
- run.ts
- report.ts

This is the heart of the project because it simulates the agent's full loop:

1. observe UI
2. plan tests
3. write test code
4. run test
5. determine real bug vs bad test
6. heal or quarantine
7. report results

---

## 3. File-by-file explanation

### playright.config.ts

This is the main Playwright config.

It sets:

- base URL for Sauce Demo
- test directory
- browser target
- HTML and JSON reporting
- test ID attribute as data-test

### pages/LoginPage.ts

Responsible for the login interactions.

Contains:

- username locator
- password locator
- login button
- error message

### pages/InventoryPage.ts

Handles inventory page actions, including:

- page title
- cart badge
- open cart
- add item to cart

### pages/CheckoutPage.ts

Handles checkout steps and validations, such as:

- continue checkout
- fill personal information
- finish order
- confirm order completion

### pages/CartPage.ts

Built to support cart-specific flows:

- list cart items
- open checkout
- remove items

### tests/manual/login.spec.ts

Checks standard login scenarios and validation cases.

### tests/manual/checkout.spec.ts

Checks cart and checkout behavior.

### tests/manual/problem-user.spec.ts

Checks the deliberate bug-user path, which is very relevant to this project because the site includes intentional defects.

### agent/observe.ts

This is the observation layer.

It navigates the site and records accessibility snapshots and data-test IDs so the model can understand the UI.

### agent/prompts.ts

Stores the prompts for:

- planning test scenarios
- writing Playwright tests
- healing failing tests

### agent/llm.ts

Connects to GitHub Models using the OpenAI-compatible API.

It handles:

- token setup
- model request calls
- retry logic for rate limits
- response cleanup

### agent/guardrails.ts

This file protects the agent from bad behavior.

It enforces:

- only write in the generated tests folder
- must contain valid Playwright assertions
- no prohibited patterns like test.skip or mocking
- only allow Sauce Demo URLs
- prevent weakened tests that remove assertions

### agent/run.ts

This is the orchestration engine for the AI agent.

This is the main script that runs the loop and decides what to do with each generated test.

### agent/report.ts

This converts outcomes into a final report.

It records:

- passed tests
- healed tests
- app bugs
- quarantined tests
- rejected tests

---

## 4. What is already complete

The project is already at a solid foundation stage.

It includes:

- full Playwright config
- page object abstraction
- manual test files
- AI agent architecture
- guardrails
- auto-reporting logic

This means the project is not empty; it is a functioning starter project.

---

## 5. What remains to finish the project

The remaining work is mostly execution and validation:

1. install the Playwright browser runtime cleanly
2. run the manual tests
3. configure the environment token
4. run the AI agent once
5. inspect the generated tests
6. review the summary report
7. push to GitHub
8. enable GitHub Actions and GitHub Pages

---

## 6. Recommended next steps

### Step 1: local validation

Run:

```bash
npm install
npx playwright install chromium
npx playwright test tests/manual --reporter=list
```

### Step 2: configure the GitHub token

Create .env from .env.example and add a token with Models: read permission.

### Step 3: run the AI agent

```bash
npm run agent
```

### Step 4: inspect generated tests

Look under the tests/generated folder and review the generated Playwright code.

### Step 5: open the HTML report

```bash
npm run report
```

### Step 6: deploy and automate

Push to GitHub and configure the workflow for nightly execution.

---

## 7. Overall conclusion

This project already demonstrates a strong, well-structured approach to autonomous test generation using Playwright and AI.

The main value is in the agent architecture and the guardrails, because they ensure the system tries to behave like a real QA engineer and not just generate random meaningless tests.

The next step is not to build the project from scratch again — it is to validate the runtime environment and execute the first real agent run.
