import { NextResponse } from "next/server";
import { listProducts, catalogStats } from "@/lib/store";

export async function GET() {
  const [products, stats] = await Promise.all([listProducts(), catalogStats()]);
  return NextResponse.json({ products, stats });
}
