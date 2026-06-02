# Kilimanjaro Goal Config
## Version 1.0 — Hand-authored by Arka
### Last updated: 2026-05-30

---

## 1. GOAL METADATA

```json
{
  "goal_id": "kilimanjaro",
  "name": "Mount Kilimanjaro Summit",
  "subtitle": "Uhuru Peak — 5,895m",
  "location": "Tanzania, Africa",
  "target_date": "2028-02-01",
  "target_date_flexibility": "February 2028 (exact week TBD)",
  "recommended_route": "Lemosho",
  "route_duration_days": 8,
  "summit_elevation_m": 5895,
  "trailhead_elevation_m": 2100,
  "total_elevation_gain_m": 4800,
  "daily_hiking_hours": "5–8 hours (summit day 12–14 hours)",
  "daily_elevation_gain_m": "900–1200m per day",
  "total_route_distance_km": 70,
  "pack_weight_on_mountain_kg": "5–8kg daypack (porters carry main bag)",
  "success_rate_lemosho": "up to 98%",
  "goal_type": "trek",
  "phases": 4,
  "total_months": 21
}
```

---

## 2. WHAT THIS GOAL ACTUALLY DEMANDS
### (Core knowledge baked into every coach response)

### 2.1 Physical Demands

- **Daily output:** 5–8 hours of sustained hiking per day for 7–9 consecutive days.
  Summit day is the hardest: 8 hours ascent + 6–7 hours descent = 12–14 hours continuous.
- **Terrain:** Steep ascents AND steep descents. Rocky, uneven, loose scree at altitude.
  Not technically difficult — no scrambling — but relentlessly physical.
- **Elevation gain:** ~900–1,200m per day. Total ~4,800m from trailhead to summit.
- **Pack weight on mountain:** 5–8kg daypack. Porters carry everything else.
  Training must include progressive pack loading to simulate this.
- **Consecutive days:** The mountain does not give rest days. Back-to-back effort
  every single day is the defining challenge. Single long hikes do not replicate this.
- **Altitude zones crossed:**
  - Montane forest: 1,800–2,800m (mild, minimal acclimatization needed)
  - Heath & moorland: 2,800–4,000m (begins to thin, body starts adapting)
  - Alpine desert: 4,000–5,000m (oxygen drops significantly, critical zone)
  - Arctic summit: 5,000–5,895m (extreme cold, ~49% less oxygen than sea level)

### 2.2 The Altitude Truth (Critical — Coach Must Never Misrepresent This)

- **Fitness does NOT prevent altitude sickness (AMS).** This is non-negotiable.
  AMS is determined by genetics, rate of ascent, and acclimatization time — not fitness level.
  Elite marathon runners have failed. Untrained trekkers have summited. Fitness is not a guarantee.
- **What fitness DOES do:**
  - Means the mountain feels like 60% effort instead of 85% effort at the same altitude
  - Allows the body to recover overnight and be ready for the next day
  - Reduces cumulative fatigue across the 8-day window
  - Makes the summit night mentally and physically survivable
- **Coach must NEVER say:** "Get fit enough and you won't get altitude sickness."
- **Coach MUST say:** "Fitness means the mountain is manageable, not that altitude can't affect you."
- At the summit (5,895m), there is approximately 49% less oxygen than at sea level.
- Lava Tower (4,630m) on the Lemosho route is the first real altitude test — many trekkers
  feel symptoms here. This is a lunch stop and a diagnostic moment. Descending to sleep lower
  (Barranco Camp at 3,976m) is the classic "climb high, sleep low" strategy.
- Acclimatization cannot be trained at sea level. What you can train is the fitness
  that makes acclimatization easier.

### 2.3 The Descent Problem (Most Underestimated)

- After summit night, trekkers descend thousands of meters on already-exhausted legs.
- The descent is where knees, hips, and quads break down — more so than the ascent.
- This is caused by **eccentric muscle loading** — quads working as brakes going downhill,
  which is a completely different demand than concentric uphill strength.
- Most people train uphill only. This is a critical mistake for Kilimanjaro specifically.
- Training must include deliberate eccentric/downhill work.

### 2.4 The Pole Pole Principle

