import Groq from "groq-sdk";
import { ProductIntelligence, RawInput, SpecRow, ProductFlag, FieldSource } from "./types";

const MODEL = "openai/gpt-oss-120b";

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local (see README) to run the AI pipeline."
    );
  }
  return new Groq({ apiKey });
}

function extractJson(text: string): any {
  // Models occasionally wrap JSON in prose or code fences — strip defensively.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  const jsonSlice = start >= 0 && end >= 0 ? candidate.slice(start, end + 1) : candidate;
  return JSON.parse(jsonSlice);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retries on: rate limits (429), transient 5xx, and malformed JSON responses
// (the model occasionally returns truncated or non-JSON text). Without this,
// any one of those on any of the 3 sequential calls kills the whole pipeline
// mid-demo — a single retry with backoff covers the overwhelming majority.
async function callAgent(client: Groq, system: string, user: string, attempt = 1): Promise<any> {
  const maxAttempts = 3;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 2000,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    try {
      return extractJson(text);
    } catch (parseErr) {
      if (attempt >= maxAttempts) {
        throw new Error("The model returned a response that couldn't be parsed as JSON.");
      }
      await sleep(400 * attempt);
      return callAgent(client, system, user, attempt + 1);
    }
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    const isRetryable = status === 429 || (status >= 500 && status < 600) || !status;
    if (isRetryable && attempt < maxAttempts) {
      const backoffMs = status === 429 ? 1200 * attempt : 500 * attempt;
      await sleep(backoffMs);
      return callAgent(client, system, user, attempt + 1);
    }
    throw err;
  }
}

async function fetchUrlText(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 6000);
  } catch {
    return "";
  }
}

// STAGE 1 — Extraction Agent: pull only what's explicitly present in the input.
async function runExtraction(client: Groq, input: RawInput, urlText: string) {
  const system = `You are an Extraction Agent for an industrial product-intelligence system.
Read only the raw input provided. Extract facts that are explicitly present — do NOT invent or infer anything.
Return strict JSON only, no prose, matching exactly:
{
  "productTitle": "string or null",
  "category": "string or null",
  "specifications": [{"attribute": "string", "value": "string", "unit": "string or empty", "sourceDetail": "short phrase on where in the input this came from"}]
}`;
  const user = `Product name given: ${input.productName}
Category hint given: ${input.categoryHint || "(none)"}
Pasted spec text: ${input.rawText || "(none)"}
Fetched source URL content: ${urlText || "(none)"}`;
  return callAgent(client, system, user);
}

// STAGE 2 — Enrichment Agent: fill category-standard gaps, clearly tagged as inferred.
async function runEnrichment(client: Groq, input: RawInput, extracted: any) {
  const system = `You are an Enrichment Agent for an industrial product-intelligence system.
You receive facts already extracted from source material. Your job is to propose ADDITIONAL
attributes that are standard/expected for this product category but were missing, using general
industrial domain knowledge (e.g. typical spec fields for the category, standard compliance
markers, common materials). Every value you add is an inference, never invented as fact.
Also write a short description (1 sentence, commerce-ready) and a long description (3-4 sentences,
technical but readable) using both the extracted and inferred facts.
Return strict JSON only, no prose, matching exactly:
{
  "additionalSpecifications": [{"attribute": "string", "value": "string", "unit": "string or empty", "confidence": 0.0-1.0, "sourceDetail": "brief reasoning for this inference"}],
  "shortDescription": "string",
  "longDescription": "string",
  "categoryRefined": "string"
}`;
  const user = `Product name: ${input.productName}
Category: ${extracted.category || input.categoryHint || "unspecified"}
Extracted facts so far: ${JSON.stringify(extracted.specifications || [])}`;
  return callAgent(client, system, user);
}

// STAGE 3 — Validation Agent: cross-check plausibility, flag issues, don't silently fix.
async function runValidation(client: Groq, productName: string, allSpecs: SpecRow[]) {
  const system = `You are a Validation Agent for an industrial product-intelligence system.
Review the combined specification list for plausibility, unit consistency, and contradictions
(e.g. a value outside realistic range for its attribute, mismatched units, two fields that conflict).
For fields with NO issue found, keep them as-is. For fields that pass a specific plausibility check
you performed, you may upgrade confidence slightly and set source to "validated".
List any problems found as flags. Do not delete or silently alter values — only flag them.
Return strict JSON only, no prose, matching exactly:
{
  "upgrades": [{"attribute": "string", "newConfidence": 0.0-1.0}],
  "flags": [{"field": "string", "issue": "short description", "severity": "low|medium|high"}]
}`;
  const user = `Product: ${productName}
Specifications: ${JSON.stringify(allSpecs.map((s) => ({ attribute: s.attribute, value: s.value, unit: s.unit, confidence: s.confidence, source: s.source })))}`;
  return callAgent(client, system, user);
}

