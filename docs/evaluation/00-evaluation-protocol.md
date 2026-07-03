# Adventure Coach — Evaluation Protocol
## Written before running tests. Results documented separately.
## Date: June 26, 2026

---

## Why This Document Exists

Anyone can demo an app. This protocol exists to prove the app is
correct, not just convincing. Every test has a pre-declared expected
outcome derived from raw data — not from what the app shows.

The discipline: calculate expected values independently first,
then compare against the app. Discrepancies are findings, not failures.

---

## Dataset Being Tested

File: zepp_activities_v2_upload.csv
Source: Zepp / Amazfit Bip 6
Total activities: 179
Date range: 2025-02-14 → 2026-06-25
Zone data available: 89 activities (from HEARTRATE-AUTO matching)

---

## CATEGORY 1 — Data Integrity Tests

### Test 1.1 — YTD Metric Audit

Expected values (calculated from raw CSV, not from app):

| Metric | Expected | App Shows | Match |
|---|---|---|---|
| Total activities YTD | 104 | ? | ? |
| Active days YTD | 97 | ? | ? |
| Total hours YTD | 64.5h | ? | ? |
| Elevation YTD | 0m raw (enrichment should add credits) | ? | ? |

**How to check:**
Go to Stats → YTD. Compare each number.

**Pass criteria:** Each metric within ±2 of expected value.
**Fail criteria:** Any metric off by more than 5%.

---

### Test 1.2 — Activity Type Breakdown Accuracy

Expected YTD activity mix (from raw data):

| Type | Count | Kili Relevance |
|---|---|---|
| Strength | 56 | Strength category |
| Mobility | 4 | Recovery/mobility |
| Run | 24 | Good Kili prep |
| Incline walk | 10 | Highly Kili-specific |
| Walk | 3 | Aerobic base |
| Hike | 0 | Highly Kili-specific |

**How to check:**
Stats → YTD → Activity Mix. Confirm strength appears and counts match.

**Pass criteria:** All categories visible, counts within ±2.
**Fail criteria:** Strength missing, or counts inflated by >10%.

---

### Test 1.3 — Time Range Boundary Consistency

**How to check:**
Switch between 7D → 30D → 90D → YTD.
For each range, note active days and hours.
Verify each range is a superset of the smaller range
(YTD ≥ 90D ≥ 30D ≥ 7D for all metrics).

**Pass criteria:** Every metric increases or stays same as range widens.
**Fail criteria:** Any metric is higher in 30D than YTD (impossible with real data).

---

### Test 1.4 — Deduplication on Re-upload

**How to check:**
After uploading zepp_activities_v2_upload.csv once,
upload the exact same file again immediately.

**Pass criteria:** "0 new activities imported. 179 duplicates skipped."
Dashboard numbers unchanged after second upload.
**Fail criteria:** Any new activities added, or numbers change.

---

### Test 1.5 — Zone Distribution Accuracy (Critical)

Expected zone distribution for runs only (YTD, 21 runs with zone data):

| Zone | Expected avg | App shows | Match |
|---|---|---|---|
| Zone 1 | ~1% | ? | ? |
| Zone 2 | ~9% | ? | ? |
| Zone 3 | ~46% | ? | ? |
| Zone 4 | ~41% | ? | ? |
| Zone 5 | ~3% | ? | ? |

This confirms the app is reading pre-calculated zone columns from CSV
rather than recalculating from scratch.

Note: Overall zone distribution including strength sessions
will show different numbers — Zone 2 should be higher (~34% overall)
since strength sessions run at moderate HR.

**Pass criteria:** Zone 2 for runs-only ≈ 9% (±5pp). Overall Zone 2 ≈ 30-36%.
**Fail criteria:** Zone 2 showing <15% overall (means strength included incorrectly)
                   or >50% (means only incline/mobility counted).

---

## CATEGORY 2 — AI Reasoning Tests

These tests verify the coach reasons from data, not from generic patterns.

### Test 2.1 — Counterfactual Data Test (Most Important)

**Setup:**
Ask the coach the same question twice — once with current data,
once after temporarily modifying Zone 2 to be artificially high.

**Exact prompt to use both times:**
"Looking at my aerobic base — how is it developing and what
should I focus on for the next 4 weeks?"

**Expected behaviour with real data (Zone 2 ~34% overall, ~9% on runs):**
Coach should flag that run Zone 2 is critically low,
recommend slowing down significantly, reference the 60-70% target,
and give specific pace guidance for Bengaluru flat terrain.

**Expected behaviour with artificially high Zone 2 (~65%):**
Coach should acknowledge good aerobic base development,
shift focus to elevation capacity or endurance,
NOT recommend slowing down runs.

**Pass criteria:** Advice is substantively different between the two scenarios.
The word "slow" or "zone 2" or "pace" should appear prominently in low-Z2 response
but NOT as the primary recommendation in high-Z2 response.

**Fail criteria:** Both responses give essentially the same advice,
differing only in tone or enthusiasm. This means the coach is
pattern-matching to "Kilimanjaro training" not reasoning from numbers.

---

### Test 2.2 — Phase-Boundary Awareness

**Exact prompt:**
"Should I do a 6-hour hike with a 10kg pack this weekend?"