- "Pole pole" means "slowly slowly" in Swahili. It is the single most important
  tactical concept on the mountain.
- Walking too fast at altitude causes heart rate to spike, oxygen demand to exceed supply,
  and cumulative exhaustion to compound across days.
- Training at conversational pace (zone 2) is not laziness — it is direct preparation
  for the pace you will sustain on the mountain.
- The coach should reinforce this constantly: slow is correct. Slow is the strategy.

---

## 3. READINESS DIMENSIONS & SCORING

### 3.1 Dimension Weights

| Dimension | Weight | Rationale |
|---|---|---|
| Aerobic Base | 35% | Oxygen efficiency is the #1 Kili-specific fitness factor |
| Elevation Capacity | 25% | Direct simulation of what the mountain demands |
| Multi-day Endurance | 20% | Consecutive days are the defining challenge |
| Strength (legs/core/descent) | 12% | Protects joints, enables summit, survives descent |
| Recovery Quality | 8% | HRV/RHR trending well = body absorbing training load |

### 3.2 Scoring Rubrics Per Dimension

#### Aerobic Base (35%)
Measured by: zone2_percent over rolling 4-week average

| Zone 2 % | Score |
|---|---|
| < 30% | 10 — critical, training at wrong intensity |
| 30–40% | 25 — below minimum, needs urgent correction |
| 40–50% | 45 — developing, on the right path |
| 50–60% | 65 — solid base building underway |
| 60–70% | 80 — good aerobic base developing |
| 70–80% | 92 — strong aerobic engine |
| > 80% | 100 — exceptional aerobic base |

Secondary signal: session avg HR trending down for same effort = aerobic adaptation happening.

#### Elevation Capacity (25%)
Measured by: weekly_elevation_gain_m (rolling 4-week average)
Cross-referenced with: phase target (see Section 5)

| Weekly Elevation Gain | Phase 1 Score | Phase 2 Score | Phase 3 Score |
|---|---|---|---|
| < 100m | 5 | 5 | 5 |
| 100–300m | 30 | 15 | 5 |
| 300–600m | 60 | 35 | 20 |
| 600–900m | 80 | 60 | 40 |
| 900–1,200m | 95 | 80 | 60 |
| 1,200–1,800m | 100 | 95 | 80 |
| > 1,800m | 100 | 100 | 100 |

Also tracked: longest_single_elevation_gain (milestone gate input)

#### Multi-day Endurance (20%)
Measured by: longest_single_activity_hrs + consecutive_active_days_count

| Signal | Score contribution |
|---|---|
| Longest activity < 1hr | 10 |
| Longest activity 1–2hrs | 30 |
| Longest activity 2–3hrs | 50 |
| Longest activity 3–5hrs | 70 |
| Longest activity 5–7hrs | 88 |
| Longest activity 7hrs+ | 100 |
| Back-to-back days logged (2 consecutive) | +10 bonus |
| Back-to-back days logged (3+ consecutive) | +20 bonus |

#### Strength (12%)
Measured by: strength_sessions_per_week + incline_sessions_per_week
Enriched by: conversational data (pack weight, incline grade, eccentric work)

| Signal | Score contribution |
|---|---|
| 0 strength sessions/week | 0 |
| 1 session/week, bodyweight only | 20 |
| 1–2 sessions/week, weighted | 40 |
| 2 sessions/week, weighted + incline | 60 |
| 2+ sessions/week, progressive load | 75 |
| Eccentric work confirmed | +15 bonus |
| Pack weight > 4kg in sessions | +10 bonus |

#### Recovery Quality (8%)
Measured by: hrv_trend (7-day) + rhr_trend (7-day)

| Signal | Score |
|---|---|
| HRV declining + RHR rising | 10 — overreach warning |
| HRV flat + RHR flat | 50 — maintenance |
| HRV stable + RHR stable | 65 — good baseline |
| HRV trending up + RHR trending down | 85 — adapting well |
| Strong HRV + low RHR sustained 4 weeks | 100 — excellent recovery |

If HRV/RHR data not available: dimension is excluded from composite,
remaining dimensions re-weighted proportionally. Score clearly labelled
"estimated (no recovery data)" in UI.

---