function clamp01(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

export async function orchestrate(input: RawInput): Promise<ProductIntelligence> {
  const client = getClient();
  const urlText = input.sourceUrl ? await fetchUrlText(input.sourceUrl) : "";

  const extracted = await runExtraction(client, input, urlText);

  const extractedSpecs: SpecRow[] = (extracted.specifications || []).map((s: any) => ({
    attribute: s.attribute,
    value: s.value,
    unit: s.unit || undefined,
    confidence: 0.95,
    source: "extracted" as FieldSource,
    sourceDetail: s.sourceDetail || "Found directly in provided input"
  }));

  const enriched = await runEnrichment(client, input, extracted);

  const inferredSpecs: SpecRow[] = (enriched.additionalSpecifications || []).map((s: any) => ({
    attribute: s.attribute,
    value: s.value,
    unit: s.unit || undefined,
    confidence: clamp01(s.confidence ?? 0.6),
    source: "inferred" as FieldSource,
    sourceDetail: s.sourceDetail || "Inferred from category norms"
  }));

  let allSpecs: SpecRow[] = [...extractedSpecs, ...inferredSpecs];

  const validation = await runValidation(client, input.productName, allSpecs);

  const upgradeMap = new Map<string, number>(
    (validation.upgrades || []).map((u: any) => [u.attribute, clamp01(u.newConfidence)])
  );
  allSpecs = allSpecs.map((s) => {
    if (upgradeMap.has(s.attribute)) {
      return { ...s, confidence: upgradeMap.get(s.attribute)!, source: "validated" as FieldSource };
    }
    return s;
  });

  const flags: ProductFlag[] = (validation.flags || []).map((f: any) => ({
    field: f.field,
    issue: f.issue,
    severity: (["low", "medium", "high"].includes(f.severity) ? f.severity : "low") as
      | "low"
      | "medium"
      | "high"
  }));

  const now = new Date().toISOString();
  const totalFields = allSpecs.length + 3; // + title, description, category
  const avgConfidence =
    allSpecs.length > 0 ? allSpecs.reduce((s, f) => s + f.confidence, 0) / allSpecs.length : 0.5;
  const completeness = Math.round(Math.min(100, (allSpecs.length / 8) * 100));
  const flagPenalty = flags.reduce(
    (acc, f) => acc + (f.severity === "high" ? 15 : f.severity === "medium" ? 8 : 3),
    0
  );
  const qualityScore = Math.max(
    0,
    Math.min(100, Math.round(avgConfidence * 70 + completeness * 0.3 - flagPenalty))
  );

  const product: ProductIntelligence = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    input,
    productTitle: {
      value: extracted.productTitle || input.productName,
      confidence: extracted.productTitle ? 0.95 : 0.6,
      source: extracted.productTitle ? "extracted" : "inferred",
      sourceDetail: extracted.productTitle ? "Provided in input" : "Used input product name as-is"
    },
    category: {
      value: enriched.categoryRefined || extracted.category || input.categoryHint || "Uncategorized",
      confidence: extracted.category ? 0.9 : 0.65,
      source: extracted.category ? "extracted" : "inferred",
      sourceDetail: extracted.category ? "Stated in source material" : "Inferred from product context"
    },
    shortDescription: {
      value: enriched.shortDescription || "",
      confidence: 0.75,
      source: "inferred",
      sourceDetail: "Generated by enrichment agent from combined extracted + inferred facts"
    },
    longDescription: {
      value: enriched.longDescription || "",
      confidence: 0.75,
      source: "inferred",
      sourceDetail: "Generated by enrichment agent from combined extracted + inferred facts"
    },
    specifications: allSpecs,
    flags,
    qualityScore,
    completeness,
    status: flags.some((f) => f.severity === "high") || completeness < 50 ? "needs_review" : "processed"
  };

  return product;
}
