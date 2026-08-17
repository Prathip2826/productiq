ProductIQ 🚀
AI-Powered Product Intelligence for Industrial Commerce

Turn fragmented product information into structured, traceable, and confidence-aware product records.

ProductIQ transforms limited product information — such as a product name, pasted specification sheet, or source URL — into a structured, commerce-ready product record.

Unlike traditional LLM-based extraction systems that can generate plausible but unverifiable specifications, ProductIQ is designed around trust, traceability, and human verification.

Every generated field carries:

🎯 A confidence score
🔍 Its source
🧠 Reasoning behind inferred information
✅ Validation status
👤 Human correction history when applicable

Built for the AI-Powered Product Intelligence for Industrial Commerce challenge.

🌟 The Problem

Industrial product data is often scattered across:

🌐 Manufacturer websites
📄 PDF specification sheets
📚 Legacy catalogs
🖼️ Product images and digital assets
📝 Unstructured text
🔗 Multiple external sources

The challenge isn't simply generating product specifications.

The real challenge is:

Can a catalog manager trust where every specification came from?

A conventional LLM can easily generate realistic-looking specifications that never existed in the original source.

ProductIQ addresses this problem by separating extraction, enrichment, and validation into independent stages.

🧠 How ProductIQ Works
                 PRODUCT INPUT
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   Product Name    Spec Text      Source URL
        │              │              │
        └──────────────┼──────────────┘
                       ▼
              ┌─────────────────┐
              │ Extraction Agent│
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Enrichment Agent│
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Validation Agent│
              └────────┬────────┘
                       │
                       ▼
          ┌──────────────────────────┐
          │ Traceable Product Record │
          │                          │
          │ Value                    │
          │ Confidence               │
          │ Source                   │
          │ Source Detail            │
          │ Validation Status        │
          └────────────┬─────────────┘
                       │
                       ▼
              Human Review / Edit
                       │
                       ▼
              Commerce-Ready Data
🤖 Three-Agent AI Pipeline

ProductIQ uses three specialized AI stages instead of asking a single model to perform the entire task.

1. 🔎 Extraction Agent

Goal: Extract only information explicitly present in the provided source.

The Extraction Agent:

Reads the raw product information
Identifies explicit specifications
Avoids unsupported assumptions
Assigns confidence based on source evidence
Preserves the original source context

Principle:

If the source doesn't say it, don't invent it.

2. 🧠 Enrichment Agent

Goal: Fill reasonable gaps using category-level knowledge.

For example:

Input:
Industrial Conveyor Roller


Known:
Diameter = 60 mm
Length = 500 mm


Potential enrichment:
Shaft Type → inferred
Application Category → inferred

Every enriched attribute is explicitly marked as:

inferred

along with its reasoning and confidence level.

This allows users to distinguish between:

What the source actually says

and

What the AI believes is likely.

3. ✅ Validation Agent

Goal: Check the combined product record for consistency and plausibility.

The Validation Agent checks for:

Unit consistency
Contradictory specifications
Suspicious values
Missing information
Logical inconsistencies
Cross-field compatibility

Instead of silently modifying questionable information, ProductIQ creates review flags.

Example:

Weight: 25 kg
Dimensions: 10 × 10 × 10 cm


⚠️ Potential inconsistency detected
→ Requires human review

This makes the system auditable rather than blindly authoritative.

🎯 Core Product Record

Each attribute follows a traceable structure:

{
  value,
  confidence,
  source,
  sourceDetail
}

This makes it possible to answer:

"Why does ProductIQ believe this value?"

For every field, users can understand whether the information was:

Status	Meaning
extracted	Directly found in the provided source
inferred	Added using category/domain knowledge
validated	Passed a validation or consistency check
corrected	Modified by a human reviewer
flagged	Requires human attention
🏗️ Architecture
┌──────────────────────────────────────────┐
│              Input Layer                 │
│ Product Name • Spec Text • Source URL   │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│             AI Processing                │
│                                          │
│ Extraction → Enrichment → Validation     │
│                                          │
│              Groq / Llama                │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│          Structured Data Layer            │
│                                          │
│ Value • Confidence • Source • Reasoning  │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│           Human Review Layer              │
│                                          │
│ Edit • Correct • Validate • Review Flags │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│          Commerce Experience             │
│                                          │
│ Product Record • Catalog Dashboard       │
└──────────────────────────────────────────┘
🛠️ Tech Stack
Layer	Technology
Frontend	Next.js 14
Language	TypeScript
Styling	Tailwind CSS
AI	Groq + Llama 3.3 70B
Backend	Next.js App Router
Charts	Recharts
Deployment	Vercel
Package Manager	npm
✨ Key Features
📥 Flexible Product Intake

Provide product information through:

Product name
Pasted specifications
Source URLs
Sample product data
🔍 Traceable AI Extraction

