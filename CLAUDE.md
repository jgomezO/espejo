# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Espejo ("Mirror") is an emotional reflection web app in Spanish. Users complete 6-layer guided reflections (narrative → emotion → resonance → pattern → relationship → insight), with AI-generated adaptive questions at each layer. Completed reflections grow plants in a gamified isometric garden. The app acts as a mirror for self-reflection — never as a therapist or diagnostic tool.

## Commands

```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # tsc -b && vite build → /dist
npm run lint      # ESLint (flat config, .ts/.tsx)
npm run preview   # Preview production build
npm install --legacy-peer-deps  # Required due to Vite 8 peer dep conflicts
```

## Architecture

**Stack**: React 19 + TypeScript/JSX, Vite 8, Tailwind CSS 4, HeroUI, Framer Motion, Supabase (auth/DB/edge functions), Anthropic Claude API.

**Entry flow**: `index.html` → `src/main.tsx` → `src/App.jsx` (HeroUIProvider → BrowserRouter → AuthProvider → UserProvider → ReflectionProvider → AppShell → Routes)

### Key directories

- `src/pages/` — Route-level pages (Home, Reflect, History, Garden, Profile, ReflectionChat)
- `src/components/` — UI components organized by feature (reflection/, garden/, history/, home/, auth/, safety/, onboarding/, crisis/)
- `src/context/` — React Context + useReducer state: AuthContext (Supabase session/Google OAuth), UserContext (preferences with localStorage + Supabase sync), ReflectionContext (current reflection state)
- `src/services/` — API layer: supabaseClient.js (init), anthropicService.js (Claude calls with streaming), chatService.js (chat persistence via REST), storageService.js (reflection CRUD, local-first + Supabase sync)
- `src/hooks/` — useReflection (context wrapper), useAIInsight (AI generation), useLocalStorage
- `src/utils/` — prompts.js (all AI system prompts ~1000 LOC), emotions.js (12 emotion types with colors/icons), fallbackQuestions.js, dailyPrompts.js, legalTexts.js

### Data persistence

Local-first: all writes go to localStorage immediately, then async-sync to Supabase (5s timeout, silent failure). On first login, local reflections migrate to Supabase. The app works fully offline via localStorage fallback.

### AI integration

Claude API calls are proxied through a Supabase Edge Function at `/functions/v1/claude`. The Vite dev server proxies `/functions/*` to `VITE_SUPABASE_URL`. Client-side rate limiting enforces 2s minimum between calls. Used for: adaptive layer questions, AI mirror summaries, therapy bridge questions, body location prompts, example placeholders.

### Environment

Requires `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`).

### Deployment

Vercel (SPA rewrite configured in `vercel.json`).

## Code patterns

- Mixed .tsx/.jsx — not all files are converted to TypeScript yet
- Strict TS config: noUnusedLocals, noUnusedParameters enabled
- All UI text is in Spanish
- 12 emotions: tristeza, rabia, miedo, vergüenza, frustración, ansiedad, culpa, soledad, impotencia, decepción, envidia, ternura
- 6 reflection layers: narrative, emotion, resonance, pattern, relationship, insight
