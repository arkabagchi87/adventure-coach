# App Overview — Adventure Coach

## The Core Idea

Adventure Coach is a **goal-countdown fitness coaching app**. Unlike Strava or Garmin Connect
which show you what you've done, Adventure Coach tells you whether what you're doing is
going to get you ready for a specific goal by a specific date.

The app works backwards from the goal. Every metric, every chart, every coach response
exists to answer one question: **"Will I be ready in time?"**

---

## Current Goal: Kilimanjaro, February 2028

The first goal type is Mount Kilimanjaro — Uhuru Peak (5,895m) via the Lemosho route.
21 months of training. The app knows what Kilimanjaro demands and tracks whether the
user is building the right fitness to meet those demands.

---

## Three Screens

### Screen 1 — Dashboard
The home screen. Everything at a glance.

**Components:**
- **Countdown** — large, prominent. "X days to Kilimanjaro". Always visible.
- **Readiness Score** — a single composite number (0–100). What it means is explained.
- **Readiness Breakdown** — 5 dimensions shown as progress bars:
  - Aerobic Base (35% weight)
  - Elevation Capacity (25%)
  - Multi-day Endurance (20%)
  - Strength (12%)
  - Recovery Quality (8%)
- **Trajectory Chart** — the most important chart. Two lines:
  - Required trajectory (where you need to be by now)
  - Actual progress (where you are)
  - Gap between them = what the coach focuses on
- **Phase Indicator** — which training phase you're in (1–4) and what it means
- **Next Milestone** — the nearest upcoming gate and whether you're on track for it
- **Coach Teaser** — 1–2 lines from the coach with a "Reply →" link to Coach screen

### Screen 2 — Stats
Your data visualised through the lens of what matters for Kilimanjaro.
NOT a generic activity log. Every chart is framed around goal relevance.

**Time range selector:** 7D / 30D / 90D / YTD (same pattern as filatov reference)

**Components:**
- **Summary strip** — total elevation gain, active days, total hours for selected range
- **Weekly elevation gain chart** — bar chart, most important Stats chart for Kilimanjaro
  Shows required trajectory line overlaid
- **Zone distribution** — donut chart. Zone 2 % is highlighted as the key metric.
  Framed as "Aerobic base building" not just "HR zones"
- **Weekly activity days** — consistency chart. Are you hitting 5 days/week?
- **Activity type breakdown** — what proportion is hike vs run vs strength vs incline
  Framed as "Kilimanjaro-specific vs general fitness"
- **Longest activity trend** — are your long sessions getting longer over time?
- **HRV / RHR trend** — recovery signals over time (if data available)

**Enrichment indicators:**
Activities with missing enrichment data are marked with a small indicator.
Tapping opens a quick enrichment flow for that session.

### Screen 3 — Coach
AI coaching interface. Knows your goal, your timeline, your data.

**Components:**
- **Header:** "Coach" with data window indicator (matches Stats time range)
- **Chat interface** — clean message bubbles, user right / coach left
- **Pre-loaded insight** — coach opens with a data-driven observation, not a greeting
- **Input field** — "Ask your coach..." with Send button
- **Suggested questions** — 3 tappable prompts that update based on current data:
  e.g. "What should my next 4 weeks look like?"
       "Am I building enough elevation?"
       "I'm travelling for 2 weeks — how do I adjust?"

**Coach behaviour:**
- Every response references actual data — no generic advice
- Always anchors to Kilimanjaro and the timeline
- Flags red flags proactively (not just when asked)
- Handles enrichment conversationally ("I noticed 3 treadmill sessions — what incline?")
- Gracefully handles missing data ("I don't have your HRV yet, but based on session load...")

---

## Navigation

Bottom tab bar with 3 tabs:
```
[Dashboard]  [Stats]  [Coach]
```

Clean, minimal. No hamburger menu. No settings buried in drawers.
Settings (Gemini API key, data upload) accessible via a gear icon on Dashboard header.

---

## Data Flow

```
User uploads Zepp CSV / Apple Health XML / Manual CSV
         ↓
Parser normalises to canonical activity schema
         ↓
Activities stored in local JSON
         ↓
Goal config filters relevance per activity type
         ↓
Readiness score calculated across 5 dimensions
         ↓
Trajectory compared against phase targets
         ↓
Dashboard + Stats render from processed data
         ↓
Coach receives: goal config + activity summary + readiness + timeline
         ↓
Gemini 2.5 Flash generates coaching response
```

---

## Goal Config System

The app is built as a **Goal Engine**. The Kilimanjaro goal type is defined in:
`/src/config/goals/kilimanjaro.js`

This config file defines:
- What the goal demands (knowledge base)
- Which metrics to track and how to score them
- Readiness dimensions and weights
- Training phases and targets
- Milestone gates
- Red flags to watch for
- Activity type relevance scoring
- Coach system prompt

Future goal types (Marathon, Ironman, Hyrox) will each have their own config file.
The app engine reads whichever config is active and behaves accordingly.
**Goal configs are hand-authored — never AI-generated.**

---

## File Structure (when built)

```
adventure-coach/
├── CLAUDE.md
├── .claude/agents/           ← agent definitions
├── docs/                     ← product documentation
├── src/
│   ├── app/                  ← Next.js App Router pages
│   │   ├── page.js           ← Dashboard (default route)
│   │   ├── stats/page.js     ← Stats screen
│   │   ├── coach/page.js     ← Coach screen
│   │   └── api/
│   │       ├── coach/route.js     ← Gemini API call (server-side)
│   │       └── upload/route.js    ← file parsing endpoint
│   ├── components/           ← reusable UI components
│   │   ├── dashboard/
│   │   ├── stats/
│   │   ├── coach/
│   │   └── shared/
│   ├── config/
│   │   └── goals/
│   │       └── kilimanjaro.js    ← Kilimanjaro goal config
│   ├── lib/
│   │   ├── parsers/          ← Zepp CSV, Apple Health, Manual CSV parsers
│   │   ├── scoring/          ← readiness score calculation
│   │   └── trajectory/       ← phase targets and gap calculation
│   └── data/                 ← JSON data storage
│       ├── activities.json
│       └── enrichment.json
├── public/
└── package.json
```

---

## Design Principles

1. **Goal-first, always.** Every screen answers "will I be ready in time?"
2. **Data without overwhelm.** Show what matters for Kilimanjaro. Hide what doesn't.
3. **Honest over optimistic.** The readiness score reflects reality. The coach tells the truth.
4. **Graceful with gaps.** Partial data gives partial insights — never breaks the app.
5. **Mobile-first.** Designed for phone. Works on desktop too.
6. **Clean, not minimal.** Data-forward design. Information density is appropriate, not stripped out.
