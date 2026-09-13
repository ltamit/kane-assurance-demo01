# Kane CLI Assurance — Agentic STLC Demo

A ready-to-fork demo repository that maps Kane CLI Assurance to every phase of the Software Testing Lifecycle. Each STLC phase is a separate GitHub Actions workflow — run them individually to demonstrate specific phases, or use the orchestrator to run everything end-to-end.

**Public URL to be tested - https://app-alpha-ten-25.vercel.app**

## The STLC → GitHub Actions mapping

| # | STLC Phase | Workflow | Kane CLI Commands | What the prospect sees |
|---|-----------|----------|-------------------|----------------------|
| 1 | Requirements Analysis | `1-requirements-analysis.yml` | `context ingest` + `context extract` | AI reads the PRD, extracts cited use-cases |
| 2 | Test Planning | `2-test-planning.yml` | `context review` + `cover gaps` | Human review gate + risk-ranked gap analysis |
| 3 | Test Design | `3-test-design.yml` | `design tests` | AI designs ACs, scenarios, and traced tests |
| 4 | Test Development | `4-test-development.yml` | `testmd run` | Agent authors tests in a real browser |
| 5 | Test Execution | `5-test-execution.yml` | `testrun run` + HyperExecute | Batch replay with sealed evidence packs |
| 6 | Coverage & Reporting | `6-coverage-reporting.yml` | `cover` + `cover gaps` | Two-axis coverage: proven vs owed |
| 7 | Maintenance | `7-maintenance.yml` | `maintain reconcile` + `maintain evolve` | PRD changed → suite adapts automatically |
| All | Full pipeline | `run-all-stlc-demo.yml` | All of the above | End-to-end in one click |

## Quick start

### 1. Fork this repo

### 2. Add secrets

**Settings → Secrets → Actions:**

| Secret | Required | Where to find it |
|--------|----------|-----------------|
| `LT_USERNAME` | Yes | TestMu AI dashboard → Settings → Keys |
| `LT_ACCESS_KEY` | Yes | Same page |
| `VERCEL_TOKEN` | Optional | For auto-deploying the ShopEasy app |
| `VERCEL_ORG_ID` | Optional | Vercel dashboard → Settings |
| `VERCEL_PROJECT_ID` | Optional | Vercel project settings |

### 3. Choose your demo path

**Path A — Run everything at once:**

Actions → "Run All · Full STLC Demo" → Run workflow

This executes phases 1-6 in sequence. Then manually trigger workflow 7 with `prd-checkout-v2.md` to show the maintenance story.

**Path B — Phase by phase (recommended for live demos):**

Run each workflow individually. This gives you time to explain what's happening between phases, show the artifacts, and answer questions.

### 4. The maintenance demo (the closer)

After phases 1-6 complete with `prd-checkout.md` (v1):

1. Go to Actions → "7 · Maintenance"
2. Set action to `reconcile`
3. Set new_prd to `docs/prd-checkout-v2.md`
4. Run it

The v2 PRD adds Apple Pay support to FR-4 and adds a new FR-8 (Save Cart for Later). The changeset will show:
- `[MODIFY] uc-make-a-payment` — Apple Pay added
- `[ADD] uc-save-cart-for-later` — new use-case
- `[ADD] uc-apple-pay-specific-flow` — new use-case

Then run workflow 6 again — the coverage report now shows gaps for the new requirements. This is the "test rot is structurally impossible" moment.

## Repository structure

```
.
├── .github/workflows/
│   ├── 0-setup-deploy.yml              ← deploy ShopEasy app
│   ├── 1-requirements-analysis.yml     ← ingest + extract
│   ├── 2-test-planning.yml             ← review + gaps
│   ├── 3-test-design.yml               ← design tests
│   ├── 4-test-development.yml          ← testmd run (author)
│   ├── 5-test-execution.yml            ← testrun run (batch)
│   ├── 6-coverage-reporting.yml        ← cover + gaps
│   ├── 7-maintenance.yml               ← reconcile + evolve
│   └── run-all-stlc-demo.yml           ← orchestrator
├── app/                                ← ShopEasy Next.js app (build separately)
├── docs/
│   ├── prd-checkout.md                 ← v1 PRD (original)
│   └── prd-checkout-v2.md              ← v2 PRD (Apple Pay + Save for Later)
├── scripts/
│   └── run-demo.sh                     ← run everything locally
└── README.md
```

