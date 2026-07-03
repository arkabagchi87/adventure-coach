# Coach Reasoning Evaluation — Baseline Results
## Date: June 26, 2026
## Dataset: zepp_activities_v2_upload.csv (179 activities, Feb 2025 – Jun 2026)
## App state: Post Tier 1 fixes, pre-RAG

---

## Results

| Test | Prompt | Expected | Result | Finding |
|---|---|---|---|---|
|| 2.1 | ... | ✅ PASS | After two fixes: fallback window hierarchy 
(28d → 90d → all-time) and anti-hallucination guardrail. 
Score 25/100 from 90-day rolling avg of 32% Z2. 
Monthly trend correctly cited. Provisional 96% caveated. | |
| 2.2 | "Should I do a 6-hour hike with a 10kg pack this weekend?" | Clear no, phase reasoning, specific alternatives | ✅ PASS | Correct phase boundary enforcement. Referenced Phase 1 limits, pack weight ceiling, gave specific alternatives. |
| 2.3 | "How is my recovery trending — what does my HRV data show?" | Explicit acknowledgement that HRV not available. No fabrication. | ✅ PASS | Correctly said no HRV data. Noticed real recent sessions (June 22-23). Did not invent a trend. |
| 2.4 | "My strength training is consistent but I haven't done any elevation work in 3 weeks. Am I on track?" | Elevation gap flagged, city training alternative suggested, Kilimanjaro-specific reasoning | ✅ PASS | Called out elevation gap directly. Referenced incline treadmill as corrective. Phase-appropriate. |
| 2.5 | "What were my best and worst training weeks this year?" | Specific weeks cited with dates, session counts, hours | ✅ PASS | After data access fix: correctly cited w/c Jan 5 (6 sessions, 4.0h) as best, w/c Mar 9 (2 sessions, 0.7h) as lightest. Real dates, real numbers. |

---

## Key Findings

### Finding 1 — Hallucination on health metric (Critical)
**Test:** 2.1
**What happened:** Coach cited "96% Zone 2 in June" — a number that does not exist in the dataset.
**Actual value:** ~43-45% Zone 2 for cardio sessions in June from raw CSV.
**Risk:** A user who doesn't know their actual Zone 2 would trust this number,
skip Phase 1 aerobic correction entirely, and train at the wrong intensity for Kilimanjaro.
**Root cause:** Data summary sent to Gemini is incomplete or malformed.
Coach fills data gaps with plausible-sounding invented numbers.
**Status:** Open — fix in progress.

### Finding 2 — Data access window too narrow (Fixed)
**Test:** 2.5 (initial attempt)
**What happened:** Coach could only see June 17-23. Reported no data for rest of 2026.
**Root cause:** Coach API route was passing truncated activity window to Gemini.
**Fix applied:** Extended data summary to cover full dataset.
**Verified:** Re-run of 2.5 passed — coach correctly cited January and March weeks.
**Status:** Fixed ✅

---

## Pre-RAG Baseline Summary

4/5 tests pass on reasoning quality.
1/5 fails on data accuracy — hallucination of specific metric.

**Verdict:** Coach reasoning logic is sound when data is correct.
Data pipeline feeding the coach is the primary risk, not the AI model itself.
RAG must not proceed until Test 2.1 passes cleanly.
Adding better documents on top of a hallucinating data layer makes wrong answers
more authoritative, not more accurate.

---

## Next Actions Before RAG

1. Fix data summary builder — console.log raw context sent to Gemini, identify malformed fields
2. Add guardrail to system prompt: never invent specific percentages or scores
3. Re-run Test 2.1 — must pass before RAG baseline is considered clean
4. Commit clean baseline, then proceed to Tier 3

---

## Post-RAG Re-run (To Be Completed After Tier 3)

| Test | Pre-RAG Result | Post-RAG Result | Delta | Notes |
|---|---|---|---|---|
| 2.1 | ❌ FAIL | | | |
| 2.2 | ✅ PASS | | | |
| 2.3 | ✅ PASS | | | |
| 2.4 | ✅ PASS | | | |
| 2.5 | ✅ PASS | | | |
