# ShipFast

> **Live:** [https://shipfast.auxlo.xyz/](https://shipfast.auxlo.xyz/)

A builder-focused platform that scaffolds full-stack SaaS projects from a text prompt. Describe your product, get a production-ready codebase with database schemas, API routes, auth, and Stripe integration - then deploy in one click.

## What it does

**AI Scaffolder** - Describe your SaaS concept and ShipFast generates a complete project: Next.js 15 structure, Prisma/Drizzle database schemas, Zod validation, service layer, auth templates, and Stripe integration blocks. All returned as a virtual file system you can browse and copy.

**Component Forge** - A library of pre-built, accessible UI components (buttons, cards, badges, inputs) styled with Tailwind. Preview live, copy the code, inject schemas directly into your scaffolded project.

**Infrastructure** - Connect to GitHub, push to a repo, and deploy via Vercel with one click. Build logs stream in real time. Projects persist in Supabase with row-level security.

## Tech stack

- **Frontend:** React 19, Vite 6, TypeScript 5.8, Tailwind CSS
- **Auth + DB:** Supabase (auth, project storage, RLS)
- **AI:** Google Gemini API (gemini-3.5-flash-lite with gemini-3.1-flash-lite fallback)
- **Deploy:** Vercel (Edge Functions, Node.js 20.x)
- **Language:** TypeScript throughout

## Project structure

```
├── api/
│   └── proxy.ts              # Gemini API proxy with key rotation + model fallback
├── components/
│   ├── Auth.tsx              # Supabase auth (login/signup)
│   ├── BuildStudio.tsx       # Main workspace: scaffolder, component library, deployments
│   ├── ComponentRegistry.tsx # Reusable UI component catalog
│   ├── Hero.tsx              # Landing hero with animated code terminal
│   ├── Problem.tsx           # Pain points section
│   ├── Solution.tsx          # Benefits section
│   ├── SocialProof.tsx       # Testimonials + animated counters
│   ├── HowItWorks.tsx        # 3-step workflow
│   ├── FinalCTA.tsx          # Closing call to action
│   └── Footer.tsx            # Site footer
├── lib/
│   └── supabase.ts           # Supabase client init
├── App.tsx                   # Root: routing between landing, auth, studio
├── index.tsx                 # Entry point
├── types.ts                  # TypeScript interfaces
├── vercel.json               # Vercel rewrites (SPA + API routes)
└── vite.config.ts            # Vite config
```

## Getting started

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```sh
   npm install
   ```

2. Set environment variables (or use Vercel env):
   - `API_KEY` - Comma-separated Gemini API keys for rotation
   - Supabase config is hardcoded in `lib/supabase.ts`

3. Run the dev server:
   ```sh
   npm run dev
   ```

4. Build for production:
   ```sh
   npm run build
   ```

## How the AI proxy works

`api/proxy.ts` is an Edge Function that:

- Accepts a prompt and forwards it to the Gemini API with a structured system instruction
- Rotates through multiple API keys on 429/quota errors
- Falls back across model versions (gemini-3.5-flash-lite → gemini-3.1-flash-lite)
- Rotates User-Agent headers to reduce rate-limit friction
- Returns structured JSON: project name, database DDL, API routes, virtual file system, recommended components, and deployment steps

## Deploy to Vercel

```sh
npx vercel
```

Or push to a GitHub repo connected to your Vercel project. The `vercel.json` handles SPA routing and API proxying automatically.
