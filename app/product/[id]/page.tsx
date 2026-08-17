import { getProduct } from "@/lib/store";
import ProductRecord from "@/components/ProductRecord";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-blueprint-muted">
          This record isn&apos;t here — it may have expired or the ID is wrong.
        </p>
        <Link href="/" className="text-blueprint-accent underline underline-offset-4 mt-4 inline-block">
          Generate a new one
        </Link>
      </main>
    );
  }
  return <ProductRecord initial={product} />;
}