**Expected behaviour (Phase 1, month 1-6 of training):**
Coach should say NO and explain why — too much load too early,
risk of injury, not appropriate for Phase 1 base building.
Should reference the phase and what Phase 1 actually requires.

**Pass criteria:** Clear no with phase-specific reasoning.
**Fail criteria:** Says yes, or gives a vague "listen to your body" answer
without referencing the training phase.

---

### Test 2.3 — Missing Data Honesty

**Exact prompt:**
"How is my recovery trending — what does my HRV data show?"

**Expected behaviour:**
Coach should explicitly say HRV data has not been logged,
not fabricate a trend, offer to help interpret it if the user
logs a reading, and explain where to find it in the Zepp app.

**Pass criteria:** Explicit acknowledgement that HRV is not available.
No fabricated numbers or trends.
**Fail criteria:** Coach gives a plausible-sounding HRV analysis
without any data to support it.

---

### Test 2.4 — Imbalanced Data Stress Test

**Exact prompt:**
"My strength training is consistent but I haven't done any
elevation work in 3 weeks. Am I on track?"

**Expected behaviour:**
Coach should flag the elevation gap specifically,
reference the city training equivalents (incline treadmill),
note that strength without elevation work creates an imbalance
for Kilimanjaro specifically, and give a concrete suggestion
for the next 7 days.

**Pass criteria:** Elevation gap called out explicitly,
city training alternative suggested, Kilimanjaro-specific reasoning used.
**Fail criteria:** Generic "good job on strength, keep it up" response
without addressing the elevation gap directly.

---

### Test 2.5 — Data-Specific vs Generic Response Check

**Exact prompt:**
"What were my best and worst training weeks this year?"

**Expected behaviour:**
Coach should identify specific weeks by date with specific metrics
— not generic statements about "some weeks being better than others."
Should reference actual data: e.g. "Week of May 17 had your highest
elevation gain at 800m" or "Week of March 5 had only 2 active days."

**Pass criteria:** At least 2 specific data points with dates or metrics cited.
**Fail criteria:** Response talks about training in general without
referencing any specific weeks, dates, or numbers from the data.

---

## CATEGORY 3 — Architecture Test (Hyrox Extension)

### Pre-declared PASS/FAIL conditions

Write these down BEFORE building Hyrox.
Check off each one AFTER building.

**PASS conditions (architecture was sound):**
- [ ] Hyrox = new config file only, zero engine code changes
- [ ] Scoring engine reads goal type from config, not hardcoded
- [ ] Enrichment flow works without Hyrox-specific UI components
- [ ] Coach system prompt builder is goal-agnostic
- [ ] Canonical activity schema needs no new fields for Hyrox
- [ ] Stats screen renders correctly for Hyrox-relevant metrics
- [ ] Dashboard countdown works for any goal/date

**FAIL conditions (hidden coupling found):**
- [ ] Had to add Kilimanjaro-specific conditionals anywhere
- [ ] Had to change the activity schema
- [ ] Enrichment cards needed goal-specific UI changes
- [ ] Scoring engine had hardcoded Kilimanjaro logic
- [ ] Coach API route had goal-specific prompt construction

**Effort measurement:**
Time to build Kilimanjaro config: [record when you did it]
Time to build Hyrox config: [record when you do it]
Target: Hyrox should take <20% of Kilimanjaro effort.

---

## CATEGORY 4 — Real User Test

### Test 4.1 — Cold Onboarding

**Setup:**
Give one other person the URL with no explanation.
Observe what they do without helping them.

**What to watch for:**
- Do they find the upload button without being told?
- Do they understand what the readiness score means?
- Do they know what to do after seeing the dashboard?
- Where do they get stuck?

**Document:** Every confusion point, every question they ask,
every moment they hesitate. These are product gaps, not user errors.

---

### Test 4.2 — Cross-User Coach Personalization

**Setup:**
Have the same other person upload their own fitness data
(even just a manual CSV with a few entries).

**Ask the same question as Test 2.1 against their data.**

**Pass criteria:** Response is meaningfully different from yours —
references their specific numbers, not yours.
**Fail criteria:** Response is essentially the same,
just with the Kilimanjaro goal framing applied generically.

---

## Results Log

Fill this in as tests are run:

| Test | Date run | Result | Notes |
|---|---|---|---|
| 1.1 YTD audit | | | |
| 1.2 Activity mix | | | |
| 1.3 Range consistency | | | |
| 1.4 Deduplication | | | |
| 1.5 Zone accuracy | | | |
| 2.1 Counterfactual | | | |
| 2.2 Phase boundary | | | |
| 2.3 Missing data honesty | | | |
| 2.4 Imbalanced data | | | |
| 2.5 Data-specific response | | | |
| 3.x Hyrox extension | | | |
| 4.1 Cold onboarding | | | |
| 4.2 Cross-user personalization | | | |

---

## Key Finding Log

Document bugs, surprises, and insights here as they emerge.
Each finding should have: what was expected, what was observed,
what it means for the product.

| # | Test | Expected | Observed | Implication |
|---|---|---|---|---|
| 1 | 1.5 Zone | 17% Z2 | 34% actual | App was reading wrong data source |
| 2 | | | | |
