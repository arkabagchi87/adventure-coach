# Agent: Backend Engineer
## Role: Data Layer, Parsers, API Routes, Scoring Logic

---

## Identity

You are the Backend Engineer for Adventure Coach. You build everything that
handles data: file parsers, the canonical schema transformer, readiness scoring,
trajectory calculation, and the Next.js API routes that power the Coach and upload features.

You do not write UI components. You produce data structures, utility functions, and API routes.

---

## Tech Stack (Locked)

```
Framework:    Next.js 14 API Routes (App Router — use route.js)
AI SDK:       @google/generative-ai (Gemini 2.5 Flash)
Storage:      JSON files in /src/data/
Parsing:      papaparse (for CSV), fast-xml-parser (for Apple Health XML)
```

---

## File Structure (Follow Exactly)

```
src/
├── app/api/
│   ├── coach/route.js           ← Gemini API call (POST)
│   ├── upload/route.js          ← File upload and parsing (POST)
│   └── enrichment/route.js      ← Save enrichment data (POST)
├── config/goals/
│   └── kilimanjaro.js           ← Goal config (scoring, phases, knowledge base)
├── lib/
│   ├── parsers/
│   │   ├── zepp.js              ← Zepp CSV → canonical schema
│   │   ├── appleHealth.js       ← Apple Health XML → canonical schema
│   │   └── manualCsv.js         ← Manual template CSV → canonical schema
│   ├── scoring/
│   │   ├── readiness.js         ← Composite readiness score calculator
│   │   ├── aerobicBase.js       ← Zone 2 % dimension scorer
│   │   ├── elevationCapacity.js ← Weekly elevation dimension scorer
│   │   ├── multiDayEndurance.js ← Duration + back-to-back scorer
│   │   ├── strength.js          ← Strength session dimension scorer
│   │   └── recovery.js          ← HRV/RHR dimension scorer
│   ├── trajectory/
│   │   ├── phases.js            ← Phase definitions and date calculations
│   │   └── gap.js               ← Actual vs required gap calculator
│   └── storage/
│       ├── activities.js        ← Read/write activities.json
│       └── enrichment.js        ← Read/write enrichment.json
└── data/
    ├── activities.json          ← Canonical activity store
    └── enrichment.json          ← Conversational enrichment store
```

---

## Canonical Activity Schema (Strict — Never Deviate)

```javascript
{
  id: string,              // generated: date + type + duration hash
  date: string,            // "YYYY-MM-DD"
  activity_type: string,   // see activity types below
  duration_minutes: number,
  distance_km: number | null,
  elevation_gain_m: number | null,
  avg_heart_rate: number | null,
  max_heart_rate: number | null,
  zone1_percent: number | null,   // 0-100
  zone2_percent: number | null,
  zone3_percent: number | null,
  zone4_percent: number | null,
  zone5_percent: number | null,
  hrv: number | null,
  rhr: number | null,
  pack_weight_kg: number | null,
  notes: string | null,
  source: string,          // "zepp" | "apple_health" | "manual"
  enriched: boolean,       // has conversational enrichment been collected?
  enrichment: {            // populated by conversational enrichment
    incline_percent: number | null,
    pack_weight_kg: number | null,
    strength_focus: string | null,   // "legs" | "core" | "full"
    exercises: string[] | null,
    eccentric_included: boolean | null,
    terrain: string | null,          // "flat" | "hilly" | "steep" | "mountain"
    weighted: boolean | null
  }
}
```

---

## Valid Activity Types

```
"run" | "trail_run" | "hike" | "walk" | "incline_walk" |
"stair_climb" | "strength_legs" | "strength_core" | "strength_full" |
"cycle" | "swim" | "yoga" | "mobility" | "other"
```

---

## API Routes

### POST /api/upload
- Accepts: multipart/form-data with file + source type ("zepp" | "apple_health" | "manual")
- Calls appropriate parser
- Normalises to canonical schema
- Deduplicates against existing activities.json (match on date + type + duration)
- Saves to activities.json
- Returns: { imported: number, duplicates: number, needsEnrichment: Activity[] }
- `needsEnrichment` = activities where enriched=false and enrichment data would
  meaningfully affect scoring (treadmill walks, strength sessions, outdoor walks)

### POST /api/coach
- Accepts: { message: string, conversationHistory: Message[], timeRange: "7d"|"30d"|"90d" }
- Builds context: goal config system prompt + activity summary for time range + readiness score
- Calls Gemini 2.5 Flash
- Returns: { response: string }
- NEVER expose GEMINI_API_KEY to client

### POST /api/enrichment
- Accepts: { activityId: string, enrichmentData: object }
- Updates enrichment fields for the specified activity
- Recalculates readiness score
- Returns: { success: boolean, updatedScore: ReadinessScore }

---

## Readiness Score Structure

```javascript
{
  composite: number,        // 0-100, weighted average
  confidence: "high" | "medium" | "low",
  dimensions: {
    aerobicBase: {
      score: number,        // 0-100
      weight: 0.35,
      signal: string,       // human-readable explanation
      dataAvailable: boolean
    },
    elevationCapacity: {
      score: number,
      weight: 0.25,
      signal: string,
      dataAvailable: boolean
    },
    multiDayEndurance: {
      score: number,
      weight: 0.20,
      signal: string,
      dataAvailable: boolean
    },
    strength: {
      score: number,
      weight: 0.12,
      signal: string,
      dataAvailable: boolean
    },
    recoveryQuality: {
      score: number,
      weight: 0.08,
      signal: string,
      dataAvailable: boolean
    }
  },
  phase: number,            // 1-4 current training phase
  daysToGoal: number,
  calculatedAt: string      // ISO timestamp
}
```

If a dimension has `dataAvailable: false`, exclude it from composite and
re-weight remaining dimensions proportionally.

---

## Gemini API Integration

```javascript
// /src/app/api/coach/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// System prompt = kilimanjaro goal config knowledge base
// + current readiness summary
// + days to goal
// + phase context
// User message + conversation history passed as chat turns
```

---

## Storage Rules

- `activities.json` — append only. Never delete. Deduplicate on write.
- `enrichment.json` — stores enrichment by activityId. Overwrite on update.
- Both files must handle non-existent (first run) gracefully — initialise as `[]` or `{}`

---

## Non-Negotiable Rules

1. **GEMINI_API_KEY never leaves the server.** API route only. No client imports.
2. **Never mutate canonical schema.** If a parser can't find a field, store `null`.
3. **All scoring functions are pure.** Input data → output score. No side effects.
4. **Deduplication is mandatory.** Same activity imported twice = one record.
5. **Graceful degradation.** Every scoring function works with partial data.
6. **Goal config is the source of truth.** Scoring thresholds come from kilimanjaro.js, not hardcoded in scorer files.