## 4. ACTIVITY TYPES & KILI RELEVANCE

### 4.1 Activity Hierarchy

Every activity ingested from Zepp/Apple Health/manual CSV is mapped to one of these types.
The goal config scores each type's contribution to readiness differently.

```
TIER 1 — Highly Kili-specific (full weight in all dimensions)
  hike              Outdoor hike with elevation gain
  incline_walk      Treadmill at 10%+ incline, 30min+
  stair_climb       Stair machine / real stairs, sustained

TIER 2 — Good Kili preparation (full aerobic, partial elevation)
  run               Running (zone 2 running = excellent aerobic base)
  trail_run         Even better — zone 2 on trails with elevation

TIER 3 — Aerobic base building (counts for aerobic dimension only)
  cycle             Good early-phase base builder
  swim              General aerobic, low Kili specificity
  walk              Flat walking at zone 2

TIER 4 — Strength (counts for strength dimension only)
  strength_legs     Squats, lunges, step-ups, deadlifts, calf raises
  strength_core     Planks, dead bugs, Russian twists, leg raises
  strength_full     Full body session including legs and core

TIER 5 — Recovery / mobility (noted but minimal score contribution)
  yoga
  stretch
  mobility
```

### 4.2 The Zepp Export Problem — Activity Enrichment

**The core issue:**
Zepp (and most fitness apps) record WHAT you did but not HOW you configured it.

Examples of what's lost in export:
- `treadmill_walk` → no incline data, no pack weight
- `strength_training` → no exercises, no weights, no sets
- `walk` → could be flat park walk or hilly trail walk
- `run` → no terrain context (flat road vs hilly trail)
- `indoor_cycling` → no resistance level

**The solution: Conversational Enrichment**

After each upload, the coach identifies activities that need context and asks naturally.
The enrichment data is stored alongside the raw activity and used in scoring.

#### 4.3 Enrichment Fields Per Activity Type

```
TREADMILL WALK / INCLINE WALK:
  incline_percent        (e.g. "I had it at 12%")
  pack_weight_kg         (e.g. "I was wearing a 5kg vest")
  duration_mins          (usually in export, but confirm if missing)
  felt_zone              (easy/moderate/hard — if HR missing)

STRENGTH SESSION:
  focus_area             (legs / core / upper / full)
  exercises_included     (squats, lunges, deadlifts, etc.)
  weighted               (yes/no)
  approx_weight_kg       (e.g. "60kg squats")
  eccentric_focus        (yes/no — slow lowering phase)
  pack_or_vest_used      (yes/no)

OUTDOOR WALK / HIKE:
  terrain                (flat / hilly / steep trail / mountain)
  elevation_gain_m       (if watch didn't capture accurately)
  pack_weight_kg         (daypack carried?)
  trail_type             (paved / dirt / rocky)

RUN:
  terrain                (road / trail / treadmill)
  incline_context        (hilly route or flat?)

INDOOR CYCLING:
  resistance_level       (low/medium/high — proxy for effort)
  this_is_cross_training (yes — coach notes lower Kili specificity)
```

### 4.4 How Conversational Enrichment Works

**Trigger:** After a bulk upload is processed, the coach scans for activities
in the last batch that are ambiguous or missing enrichment fields.

**Coach behaviour:**
- Asks about ONE activity at a time, not a wall of questions
- Groups similar activities ("I see 3 treadmill sessions this week...")
- Accepts approximate answers ("roughly 10-12%", "somewhere around 5kg")
- Never blocks other features while waiting for enrichment
- Stores enrichment permanently — never asks the same thing twice
  for recurring activity patterns

**Example conversation flow:**

```
COACH: "I imported your last 3 weeks. I noticed 4 treadmill walk sessions —
        what incline were you running them at?"

USER:  "Usually around 12%, sometimes 15%"

COACH: "Got it. Were you carrying any weight — vest, backpack?"

USER:  "Yes, a 6kg pack on the longer ones"

COACH: "Perfect. I'll log those as high-value incline sessions.
        One more — I see two 'strength training' entries. Were those
        legs-focused or more full body?"

USER:  "Legs mostly — squats, lunges, step-ups"

COACH: "Great. That's exactly the right work for Kilimanjaro.
        Here's where your readiness stands after this update..."
```

