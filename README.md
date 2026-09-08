# Control Architect

An interactive, bilingual (Thai/English) web-based cybersecurity learning game for **Chapter 4:
Security Design Principles, Controls, Access Control Models, and Requirements** (305331/316331,
Naresuan University). Unlike Social Signal Desk's classify-and-defend loop, Control Architect is a
**building** game: players assemble principles, control types, defense layers, access-model tags,
and a testable requirement — all for the same Student Project Portal case used across the 305331
textbook.

## Features

- **5 stages, one per MLO (4.1–4.5)**: match design principles to a risk, sort controls by
  function and nature, build a defense-in-depth stack, tag a policy's clauses with the right
  access-control concept, and turn a vague requirement into a testable one.
- **Bilingual by design**: every scenario, option, and UI label ships as `{ th, en }` pairs, same
  technical pattern as `social-signal-desk/i18n.js`. A toggle in the top bar switches instantly;
  `?lang=th` or `?lang=en` sets the starting language.
- **Two hard-coded teaching rules, not just partial credit**:
  - Stage 2 accepts more than one correct (function, nature) combination per control — the
    chapter is explicit that "a single measure may legitimately have more than one role," so the
    scoring recognizes multi-role answers as fully correct rather than penalizing them.
  - Stage 3 flags any defense stack with fewer than 3 layers, or whose layers all address the same
    dimension (reduce likelihood / limit impact / enable recovery), as a single point of failure —
    scoring it zero rather than as a passing "layered" defense. This operationalizes the chapter's
    own point that defense in depth "does not mean adding as many controls as possible."
- **A capped multi-select for Stage 1**: picking a design principle when two are already chosen
  bumps the oldest choice out (first-in-first-out), so the "choose exactly 2" constraint from the
  chapter's own exercise is enforced by the UI itself, not just by scoring.
- **Pure client-side code**: vanilla HTML, CSS, and JS. No build step, no backend, no analytics
  wiring.

## Structure

```
control-architect/
├── index.html         # Shell: start screen, stage screen, results screen, certificate modal
├── styles.css         # "Blueprint" dark theme with a grid backdrop
├── i18n.js            # UI chrome strings (TH/EN) and language resolution (?lang=, localStorage)
├── game-core.js       # Scenario bank, scoring logic, learning-outcome evaluator (bilingual data)
├── app.js             # DOM controller, state machine, timer, stage renderers
├── game-core.test.js  # Unit test verifying scenario data and every scoring rule
└── teacher-guide.md   # CLO/MLO mapping and classroom delivery options
```

## How to Play

1. Start a local server from this folder:
   ```bash
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000` (or `http://localhost:8000?lang=th` to start in Thai).

## Run Tests

Verify scenario data integrity and scoring logic, including the multi-role acceptance and
single-point-of-failure rules:

```bash
node game-core.test.js
```
