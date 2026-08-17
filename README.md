# ProductIQ — AI Product Intelligence for Industrial Commerce

Turns whatever limited product info you have — a name, a pasted spec sheet, a source URL —
into a structured, commerce-ready product record where **every field carries its own
confidence score and a trace back to where it came from**: extracted from the source,
inferred from category norms, validated by a cross-check, or corrected by a human reviewer.

Built for the "AI-Powered Product Intelligence for Industrial Commerce" challenge.

## Why this approach

Industrial product data is fragmented across websites, PDFs, legacy catalogs, and digital
assets. The hard part isn't generating *plausible* specs — an LLM will happily invent them.
The hard part is generating specs a catalog manager can actually **trust and audit**. So
instead of one prompt, ProductIQ runs three narrow agents in sequence, each with a single
job and its own honesty constraint:

1. **Extraction Agent** — reads the raw input and pulls out only what's explicitly there.
   Never invents. Confidence starts high (it's literally in the source).
2. **Enrichment Agent** — fills category-standard gaps using general domain knowledge
   (e.g. a conveyor roller implies a shaft type, a motor implies a mounting class). Every
   added field is tagged `inferred`, with the reasoning behind it, at lower confidence.
3. **Validation Agent** — cross-checks the combined field list for plausibility, unit
   consistency, and contradictions. Fields that pass a specific check get promoted to
   `validated` with higher confidence; problems become `flags` for human review — nothing
   is silently fixed or dropped.

The result: a schema where you can always answer "why does the system believe this?" —
which is what actually improves data quality and consistency at catalog scale, and what
makes an AI-generated PDP defensible to a buyer or a compliance reviewer.

## Architecture

```
Input layer          product name · pasted spec text · source URL (fetched server-side)
        │
Agent pipeline        Extraction → Enrichment → Validation   (Groq · Llama 3.3 70B)
        │
Structured schema      { value, confidence, source, sourceDetail } on every field
        │
Experience layer       Product record view (editable)  ·  Catalog dashboard (Recharts)
```

- **Frontend/Backend**: Next.js 14 (App Router), TypeScript, Tailwind CSS — single deployable app
- **AI pipeline**: `lib/ai.ts` — three sequential Groq calls, JSON-only responses, parsed defensively
- **Data layer**: Upstash Redis (`lib/store.ts`), connected via the Vercel Marketplace
  integration. Not in-memory — on serverless, each request can hit a different function
  instance with its own memory, so an in-memory store would lose data between requests,
  not just between restarts. Redis is the minimal fix; a relational store (Postgres/Supabase)
  is the natural next step if this grows past a hackathon MVP.
- **Human-in-the-loop**: `PATCH /api/products/[id]` — a reviewer corrects a flagged field,
  which clears the flag and logs the field as `corrected` with full confidence

## Running locally

```bash
npm install
cp .env.local.example .env.local
# add GROQ_API_KEY (console.groq.com)
# add UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, or run:
#   vercel env pull .env.local
# after connecting the Redis integration below
npm run dev
```

Open `http://localhost:3000`. Use "Load a sample product" on the intake form for a quick
run without typing anything.

## Deploying (Vercel)

```bash
npm i -g vercel
vercel
```

Then, in the Vercel dashboard:
1. Project -> **Storage** -> **Create Database** -> **Upstash** -> **Redis**. This
   auto-injects `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` into the project.
2. Project -> **Settings** -> **Environment Variables** -> add `GROQ_API_KEY`.
3. Redeploy: `vercel --prod`.

## Project structure

```
app/
  page.tsx                 landing + intake form
  product/[id]/page.tsx    traceable product record (editable)
  catalog/page.tsx         catalog-scale dashboard
  api/analyze/route.ts     runs the 3-agent pipeline
  api/products/            list + fetch + correct
components/                UI: intake form, record view, catalog view, badges
lib/
  ai.ts                    the agent pipeline itself
  types.ts                 the traceable product schema
  store.ts                 in-memory catalog store
```

## Roadmap beyond the MVP

- **Vision-language extraction** — read spec-sheet images and product photos directly,
  not just pasted text (Extraction Agent becomes multimodal)
- **Taxonomy-grounded RAG** — ground the Enrichment Agent in real industrial taxonomies
  (ETIM, UNSPSC) instead of general domain knowledge, for category-accurate attributes
- **Knowledge graph** — link compatible parts, accessories, and substitutes across the catalog
- **Batch ingestion** — process a full catalog export, not one product at a time, with the
  same review-queue pattern the dashboard already implies
- **PIM/ERP integration** — push validated records into existing commerce systems

## Team

Stack Ninjas — Prathip Munusamy, Sujitha S, Rohit L, Rubika Devi P, Vijanthar MC