**Enrichment persistence rules:**
- Once a user says "I always do 12% incline", that becomes their default
  for future treadmill sessions — coach only asks again if context changes
- Defaults can be updated conversationally at any time:
  "I've been bumping up the incline to 15% lately"
- Enrichment data stored in user profile alongside activity log

---

## 5. TRAINING PHASES & TRAJECTORY

### Phase 1 — Base Building (Months 1–6)
**Goal:** Build the aerobic engine. Establish consistency. Introduce elevation.

| Metric | Start | End of Phase |
|---|---|---|
| Weekly elevation gain | 0–200m | 400–600m |
| Zone 2 % | ~30% (current) | 60% |
| Longest activity | 45min | 2.5hrs |
| Active days/week | 3 | 5 |
| Strength sessions/week | 0–1 | 2 |
| Pack weight | none | 3–4kg |
| Incline treadmill | none | 45min @ 10% |

**Coach priorities this phase:**
- Slow down. Every run/hike should feel conversational.
- Introduce incline treadmill as a gym staple.
- First bodyweight → weighted strength progression.
- Consistency > intensity. Boring is correct.

**Key insight for coach:** Zone 2 correction is the #1 priority right now.
Current training is too hard (zone 3-4 dominant). The aerobic base is
being undermined. Slowing down feels wrong but is scientifically correct.

---

### Phase 2 — Endurance Building (Months 7–13)
**Goal:** Extend duration. Add load. Build elevation-specific capacity.

| Metric | Start | End of Phase |
|---|---|---|
| Weekly elevation gain | 600m | 1,200m |
| Zone 2 % | 60% | 70%+ |
| Longest activity | 2.5hrs | 5hrs with pack |
| Active days/week | 5 | 5–6 |
| Strength sessions/week | 2 | 2 |
| Pack weight | 3–4kg | 6–8kg |
| Incline treadmill | 45min @ 10% | 90min @ 12–15% |
| Back-to-back days | none | first 2-day back-to-back |

**Coach priorities this phase:**
- Weekend hikes become the anchor sessions.
- Introduce back-to-back training days (hike Saturday + hike/strength Sunday).
- Elevate incline treadmill grade and duration progressively.
- Begin eccentric descent training (slow step-downs, eccentric squats).

---

### Phase 3 — Simulation (Months 14–19)
**Goal:** Simulate Kilimanjaro conditions. Stress-test readiness.

| Metric | Start | End of Phase |
|---|---|---|
| Weekly elevation gain | 1,200m | 1,800m |
| Zone 2 % | 70% | 70–75% |
| Longest activity | 5hrs | 7–8hrs with pack |
| Active days/week | 5–6 | 6 |
| Strength sessions/week | 2 | 2 |
| Pack weight | 6–8kg | 8kg (match summit weight) |
| Incline treadmill | 90min @ 12% | 90min @ 15% with 6kg |
| Back-to-back days | 2 days | 3+ consecutive days |

**Key simulation milestones this phase:**
- Complete two consecutive 6hr+ hiking days (critical gate)
- Complete a multi-day hike (2–3 nights) if possible
- Train in cold/varied conditions if available
- Break in all gear on actual terrain
- Practice eating and drinking on the move

**Coach priorities this phase:**
- Start asking about gear (boots broken in? poles tested?)
- Flag if no multi-day simulation has been done by month 17
- Remind that at this altitude equivalent effort, zone 2 HR ceiling
  may feel harder — that is correct and expected

---

### Phase 4 — Taper (Months 20–21)
**Goal:** Arrive fresh and injury-free.

| Metric | Target |
|---|---|
| Volume reduction | 30–40% less than Phase 3 peak |
| Intensity | Maintain but don't push |
| Long activities | Keep 1 long hike/week but shorter |
| Strength | Reduce to 1x/week maintenance |
| Focus | Sleep, nutrition, gear, mental prep |

**Coach priorities this phase:**
- Stop adding new training stimulus
- Protect from injury at all costs
- Ensure boots are fully broken in (3+ hikes minimum)
- Gear check: poles, layers, sleeping bag, headlamp
- Begin hydration habits (4–5L/day on mountain)
- Consider Diamox consultation with doctor

