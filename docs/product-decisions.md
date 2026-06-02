# Product Decisions — Adventure Coach
## All locked decisions. Do not deviate without explicit instruction.

---

## What This App Is

A **goal-countdown fitness coaching app**. Every feature is subordinate to one question:
*"Will I be ready for X by date Y?"*

This is NOT a generic fitness tracker. It does not look back at what you did.
It looks forward: are you on track to be ready in time?

---

## Current Goal Instance

- **Goal:** Mount Kilimanjaro Summit (Uhuru Peak, 5,895m)
- **Route:** Lemosho (8 days)
- **Target date:** February 2028
- **User:** Arka (solo user, personal app)

---

## Architecture Decisions

### Platform Model
- Built as a **Goal Engine** — goal types are hand-authored configuration files
- Goal types are NOT AI-generated. They are researched and authored manually for accuracy.
- Currently: single active goal (Kilimanjaro)
- Future: multiple goal types (Marathon, Ironman, Hyrox, other treks)

### Three Screens Only
1. **Dashboard** — countdown to goal, readiness score, trajectory vs actual
2. **Stats** — activity data visualised through the lens of goal-relevant metrics
3. **Coach** — AI that knows the goal, the timeline, and the user's current data

### User
- Solo user only for now
- No authentication needed for v1
- No social features, no sharing within app

---

## Data Decisions

### Input Methods (in priority order)
1. **Zepp CSV export** — bulk periodic upload from Amazfit Bip 6 via Zepp app
2. **Apple Health XML export** — for iPhone users on any device/app
3. **Manual CSV template** — universal fallback, downloadable template provided

### No Daily Sync
- Periodic bulk uploads only. User requests export from device app, uploads to Adventure Coach.
- No OAuth, no API keys to fitness platforms, no background sync.

### Canonical Activity Schema
Every source maps to this internal format:
```
date                    (YYYY-MM-DD)
activity_type           (run / hike / walk / incline_walk / stair_climb /
                         strength_legs / strength_core / strength_full /
                         trail_run / cycle / swim / yoga / mobility)
duration_minutes
distance_km
elevation_gain_m
avg_heart_rate
max_heart_rate
zone1_percent
zone2_percent
zone3_percent
zone4_percent
zone5_percent
hrv                     (optional)
rhr                     (optional)
pack_weight_kg          (optional, manual)
notes                   (optional, free text)
```

### Missing Data Strategy
- App NEVER blocks on missing data
- App NEVER asks user to re-upload a file to add one field
- Missing fields filled via **conversational enrichment** (coach asks naturally after upload)
- Ongoing manual metrics via **quick-log UI** (HRV, RHR, pack weight, subjective feel)
- Readiness score degrades gracefully with less data — always labelled with confidence level

### Conversational Enrichment
After each upload, the coach identifies ambiguous activities and asks:
- One activity at a time, not a wall of questions
- Accepts approximate answers
- Stores enrichment permanently — never asks the same thing twice
- Examples: treadmill incline %, pack weight carried, strength session focus area

---

## AI Layer Decisions

### Provider
- **Gemini 2.5 Flash** (free tier)
- User provides their own Gemini API key
- API key stored in environment variable, never exposed to frontend
- Called via Next.js API route (server-side only)

### What the AI Knows
- The full Kilimanjaro goal config (baked into system prompt)
- User's activity data for the selected time window
- Current readiness score and dimension breakdown
- Days remaining to goal
- Recent coach conversation history

### Coach Persona
- Honest, direct, knowledgeable — like a mountaineering coach
- Uses actual data in every response — no generic advice
- Never catastrophises. Recalibrates instead.
- Acknowledges data gaps rather than fabricating insights

---

## Tech Stack

```
Framework:    Next.js 14 (App Router)
Styling:      Tailwind CSS
Charts:       Recharts
AI:           Gemini 2.5 Flash via Google Generative AI SDK
Storage:      JSON files (local, no database for v1)
Hosting:      Vercel (free tier)
Repo:         GitHub (arkabagchi87/adventure-coach)
Deployment:   Auto-deploy on push to main
```

**Cost: $0**

---

## UI Reference

- Visual reference: @filatov.design running coach app (Instagram reel)
- Reference is for inspiration only — NOT to be copied
- Key inspiration: clean mobile-first design, data-forward, two-tab navigation
- Our app is fundamentally different: forward-looking (goal countdown) vs backward-looking (activity review)
- Mobile-first, iOS-style, clean typography, purposeful use of color

---

## What Is Explicitly Out of Scope for V1

- User authentication / accounts
- Multiple simultaneous goals
- Social features / sharing within app
- Push notifications
- AI-generated goal configs
- Direct fitness platform API integration (Garmin Connect, Strava, etc.)
- Paid features or subscriptions
