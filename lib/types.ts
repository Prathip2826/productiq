export type FieldSource = "extracted" | "inferred" | "validated" | "corrected";

export interface TraceableField {
  value: string;
  confidence: number; // 0-1
  source: FieldSource;
  sourceDetail: string; // e.g. "found in pasted spec text, line 3" or "inferred from category norms for induction motors"
}

export interface SpecRow {
  attribute: string;
  value: string;
  unit?: string;
  confidence: number;
  source: FieldSource;
  sourceDetail: string;
  // Present only on fields a human has corrected — preserves what the
  // pipeline originally produced, so the record can show a before/after.
  correctedFrom?: {
    value: string;
    source: FieldSource;
    confidence: number;
  };
}

export interface ProductFlag {
  field: string;
  issue: string;
  severity: "low" | "medium" | "high";
}

export interface RawInput {
  productName: string;
  categoryHint?: string;
  rawText?: string;
  sourceUrl?: string;
}

export interface ProductIntelligence {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: RawInput;
  productTitle: TraceableField;
  category: TraceableField;
  shortDescription: TraceableField;
  longDescription: TraceableField;
  specifications: SpecRow[];
  flags: ProductFlag[];
  qualityScore: number; // 0-100, aggregate of completeness + confidence
  completeness: number; // 0-100
  status: "processed" | "needs_review";
}
