# Kane CLI Assurance - Local Execution (Direct Commands)

Direct `kane-cli` commands, no wrapper script. Copy-paste each block in order
into Git Bash **from the workspace directory** (the same one the CI workflow
uses, so `.context/` and `.testmuai/` are shared - typically
`C:\actions-runner\_work\<repo>\<repo>\`).

## Before you start

- Work in the shared workspace directory (see above) - not a separate clone.
- Never wrap a `kane-cli` call in `$(...)` or pipe its output directly. This
  is what triggered a Windows/Node crash repeatedly during earlier testing.
  Redirect to a file with `>` if you need to capture something, or let it
  print straight to your terminal.
- A line like `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`
  appearing right after a command's normal output is usually cosmetic - a
  known Node/libuv bug on Windows that fires during process exit, after the
  real work already succeeded. Check the output above it before assuming
  the command actually failed.
- Put your own variable values in `.testmuai/variables/zz-fixtures.json`,
  **never** in `assurance.json` - `design tests` owns and regenerates that
  file. Every `*.json` file in `.testmuai/variables/` loads alphabetically,
  later files override earlier ones for duplicate keys, so
  `zz-fixtures.json` always wins.

---

## Phase 1 - Requirements Analysis

```bash
kane-cli context ingest "./docs/prd-checkout.md" --as "prd-checkout" --mode ci
kane-cli context extract --mode override --source "prd-checkout"
kane-cli context list
```

## Phase 2 - Test Planning

```bash
kane-cli context list --json > all-items.json
jq -s '[.[] | select(.trust == "derived") | {ref: (.ref // .id), resolution: "approved"}]' all-items.json > verdicts.json
kane-cli context review --verdicts verdicts.json
kane-cli cover gaps
```

## Phase 3 - Test Design

Design one use-case at a time (fast - swap `uc-1` for whichever you want):

```bash
kane-cli design tests --use-case uc-1 --mode override --max 2 --allow-unreviewed
```

If it pauses (exit code 3, prints `paused — resume with: ...`):

```bash
kane-cli context sessions --json
# grab the session id from the output, then:
kane-cli design tests --resume <session-id> --mode override
```

Approve what got designed:

```bash
kane-cli context list --json > post-design.json
jq -s '[.[] | select(.trust == "derived") | {ref: (.ref // .id), resolution: "approved"}]' post-design.json > verdicts.json
kane-cli context review --verdicts verdicts.json
```

## Phase 4 - Test Development

Chrome opens visibly, one command per test file:

```bash
kane-cli testmd run .testmuai/tests/<test-file>_test.md --url "https://app-alpha-ten-25.vercel.app"
```

Repeat for each test file in `.testmuai/tests/`. If it reports
`unresolved_variables`:

1. Open the named test file and read the step text to understand what the
   variable represents.
2. Add the value to `.testmuai/variables/zz-fixtures.json`.
3. Re-run the same `kane-cli testmd run ...` command for that file.

## Phase 5 - Test Execution

```bash
kane-cli testrun run --match "t-" --url "https://app-alpha-ten-25.vercel.app"
```

## Phase 6 - Coverage & Reporting

```bash
kane-cli cover
kane-cli cover gaps
```

## Phase 7 - Maintenance (only for the PRD-change demo)

```bash
kane-cli maintain reconcile --from "./docs/prd-checkout-v2.md" --source-id "prd-checkout" --mode override
kane-cli cover gaps
```
