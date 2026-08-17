import { NextRequest, NextResponse } from "next/server";
import { getProduct, saveProduct } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

// Human-in-the-loop correction: a reviewer overrides a specific spec field.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { attribute, value } = body as { attribute: string; value: string };

  const spec = product.specifications.find((s) => s.attribute === attribute);
  if (spec) {
    // Only keep the *original* pipeline output as correctedFrom — if a field
    // is corrected twice, we still want to compare against what the AI
    // produced, not the previous correction.
    const correctedFrom = spec.correctedFrom ?? {
      value: spec.value,
      source: spec.source,
      confidence: spec.confidence
    };
    spec.value = value;
    spec.confidence = 1;
    spec.source = "corrected";
    spec.sourceDetail = "Manually corrected by a human reviewer";
    spec.correctedFrom = correctedFrom;
  }

  product.flags = product.flags.filter((f) => f.field !== attribute);
  product.updatedAt = new Date().toISOString();
  if (product.flags.length === 0 && product.status === "needs_review") {
    product.status = "processed";
  }

  await saveProduct(product);
  return NextResponse.json(product);
}
