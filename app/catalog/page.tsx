import { listProducts, catalogStats } from "@/lib/store";
import CatalogView from "@/components/CatalogView";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [products, stats] = await Promise.all([listProducts(), catalogStats()]);
  return <CatalogView products={products} stats={stats} />;
}
