# Instructor Guide: Control Architect

This guide covers learning alignment, mechanics, and classroom delivery for **Control Architect**,
built for Chapter 4 (Security Design Principles, Controls, Access Control Models, and Security
Requirements) of 305331/316331 Computer and Information Security.

---

## 1. Educational Alignment

| MLO | After this stage, learners can | Stage |
|---|---|---|
| MLO4.1 | Explain and match a security design principle to a risk | Stage 1: Design Principles |
| MLO4.2 | Classify a control by its function and technical/administrative/physical nature | Stage 2: Control Sort |
| MLO4.3 | Select a defense-in-depth control set, with trade-offs and residual risk | Stage 3: Layer Builder |
| MLO4.4 | Analyze resource protection using DAC, RBAC, MAC, ABAC, least privilege, and separation of duties | Stage 4: Access Model |
| MLO4.5 | Turn a risk into a testable security requirement, and gauge what a standard can and cannot do | Stage 5: Requirement Builder |

Most scenarios are synthetic and reuse the Student Project Portal case from the approved chapter
source (`textbook/lecture-notes/chapter-04/00-chapter.md`) — the grade-editing risk, the lost
submission file, the "is MFA alone enough" case, the course access policy, and the vague-requirement
rewrite are the chapter's own worked examples, not new inventions. Stage 2's four items are the
chapter's own `ตรวจความเข้าใจ 4.2` exercise items, and Stage 4's clauses are its `ตรวจความเข้าใจ 4.4`
policy text verbatim (translated for the English toggle). Stage 3's bank-account/research-grant
item (S3-2) is a synthetic elaboration of the chapter's defense-in-depth concepts rather than a
chapter example — the chapter itself never discusses banking or financial payouts.

---

## 2. Two rules that are not just "harder" scoring

- **Stage 2 — a control may legitimately need more than one tag.** The chapter states directly
  that "the same measure may have more than one role" (e.g. a course-deletion approval step is
  both preventive *and* detective). The scoring checks the full accepted set for each control, not
  a single best answer, and rewards getting the complete set right — this is a feature to highlight
  before play, not a trick.
- **Stage 3 — an insufficient stack always scores zero.** A defense set with fewer than 3 layers,
  or whose layers all address the same dimension (reduce likelihood / limit impact / enable
  recovery), is flagged as a single point of failure and scored zero regardless of how well each
  individual layer is tagged. This encodes the chapter's own warning that defense in depth "does
  not mean adding as many controls as possible" but means covering distinct failure modes.

## 3. Stage Mechanics

### Stage 1: Design Principles (3 items)
Read a risk, then choose exactly 2 of the 5 design principles (least privilege / defense in depth /
fail-safe defaults / separation of duties / economy of mechanism) that address it on different
dimensions — the UI enforces the "exactly 2" constraint by bumping the oldest pick when a third is
selected — then choose the correct trade-off of that pair.

### Stage 2: Control Sort (1 combined screen, 4 items)
For each of the chapter's four measures (MFA for instructors, a download log, a course-deletion
approval step, a grade backup), tag its function(s) (preventive/detective/corrective/recovery) and
nature(s) (technical/administrative/physical). Two of the four items have two correct functions or
natures at once, by design.

### Stage 3: Layer Builder (2 items)
Choose at least 3 control layers from a five-item palette, tag each as reducing likelihood, limiting
impact, or enabling recovery, then pick the correct residual risk and trade-off for that case. The
single-point-of-failure rule above applies before any partial credit is computed.

### Stage 4: Access Model (2 items)
Each policy is split into 3 clauses. Tag every clause with the access-control concept it actually
demonstrates (RBAC role assignment / ABAC — an object-level condition beyond RBAC / separation of
duties), with DAC and MAC always offered as plausible-looking distractors to check that students can
tell the four access-control models apart.

### Stage 5: Requirement Builder (2 items)
Given a vague requirement ("the system must protect student data well"), fill in the chapter's own
three-slot template — *the system must [behavior] to [protect asset/action] under [condition]* —
choosing the specific option in each slot rather than a vaguer-sounding one, then answer a bonus
question on what a standard like NIST SP 800-53 can and cannot do for the team.

---

## 4. Bilingual Use

Every scenario and UI string ships in Thai and English. Use the toggle in the top bar, or link
directly with `?lang=th` (305331 sections) or `?lang=en` (316331 sections) so each course's portal
entry point opens in its own default language. Switching language mid-item re-renders that item
fresh (a minor trade-off to keep the toggle simple); it never affects scores already recorded for
earlier items.

---

## 5. Classroom Delivery Strategies

### Option A: In-Class Icebreaker (10–15 minutes)
Run individually at the start of the Controls and Access Models week, before presenting the formal
definitions. Debrief by asking which item triggered the single-point-of-failure warning, and what a
better 3-layer answer would have looked like.

### Option B: Competitive Score Attack (20–25 minutes)
Students race for points, which combine per-item accuracy with a speed bonus. Award the top three
"Control Architect" ranks. Because Stage 5 rewards specificity over confident-sounding vagueness,
this stage tends to separate students who can write a testable requirement from those who cannot.

### Option C: Assessment & Evidence Collection
After finishing, students click "Generate certificate" to produce a one-page summary (name, ID,
date, rank, overall accuracy, and a verification signature) that they print or save as PDF and
submit with their chapter worksheet.
