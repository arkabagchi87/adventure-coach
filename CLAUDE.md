# CLAUDE.md — Adventure Coach
## Master instructions for Claude Code and all agents

---

## What This Project Is

Adventure Coach is a goal-countdown fitness coaching app built with Next.js.
It helps users track whether they are on track to be ready for a specific
adventure goal by a specific date.

The first goal instance is: **Mount Kilimanjaro, February 2028.**

Read these docs before writing any code:
- `docs/product-decisions.md` — all locked decisions, tech stack, constraints
- `docs/app-overview.md` — screens, components, data flow, file structure
- `docs/kilimanjaro-goal-config.md` — full goal knowledge base and scoring logic

---

## Tech Stack

```
Framework:    Next.js 14 (App Router)
Styling:      Tailwind CSS
Charts:       Recharts
AI:           Gemini 2.5 Flash (google/generative-ai SDK)
Storage:      JSON files in /src/data/
Hosting:      Vercel
```

---

## Agent System

This project uses a multi-agent system. Each agent has a defined role and scope.
Agent definitions live in `.claude/agents/`.

### How the Pipeline Works

1. User instructs the **PM Agent** in plain language
2. PM Agent writes a brief and delegates tasks to specialist agents
3. Specialist agents (Designer, UI Engineer, Backend Engineer) execute
4. **Lead Engineer Agent** reviews all output before it reaches the user
5. Lead Engineer returns a reviewed, coherent result

### Agents

| Agent | File | Role |
|---|---|---|
| Product Manager | `.claude/agents/pm.md` | Orchestrator. Receives user intent, delegates, reviews |
| Designer | `.claude/agents/designer.md` | Design decisions, component specs, visual direction |
| UI Engineer | `.claude/agents/ui-engineer.md` | React components, Tailwind styling, charts |
| Backend Engineer | `.claude/agents/backend-engineer.md` | Parsers, scoring logic, API routes, data layer |
| Lead Engineer | `.claude/agents/lead-engineer.md` | Code review, coherence check, final output |

---

## Absolute Rules — Never Violate

1. **Never expose the Gemini API key to the frontend.**
   All Gemini calls go through `/src/app/api/coach/route.js` (server-side only).
   API key lives in `.env.local` as `GEMINI_API_KEY`.

2. **Never deviate from the canonical activity schema.**
   Defined in `docs/product-decisions.md`. All parsers must output this schema.

3. **Never hardcode goal-specific logic outside the goal config.**
   All Kilimanjaro-specific knowledge lives in `src/config/goals/kilimanjaro.js`.
   The app engine reads the config — it does not contain mountain knowledge itself.

4. **Never block the UI on missing data.**
   Every component renders gracefully with partial or no data.
   Use skeleton states and confidence labels, never error screens.

5. **Never ask the user to re-upload a file to add missing fields.**
   Missing data is collected conversationally by the Coach or via quick-log UI.

6. **Always read all three docs before writing any code.**
   The docs are the source of truth. The code serves the docs.

7. **Mobile-first always.**
   Design and build for mobile viewport first. Desktop is secondary.

---

## Environment Variables

## Environment Variables
Never commit API keys to this repo. It is public.
API keys are stored in .env.local locally and in Vercel dashboard for deployment.
A .env.example file exists in the repo showing which keys are needed — with no values.

---

## Commit Convention

Use conventional commits:
```
feat:     new feature
fix:      bug fix
docs:     documentation changes
style:    styling changes
refactor: code restructure, no behaviour change
chore:    maintenance, dependencies
scaffold: initial structure/skeleton (no real content yet)
```

---

## Vercel Deployment

- Connected to GitHub repo: `arkabagchi87/adventure-coach`
- Auto-deploys on push to `main`
- Environment variables must be set in Vercel dashboard (not committed to repo)
- Build command: `npm run build`
- Output directory: `.next`
