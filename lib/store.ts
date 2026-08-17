import { Redis } from "@upstash/redis";
import { ProductIntelligence } from "./types";

// Persistent storage via Upstash Redis (Vercel Marketplace integration).
// Redis.fromEnv() reads UPSTASH_REDIS_REST_URL/TOKEN, falling back to the
// legacy KV_REST_API_URL/TOKEN names automatically.
//
// Why not in-memory? On Vercel, each request can land on a different
// serverless function instance with its own memory — an in-memory Map
// does not reliably survive from one request to the next, let alone a
// deploy. Redis is the minimal fix that keeps this a one-file change.
const redis = Redis.fromEnv();

const PRODUCT_KEY = (id: string) => `productiq:product:${id}`;
const INDEX_KEY = "productiq:index"; // sorted set: score = createdAt ms, member = id

export async function saveProduct(p: ProductIntelligence) {
  await redis.set(PRODUCT_KEY(p.id), p);
  await redis.zadd(INDEX_KEY, { score: new Date(p.createdAt).getTime(), member: p.id });
  return p;
}

export async function getProduct(id: string): Promise<ProductIntelligence | undefined> {
  const p = await redis.get<ProductIntelligence>(PRODUCT_KEY(id));
  return p ?? undefined;
}

export async function listProducts(): Promise<ProductIntelligence[]> {
  // Ascending IDs, then reverse in JS — avoids a known reliability issue
  // with the SDK's `rev: true` option on some zrange calls.
  const ids = (await redis.zrange<string[]>(INDEX_KEY, 0, -1)) || [];
  const orderedIds = [...ids].reverse();
  const products = await Promise.all(orderedIds.map((id) => getProduct(id)));
  return products.filter((p): p is ProductIntelligence => Boolean(p));
}

export async function catalogStats() {
  const all = await listProducts();
  const count = all.length;
  const avgQuality = count ? Math.round(all.reduce((s, p) => s + p.qualityScore, 0) / count) : 0;
  const avgCompleteness = count
    ? Math.round(all.reduce((s, p) => s + p.completeness, 0) / count)
    : 0;
  const needsReview = all.filter((p) => p.status === "needs_review").length;
  return { count, avgQuality, avgCompleteness, needsReview };
}