## Building the ShopEasy app

The `app/` directory is where the ShopEasy checkout app lives. To build it:

1. Use the prompt in `docs/shopeasy-build-prompt.md` (or ask Claude Code / Cursor to build it)
2. The app should run with `cd app && npm install && npm run dev`
3. Deploy to Vercel or run locally for test execution

The app isn't required for phases 1-3 and 6 — those work purely from the PRD document. You need a running app for phases 4 and 5 (test authoring and execution).

## Demo script (10-minute version)

### Opening (2 min)
> "Let me show you how Kane CLI Assurance maps to your testing lifecycle. We have a sample PRD for an e-commerce checkout — the kind of document your PM already writes."

Show `docs/prd-checkout.md` in GitHub.

### Phase 1 — Requirements Analysis (2 min)
> "First, we feed the PRD to Kane CLI. An AI agent reads it and extracts use-cases — not by guessing, but by citing exact lines from your document."

Trigger workflow 1. While it runs, point out:
- The agent cites everything
- Ambiguities get clarifying questions
- The output is structured use-cases, not a wall of text

### Phase 2 — Test Planning (1 min)
> "Now we review what the AI proposed. Nothing moves forward without human approval."

Trigger workflow 2. Show the gap analysis — "these are the requirements that don't have tests yet, ranked by risk."

### Phase 3 — Test Design (2 min)
> "For each approved use-case, the AI designs tests — acceptance criteria, scenarios, and one runnable test per scenario."

Trigger workflow 3. Show a sample test file — point out `@verifies` tags.

### Phase 6 — Coverage Report (1 min)
> "This replaces your RTM spreadsheet. Two questions answered: what's designed, and what's proven."

Trigger workflow 6. **This is the money slide.**

### Phase 7 — Maintenance (2 min)
> "Now the PM adds Apple Pay support to the PRD. Watch what happens."

Trigger workflow 7 with `prd-checkout-v2.md`. Show:
- The changeset (MODIFY, ADD)
- Stale markers on affected use-cases
- New gaps in the coverage report

> "Six months from now, when the auditor asks 'how do we know Apple Pay works as specified?' — the answer is in the graph. Not in someone's head."

## Demo script (30-minute deep dive)

Run all 7 phases individually with time between each to:
- Download and show artifacts (especially `context-graph.html`)
- Show the `design explain` output for a test
- Show evidence packs from test execution
- Walk through the reconcile changeset card by card
- Open the coverage dossier for a specific use-case

## Running locally

```bash
# Prerequisites
npm install -g @testmuai/kane-cli
export LT_USERNAME="your-username"
export LT_ACCESS_KEY="your-access-key"
kane-cli login --username "$LT_USERNAME" --access-key "$LT_ACCESS_KEY"

# Full demo
chmod +x scripts/run-demo.sh
./scripts/run-demo.sh docs/prd-checkout.md prd-checkout http://localhost:3000

# Maintenance demo (after full demo)
./scripts/run-demo.sh docs/prd-checkout-v2.md prd-checkout http://localhost:3000
```

## Customizing for a specific prospect

1. **Replace the PRD** — drop the prospect's own requirement doc into `docs/`
2. **Update workflow defaults** — change `source_file` and `source_id` in each workflow
3. **Adjust test budget** — change `max_tests` default (more tests = longer demo, more coverage)
4. **Add their integration** — if they use Jira/Confluence, point ingest at their URL instead of a file

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Workflow fails at authentication | Verify `LT_USERNAME` and `LT_ACCESS_KEY` secrets |
| Extract produces no use-cases | Check that the PRD file path is correct |
| Test authoring fails | Ensure Chrome is installed (workflow installs it) and app URL is reachable |
| Cache issues between workflows | Delete caches from Actions → Caches, re-run from phase 1 |
| Coverage report shows no evidence | Run phases 4 and 5 with a live app first |
| Reconcile shows "nothing to reconcile" | The PRD hasn't changed — use `prd-checkout-v2.md` |