Every generated attribute maintains its origin and confidence.

🧠 AI-Powered Enrichment

Automatically identifies reasonable category-level attributes while clearly labeling them as inferred.

✅ Automated Validation

Detects:

Contradictions
Suspicious values
Unit inconsistencies
Potential data-quality issues
👤 Human-in-the-Loop Review

Reviewers can:

Edit product fields
Correct incorrect values
Resolve validation flags
Override AI-generated information
📊 Catalog Dashboard

Visualize product data at catalog scale through a centralized dashboard.

🔗 Source Traceability

ProductIQ makes product information auditable by preserving source details alongside generated values.

🚀 Getting Started
1. Clone the Repository
git clone https://github.com/Prathip2826/productiq.git
cd productiq
2. Install Dependencies
npm install
3. Configure Environment Variables

Create a local environment file:

cp .env.local.example .env.local

Add the required credentials:

GROQ_API_KEY=your_groq_api_key

If additional services are configured, add their environment variables as required.

⚠️ Never commit .env.local or API keys to GitHub.

4. Start the Development Server
npm run dev

Open:

http://localhost:3000
🧪 Quick Demo

You don't need to manually enter a complete industrial product.

Use:

Load a sample product

from the intake interface to quickly test the AI pipeline.

The system will:

Input
  ↓
Extract
  ↓
Enrich
  ↓
Validate
  ↓
Generate Product Record
  ↓
Review
📂 Project Structure
productiq/
│
├── app/
│   ├── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   │
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts
│   │   └── products/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   │
│   ├── catalog/
│   │   └── page.tsx
│   │
│   ├── batch/
│   │   └── page.tsx
│   │
│   └── product/
│       └── [id]/
│           └── page.tsx
│
├── components/
│   ├── Badges.tsx
│   ├── BatchUpload.tsx
│   ├── CatalogView.tsx
│   ├── IntakeForm.tsx
│   ├── Motion.tsx
│   ├── NavBar.tsx
│   ├── PageTransition.tsx
│   └── ProductRecord.tsx
│
├── lib/
│   ├── ai.ts
│   ├── seedData.ts
│   ├── store.ts
│   └── types.ts
│
├── package.json
├── package-lock.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
🔌 API Overview
Analyze Product
POST /api/analyze

Runs the AI product intelligence pipeline:

Input
→ Extraction
→ Enrichment
→ Validation
→ Structured Product Record
Products
GET /api/products

Returns available product records.

Product Correction
PATCH /api/products/[id]

Allows a human reviewer to modify a product field and resolve flagged information.

☁️ Deployment

ProductIQ is designed to be deployed as a Next.js application on Vercel.

Build
npm run build
Deploy
npm i -g vercel
vercel

For production:

vercel --prod

Make sure all required environment variables are configured in the deployment platform.

🔐 Security

ProductIQ follows a simple principle:

AI-generated information should be transparent and reviewable.

Important practices:

API keys remain server-side
.env.local should never be committed
AI responses are parsed defensively
Validation issues are surfaced instead of silently discarded
Human corrections remain distinguishable from AI-generated values
🗺️ Roadmap
Phase 1 — MVP
 Product intake
 AI extraction
 AI enrichment
 Validation pipeline
 Confidence scoring
 Source traceability
 Human review
 Product catalog
 Batch workflow foundation
Phase 2 — Multimodal Intelligence
 Vision-language extraction
 Specification sheet image analysis
 Product photo understanding
 OCR-powered document ingestion
Phase 3 — Domain Intelligence
 Taxonomy-grounded RAG
 ETIM integration
 UNSPSC mapping
 Industry-specific knowledge bases
Phase 4 — Catalog Intelligence
 Large-scale batch ingestion
 Automated review queues
 Duplicate product detection
 Product similarity
 Attribute normalization
Phase 5 — Enterprise Integration
 PIM integration
 ERP integration
 Commerce platform connectors
 Knowledge graph
 Supplier data ingestion
💡 Why ProductIQ?

Traditional AI systems often optimize for:

"Generate the answer."

ProductIQ optimizes for:

"Generate an answer that can be understood, verified, and trusted."

That difference matters in industrial commerce, where incorrect specifications can affect:

Purchasing decisions
Product compatibility
Compliance
Inventory systems
Customer trust
Operational safety

ProductIQ puts traceability and human verification at the center of AI-powered product intelligence.

👥 Team
🌙 Moon Knights
Prathip Munusamy
Sujitha S
Vijanthar MC

Built for the:

AI-Powered Product Intelligence for Industrial Commerce Challenge

⭐ Vision

Make every product attribute explainable, traceable, and trustworthy.

ProductIQ aims to become an intelligent layer between fragmented industrial product information and reliable digital commerce.

From raw product data → to trusted product intelligence. 🚀