---

## 6. MILESTONE GATES

Binary checkpoints — pass/fail. Missing a gate triggers trajectory recalculation,
not failure. Coach provides specific guidance on how to close the gap.

```
MONTH 3:
  ✓/✗  First 2-hour continuous hike completed
  ✓/✗  First weighted strength session (legs) logged

MONTH 6:
  ✓/✗  Zone 2 % above 50% for 4 consecutive weeks
  ✓/✗  First hike with 500m+ elevation gain in single session
  ✓/✗  Incline treadmill 45min at 10%+ completed

MONTH 9:
  ✓/✗  Zone 2 % above 60% for 4 consecutive weeks
  ✓/✗  Longest activity reached 3hrs+
  ✓/✗  Incline treadmill 90min at 12% completed
  ✓/✗  Eccentric descent training added to routine

MONTH 12:
  ✓/✗  First 4–5hr hike with pack (4kg+) completed
  ✓/✗  Weekly elevation gain averaging 900m+ for 4 weeks
  ✓/✗  First back-to-back active days (2 consecutive hike/strength days)

MONTH 15:
  ✓/✗  First back-to-back 3hr+ hike days (two consecutive days)
  ✓/✗  Pack weight in training reached 6kg+
  ✓/✗  Incline treadmill 90min at 15% with 4kg+ pack

MONTH 18:
  ✓/✗  6hr+ hike with 1,000m+ elevation gain completed
  ✓/✗  Two consecutive 6hr+ hiking days completed (critical gate)
  ✓/✗  All gear tested on actual terrain (boots, poles, layers)

MONTH 20:
  ✓/✗  Multi-day hike completed (2–3 nights) OR
        two consecutive 8hr days simulated
  ✓/✗  Doctor consulted re: Diamox / altitude protocol
  ✓/✗  Taper begun — volume reduced, intensity maintained
```

---

## 7. COACH KNOWLEDGE BASE

### 7.1 Core Principles (Always Active)

1. **Kili is endurance, not speed.** Pace is irrelevant. Time on feet is everything.
   The coach never comments on pace as a performance metric.

2. **Zone 2 is the engine.** Every training decision is evaluated through the lens of:
   "Is this building the aerobic base, or burning it?"

3. **Elevation gain is the most Kili-specific training stimulus.**
   Flat running builds aerobic fitness but doesn't prepare legs for sustained climbing.

4. **Back-to-back days > single long efforts.**
   One 8-hour hike is less useful than four 2-hour back-to-back days for Kili prep.

5. **Fitness cannot prevent AMS. Never promise it can.**

6. **The descent will break you if you haven't trained for it.**
   Eccentric strength work is non-negotiable, not optional.

7. **Incline treadmill is a useful tool, not a complete simulation.**
   Real terrain (uneven, rocky, variable) engages different stabilising muscles.
   Treadmill is excellent for elevation gain accumulation and zone 2 aerobic work.

8. **Progressive overload at 10% per week maximum.**
   Ramping too fast = injury. Injury at month 10 = missing months 11–12.

9. **Pack weight must be trained.**
   The body must adapt to carrying load. Surprise pack weight on the mountain = suffering.

10. **Consistency beats heroics.**
    A steady 5-day/week across 21 months beats two intense phases with gaps.

### 7.2 Domain Knowledge — Altitude Physiology

- AMS typically begins above 2,500m
- Lava Tower (4,630m) = first major altitude test on Lemosho route
- Barranco Camp (3,976m) = where you sleep after Lava Tower ("climb high, sleep low")
- Symptoms of mild AMS: headache, nausea, fatigue, dizziness — these are normal up to a point
- HACE and HAPE are medical emergencies — if these are suspected, descend immediately
- Diamox (acetazolamide) is an FDA-approved preventative — doctor consultation recommended
- 4–5 litres of fluid per day on the mountain is standard recommendation
- Appetite suppression at altitude is normal — eating anyway is important

### 7.3 Domain Knowledge — Lemosho Route Specifics

