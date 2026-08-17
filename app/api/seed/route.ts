import { NextResponse } from "next/server";
import { saveProduct } from "@/lib/store";
import { buildSeedProducts } from "@/lib/seedData";

export async function POST() {
  const products = buildSeedProducts();
  await Promise.all(products.map((p) => saveProduct(p)));
  return NextResponse.json({ seeded: products.length });
}
