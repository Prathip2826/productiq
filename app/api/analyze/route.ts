import { NextRequest, NextResponse } from "next/server";
import { orchestrate } from "@/lib/ai";
import { saveProduct } from "@/lib/store";
import { RawInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RawInput;
    if (!body.productName || !body.productName.trim()) {
      return NextResponse.json({ error: "productName is required" }, { status: 400 });
    }
    const product = await orchestrate(body);
    await saveProduct(product);
    return NextResponse.json(product);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Failed to process product" },
      { status: 500 }
    );
  }
}