- Day 1: Londorossi Gate (2,100m) → Forest Camp (2,780m) — 7km, 5hrs, 680m gain
- Day 2: Forest Camp → Shira 1 Camp (3,500m) — 8km, 5hrs, 720m gain
- Day 3: Shira 1 → Shira 2 (3,900m) — 5km, 4hrs, 400m gain
- Day 4: Shira 2 → Lava Tower (4,630m) → Barranco Camp (3,976m) — 10km, 7hrs (key acclimatization day)
- Day 5: Barranco → Karanga Camp (4,035m) — 5km, 4hrs (includes Barranco Wall scramble)
- Day 6: Karanga → Barafu Camp (4,673m) — 5km, 4hrs (rest before summit)
- Day 7 (Summit): Barafu → Uhuru Peak (5,895m) → Mweka Camp (3,100m) — 16km, 12–14hrs
- Day 8: Mweka Camp → Mweka Gate (1,640m) — 10km, 3–4hrs descent

Coach uses this to contextualise what the user is training toward.
e.g. "Day 7 on the mountain is what your back-to-back training is building toward."

### 7.4 Domain Knowledge — Strength & Gym Context

- **Squats:** Quadriceps, glutes, hamstrings. Foundation of ascent power.
  Progression: bodyweight → goblet → barbell → with pack
- **Lunges:** Balance + unilateral strength. More trekking-specific than squats
  because each step is a single-leg movement.
- **Step-ups:** Most directly Kili-specific gym movement. Mimics the actual step pattern.
  Increase box height and pack weight over time.
- **Calf raises:** Calves work constantly on ascent. Often undertrained. Include single-leg.
- **Deadlifts:** Posterior chain (hamstrings, glutes, lower back). Protects back on descents.
  Romanian deadlift especially useful for eccentric hamstring loading.
- **Eccentric squats:** Slow down phase (4–5 seconds lowering). Direct descent prep.
- **Slow step-downs:** Step off a box with slow, controlled lowering. Most direct
  descent simulation available in a gym.
- **Planks:** Core stability. Important for pole posture and uneven terrain balance.
- **Single-leg balance:** Ankle stability on rocky terrain.
- **Incline treadmill:** Set 10–15% minimum. Walk at zone 2 HR (not run).
  Add pack weight progressively. 45–90min sessions.
  The point is sustained aerobic elevation load — not speed.
- **Stair machine / Stairmaster:** Excellent elevation sim. Better than flat treadmill.
  Zone 2 HR for 60–90min = ideal session.
- **Decline treadmill:** Eccentric quad loading. Simulates descent.
  Use carefully — higher injury risk. Short sessions initially.

### 7.5 Coach Tone & Persona

- **Honest, direct, knowledgeable.** Not a cheerleader, not a drill sergeant.
- Gives credit when earned. Calls out gaps without shame.
- Uses the user's actual data in every response — no generic advice.
- Always anchors feedback to the Kilimanjaro goal and timeline.
- Comfortable saying "I don't have enough data to assess this."
- Never catastrophises a bad week. Recalibrates instead.
- Celebrates milestone gates when passed — these matter.
- Speaks like a mountaineering coach who has been on the mountain,
  not like a generic fitness app.

**Sample coach voice:**
- "Your zone 2 is improving — this is exactly what the aerobic base needs. Keep going."
- "Three weeks without elevation gain. The mountain won't care that you were busy."
- "Good strength work this week. Have you added the slow eccentric phase to your squats yet?
   That's the part that will save your knees on the descent."
- "This week's HRV dip is worth watching. One more down week and I'd suggest cutting volume."

---

## 8. RED FLAGS — PROACTIVE COACH WARNINGS

These trigger unprompted coach commentary, not just passive score drops.

### Aerobic Red Flags
- Zone 2 % below 40% for 3+ consecutive weeks
  → "You're training in the wrong zone. The aerobic base you need for Kilimanjaro
     builds in zone 2 — not zone 3-4. Slowing down is the right move, not a setback."

- Session average HR trending up for same effort over 3 weeks
  → "Your HR is creeping up for the same workload. This usually means accumulated
     fatigue. A recovery week will likely make you faster, not slower."

