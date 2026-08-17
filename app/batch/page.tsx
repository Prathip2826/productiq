import BatchUpload from "@/components/BatchUpload";

export default function BatchPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold mb-1">Batch upload</h1>
      <p className="text-blueprint-muted text-sm mb-8">
        Drop in a CSV of products and the same 3-agent pipeline runs on each row in sequence —
        this is the same code path as the single-product form, just looped. Results land
        straight in the catalog.
      </p>
      <BatchUpload />
    </main>
  );
}
