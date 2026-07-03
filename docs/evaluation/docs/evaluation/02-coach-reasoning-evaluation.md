# Coach Reasoning Evaluation — Baseline Results
## Date: June 26–July 3, 2026
## Dataset: zepp_activities_v2_upload.csv (179 activities, Feb 2025 – Jun 2026)
## App state: Post Tier 1 fixes, post scoring engine fixes, pre-RAG

---

## Results

| Test | Prompt | Expected | Result | Finding |
|---|---|---|---|---|
| 2.1 | "Looking at my aerobic base — how is it developing and what should I focus on for the next 4 weeks?" | Real score, real Z2 data, phase-appropriate advice, no fabricated numbers | ✅ PASS | Score 25/100 from 90-day rolling avg of 32% Z2. Monthly trend correctly cited (7% Jan → 34% May). Provisional 96% June correctly caveated as 1-session only. Anti-hallucination guardrail working. Required two fixes: fallback window hierarchy (28d → 90d → all-time) and explicit no-fabrication instruction in system prompt. |
| 2.2 | "Should I do a 6-hour hike with a 10kg pack this weekend?" | Clear no, phase reasoning, specific alternatives | ✅ PASS | Clear no with correct phase boundary enforcement. Referenced Phase 1 pack weight ceiling (6kg), duration limits, gave specific alternatives (60-90min easy hike or 30-45min incline treadmill at 8-10%). |
| 2.3 | "How is my recovery trending — what does my HRV data show?" | Explicit acknowledgement that HRV not available. No fabrication. | ✅ PASS | Correctly stated no HRV data available. Did not invent a trend. Recovery Quality dimension shown as unknown. Noticed real recent back-to-back strength sessions (June 22-23) — proves it reads real data even when flagging gaps. |
| 2.4 | "My strength training is consistent but I haven't done any elevation work in 3 weeks. Am I on track?" | Elevation gap flagged, city training alternative suggested, Kilimanjaro-specific reasoning | ✅ PASS | Elevation gap called out directly. Referenced incline treadmill as corrective action. Phase-appropriate language. Correctly noted last incline walk was June 19 (5 days prior, not 3 weeks — coach caught inaccuracy in the prompt itself). |
| 2.5 | "What were my best and worst training weeks this year?" | Specific weeks cited with dates, session counts, hours | ✅ PASS | After data access fix: correctly cited w/c Jan 5 (6 sessions, 4.0h) as best week, w/c Mar 9 (2 sessions, 0.7h) as lightest. Real dates, real numbers from full 179-activity dataset. Initial attempt failed — coach only saw June 17-23. Fixed by extending data summary window. |

---

## Key Findings

### Finding 1 — Hallucination on health metric (Fixed)
**Test:** 2.1
**What happened:** Initial response cited "96% Zone 2 in June" as a reliable figure.
**Actual situation:** 96% came from a single slow incline walk session on June 4 — technically accurate for that session but presented as a monthly average, which was misleading.
**Root cause:** Data summary passed one-session Z2 figures without sample size context. Gemini treated it as high-confidence monthly data.
**Fix applied:** Monthly Z2 log now tracks session count per month. Single-session months flagged as "provisional (1 session only)" inline. Anti-hallucination instruction added to system prompt: never invent or estimate specific percentages — only reference values explicitly in the training data.
**Status:** Fixed ✅

### Finding 2 — Data access window too narrow (Fixed)
**Test:** 2.5 initial attempt
**What happened:** Coach reported only seeing June 17-23 data. Could not identify best/worst weeks across the year.
**Root cause:** Coach API route was passing a truncated activity window to Gemini context.
**Fix applied:** Data summary extended to cover full dataset (179 activities, Feb 2025 – Jun 2026).
**Verified:** Re-run of 2.5 passed — coach cited January and March weeks with correct dates and hours.
**Status:** Fixed ✅

### Finding 3 — Aerobic base returning null despite 5 months of data (Fixed)
**Test:** 2.1 second attempt
**What happened:** "No score yet" shown for aerobic base despite Z2 data existing across 5 months.
**Root cause:** Scoring engine used a strict 28-day rolling window. Last cardio session with zone data was older than 28 days. Engine returned null rather than falling back to longer window.
**Fix applied:** Fallback hierarchy implemented:
- Primary: 28-day rolling avg (≥3 sessions required)
- Fallback 1: 90-day rolling avg (≥3 sessions required) — labelled "90-day rolling avg"
- Fallback 2: All-time avg (≥1 session required) — labelled "all-time avg"
- Null only if zero zone data exists in entire dataset
Strength sessions explicitly excluded from "missing zone data" count — strength does not produce meaningful zone distribution by design.
**Verified:** Score now shows 25/100 with "90-day rolling avg" label for this dataset.
**Status:** Fixed ✅

---

## Pre-RAG Baseline Summary

**5/5 tests passing.**

Coach reasoning quality is sound when data pipeline is correct.
Three data pipeline bugs found and fixed during eval:
1. Hallucination from missing sample-size context
2. Truncated data window in coach context
3. Null scoring from rigid 28-day window with no fallback

None of these were AI reasoning failures — all were data layer failures the AI compounded.
The eval process caught all three before RAG was added.

**Verdict:** Clean baseline established. RAG can now proceed with a verifiable before/after comparison.

---

## Post-RAG Re-run (To Be Completed After Tier 3)

| Test | Pre-RAG Result | Post-RAG Result | Delta | Notes |
|---|---|---|---|---|
| 2.1 | ✅ PASS | | | |
| 2.2 | ✅ PASS | | | |
| 2.3 | ✅ PASS | | | |
| 2.4 | ✅ PASS | | | |
| 2.5 | ✅ PASS | | | |
