"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ProductIntelligence } from "@/lib/types";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/Motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { AlertTriangle, LayoutGrid, Sparkles, Loader2 } from "lucide-react";

export default function CatalogView({
  products,
  stats
}: {
  products: ProductIntelligence[];
  stats: { count: number; avgQuality: number; avgCompleteness: number; needsReview: number };
}) {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);

  async function seedDemo() {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      router.refresh();
    } finally {
      setSeeding(false);
    }
  }

  const buckets = [
    { name: "0-40", range: [0, 40] },
    { name: "40-60", range: [40, 60] },
    { name: "60-80", range: [60, 80] },
    { name: "80-100", range: [80, 101] }
  ].map((b) => ({
    name: b.name,
    count: products.filter((p) => p.qualityScore >= b.range[0] && p.qualityScore < b.range[1]).length
  }));

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <FadeIn className="flex items-center gap-2 mb-1">
        <LayoutGrid className="w-4 h-4 text-blueprint-accent" />
        <span className="text-xs font-mono uppercase tracking-widest text-blueprint-accent">
          Catalog view
        </span>
      </FadeIn>
      <FadeIn delay={0.05}>
        <h1 className="font-display text-2xl font-semibold mb-8">
          Product intelligence, at catalog scale
        </h1>
      </FadeIn>

      {products.length === 0 ? (
        <FadeIn delay={0.1} className="border border-dashed border-blueprint-grid rounded-lg py-16 text-center">
          <p className="text-blueprint-muted">No products processed yet in this session.</p>
          <div className="mt-4 flex items-center justify-center gap-5">
            <Link href="/" className="text-blueprint-accent underline underline-offset-4">
              Run your first product
            </Link>
            <span className="text-blueprint-faint text-sm">or</span>
            <motion.button
              onClick={seedDemo}
              disabled={seeding}
              whileHover={seeding ? {} : { scale: 1.03 }}
              whileTap={seeding ? {} : { scale: 0.97 }}
              className="inline-flex items-center gap-1.5 text-sm text-blueprint-accent border border-blueprint-accent/40 rounded-md px-3 py-1.5 hover:bg-blueprint-accent/10 transition disabled:opacity-60"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {seeding ? "Seeding…" : "Seed demo catalog"}
            </motion.button>
          </div>
        </FadeIn>
      ) : (
        <>
          <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StaggerItem>
              <Stat label="Products processed" value={stats.count} />
            </StaggerItem>
            <StaggerItem>
              <Stat label="Avg. quality score" value={stats.avgQuality} accent />
            </StaggerItem>
            <StaggerItem>
              <Stat label="Avg. completeness" value={`${stats.avgCompleteness}%`} />
            </StaggerItem>
            <StaggerItem>
              <Stat label="Flagged for review" value={stats.needsReview} warn={stats.needsReview > 0} />
            </StaggerItem>
          </StaggerGroup>

          <FadeIn delay={0.15} className="card-lift border border-blueprint-grid rounded-lg bg-blueprint-panel/40 p-5 mb-10">
            <h2 className="text-xs font-mono uppercase tracking-wide text-blueprint-faint mb-4">
              Quality score distribution
            </h2>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1D6D6" vertical={false} />
                  <XAxis dataKey="name" stroke="#B99B9B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#B99B9B" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#FFFFFF",
                      border: "1px solid #F1D6D6",
                      borderRadius: 8,
                      fontSize: 12
                    }}
                  />
                  <Bar dataKey="count" fill="#C81E3A" radius={[4, 4, 0, 0]} animationDuration={700} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="border border-blueprint-grid rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blueprint-panel text-left text-[11px] font-mono uppercase tracking-wide text-blueprint-faint">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Quality</th>
                  <th className="px-4 py-3 font-medium">Completeness</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <motion.tbody
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
              >
                {products.map((p) => (
                  <motion.tr
                    key={p.id}
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                    className="border-t border-blueprint-grid hover:bg-blueprint-panel/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/product/${p.id}`} className="hover:text-blueprint-accent transition-colors">
                        {p.productTitle.value}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-blueprint-muted">{p.category.value}</td>
                    <td className="px-4 py-3 font-mono">{p.qualityScore}</td>
                    <td className="px-4 py-3 font-mono text-blueprint-muted">{p.completeness}%</td>
                    <td className="px-4 py-3">
                      {p.status === "needs_review" ? (
                        <span className="inline-flex items-center gap-1 text-blueprint-amber text-xs font-mono uppercase">
                          <AlertTriangle className="w-3 h-3" /> review
                        </span>
                      ) : (
                        <span className="text-blueprint-green text-xs font-mono uppercase">processed</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </FadeIn>
        </>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
  warn
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="card-lift border border-blueprint-grid rounded-lg p-4 bg-blueprint-panel/40">
      <div
        className={`font-display text-2xl font-semibold ${
          warn ? "text-blueprint-amber" : accent ? "text-blueprint-accent" : "text-blueprint-text"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] font-mono uppercase tracking-wide text-blueprint-faint mt-1">
        {label}
      </div>
    </div>
  );
}