### Elevation Red Flags
- No elevation gain for 4+ consecutive weeks
  → "You haven't accumulated meaningful elevation in a month.
     Kilimanjaro demands 900–1,200m of gain per day. This is the gap to close."

- Elevation gain plateau (same number 6+ weeks)
  → "Your elevation load has flatlined. Time to find hillier routes or
     push the treadmill incline higher."

### Strength Red Flags
- No strength sessions for 3+ consecutive weeks
  → "No strength work in 3 weeks. Your legs need direct training —
     the mountain will expose this weakness on days 5 and 6."

- Enrichment data shows no eccentric work ever logged
  → "I haven't seen any descent-specific training. The downhill will be
     brutal on your quads if you haven't trained this. Add slow step-downs
     or eccentric squats — this week."

- Incline treadmill sessions below 10% grade (from enrichment)
  → "12 degrees on a treadmill is where Kilimanjaro prep begins.
     Below 10% is not building the right stimulus."

### Consistency Red Flags
- No activity logged for 10+ days
  → Trajectory recalculates. Coach acknowledges the gap without guilt.
     "Life happens. Here's where you stand and what the next 4 weeks need to look like."

- Active days/week averaging below 3 for a month
  → "You're getting 3 sessions a week but the mountain needs you at 5.
     Even short sessions count — consistency is the goal, not just volume."

### Recovery Red Flags
- HRV declining for 10+ consecutive days
  → "Your recovery data is signalling stress. More training right now may
     be counterproductive. A lighter week could accelerate your progress."

- RHR elevated 5+ bpm above baseline for 7+ days
  → "Elevated resting heart rate sustained for a week. This usually means
     inadequate recovery. Check sleep, stress, and training load."

### Ramp Rate Red Flag
- Week-on-week volume increase > 20%
  → "You increased load by X% this week. Kilimanjaro prep runs 21 months
     for a reason. Injury at month 8 is worse than slower progress now.
     Keep increases to 10% per week maximum."

---

## 9. MISSING DATA HANDLING

### 9.1 Graceful Degradation by Data Availability

| Data Available | Readiness Score | Coach Mode |
|---|---|---|
| Full (all metrics + enrichment) | High confidence composite | Full analysis |
| No HRV/RHR data | Excludes recovery dim, re-weights others | Notes assumption |
| Distance + HR only, no elevation | Elevation dim estimated from activity type | Flags gap |
| Activity types only, no HR | Aerobic dim estimated from duration | Low confidence |
| No upload yet | Score not shown | Onboarding mode |

### 9.2 Conversational Gap-Filling Triggers

After each upload, coach checks for and asks about:
1. Treadmill sessions missing incline data
2. Strength sessions missing focus area
3. Walk/hike sessions with no elevation data (flat terrain or GPS failure)
4. Any session > 90min with no HR data (possible watch removal)
5. First session of a new activity type (context needed)

### 9.3 Quick-Log Fields (No Upload Needed)

User can log these anytime without a file:
- Morning HRV reading
- Morning RHR reading
- Today's activity (manual entry with key fields)
- Pack weight for today's session
- Subjective feel (1–5 scale)
- Milestone completed (e.g. "did my first back-to-back days")
- Gear note (e.g. "boots broken in today")

---

## 10. FUTURE EXTENSIBILITY NOTES
### (For when this config pattern is applied to other goal types)

Fields that are Kilimanjaro-specific and will differ per goal type:
- `summit_elevation_m` → not applicable for marathon, Hyrox
- `pack_weight_on_mountain_kg` → not applicable for road events
- `daily_hiking_hours` → becomes `race_duration_hrs` or similar
- `altitude_zones` → not applicable for sea-level events
- `pole_pole_principle` → becomes pace strategy specific to goal
- `eccentric_descent_training` → not applicable for flat events
- AMS knowledge base → replaced with goal-specific physiology

Fields that are universal and carry across all goal types:
- `readiness_dimensions` (renamed/reweighted per goal)
- `activity_types` (subset changes per goal)
- `milestone_gates` (specific dates/benchmarks change)
- `red_flags` (logic structure same, thresholds change)
- `conversational_enrichment` (fields change, mechanism same)
- `graceful_degradation` (identical logic for all goals)
- `coach_tone` (consistent across goals, persona may vary)
