"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProductIntelligence } from "@/lib/types";
import { SourceBadge, ConfidenceBar, SeverityBadge } from "@/components/Badges";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/Motion";
import { AlertTriangle, Check, Pencil, ArrowLeft, ArrowRight } from "lucide-react";

export default function ProductRecord({ initial }: { initial: ProductIntelligence }) {
  const [product, setProduct] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  async function saveCorrection(attribute: string) {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attribute, value: draft })
    });
    if (res.ok) {
      const updated = await res.json();
      setProduct(updated);
    }
    setEditing(null);
  }

  const scoreColor =
    product.qualityScore >= 80
      ? "text-blueprint-green"
      : product.qualityScore >= 55
      ? "text-blueprint-amber"
      : "text-blueprint-red";

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-blueprint-muted hover:text-blueprint-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> New product
      </Link>

      {/* Header */}
      <FadeIn className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-blueprint-grid">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SourceBadge source={product.productTitle.source} />
            {product.status === "needs_review" && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-1 text-[11px] font-mono uppercase text-blueprint-amber"
              >
                <AlertTriangle className="w-3 h-3" /> Needs review
              </motion.span>
            )}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold leading-tight">
            {product.productTitle.value}
          </h1>
          <p className="text-blueprint-muted text-sm mt-2 font-mono">{product.category.value}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="card-lift border border-blueprint-grid rounded-lg px-6 py-4 text-center bg-blueprint-panel/60 shrink-0"
        >
          <div className={`font-display text-3xl font-semibold ${scoreColor}`}>
            {product.qualityScore}
          </div>
          <div className="text-[11px] font-mono uppercase tracking-wide text-blueprint-faint mt-1">
            quality score
          </div>
          <div className="text-[11px] font-mono text-blueprint-faint mt-2">
            {product.completeness}% complete
          </div>
        </motion.div>
      </FadeIn>

      {/* Descriptions */}
      <FadeIn delay={0.1} className="grid md:grid-cols-2 gap-6 py-8 border-b border-blueprint-grid">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-wide text-blueprint-faint">
              Short description
            </span>
            <SourceBadge source={product.shortDescription.source} />
          </div>
          <p className="text-sm leading-relaxed">{product.shortDescription.value}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-wide text-blueprint-faint">
              Long description
            </span>
            <SourceBadge source={product.longDescription.source} />
          </div>
          <p className="text-sm leading-relaxed text-blueprint-muted">
            {product.longDescription.value}
          </p>
        </div>
      </FadeIn>

      {/* Specifications */}
      <div className="py-8 border-b border-blueprint-grid">
        <h2 className="font-display font-semibold mb-4">Specifications</h2>
        <div className="border border-blueprint-grid rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blueprint-panel text-left text-[11px] font-mono uppercase tracking-wide text-blueprint-faint">
                <th className="px-4 py-3 font-medium">Attribute</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium w-10" />
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {product.specifications.map((spec) => {
                const flag = product.flags.find((f) => f.field === spec.attribute);
                return (
                  <motion.tr
                    key={spec.attribute}
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="border-t border-blueprint-grid hover:bg-blueprint-panel/40 transition-colors group"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="text-blueprint-text">{spec.attribute}</div>
                      {flag && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <SeverityBadge severity={flag.severity} />
                          <span className="text-[11px] text-blueprint-muted">{flag.issue}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top font-mono">
                      {editing === spec.attribute ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveCorrection(spec.attribute)}
                            className="bg-white border border-blueprint-accent rounded px-2 py-1 text-sm w-40 outline-none"
                          />
                          <button
                            onClick={() => saveCorrection(spec.attribute)}
                            className="text-blueprint-green hover:scale-110 transition-transform"
                            aria-label="Save correction"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span title={spec.sourceDetail} className="callout-dot pl-3">
                          {spec.correctedFrom && (
                            <span className="text-blueprint-faint line-through decoration-blueprint-red/50 mr-1.5">
                              {spec.correctedFrom.value}
                            </span>
                          )}
                          {spec.correctedFrom && (
                            <ArrowRight className="w-3 h-3 inline text-blueprint-faint mr-1.5" />
                          )}
                          {spec.value} {spec.unit || ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <SourceBadge source={spec.source} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ConfidenceBar value={spec.confidence} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      {editing !== spec.attribute && (
                        <button
                          onClick={() => {
                            setEditing(spec.attribute);
                            setDraft(spec.value);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-blueprint-faint hover:text-blueprint-accent transition"
                          aria-label={`Correct ${spec.attribute}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
        <p className="text-[11px] font-mono text-blueprint-faint mt-2">
          Hover a value to see its source detail. Corrections you make are logged as
          &quot;corrected&quot; and clear any related flag.
        </p>
      </div>

      {/* Flags */}
      <AnimatePresence>
        {product.flags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blueprint-amber" /> Flagged for review
            </h2>
            <StaggerGroup className="space-y-2">
              {product.flags.map((f, i) => (
                <StaggerItem
                  key={i}
                  className="flex items-center justify-between border border-blueprint-grid rounded-md px-4 py-3 bg-blueprint-panel/40"
                >
                  <div>
                    <span className="font-mono text-sm">{f.field}</span>
                    <span className="text-blueprint-muted text-sm ml-2">— {f.issue}</span>
                  </div>
                  <SeverityBadge severity={f.severity} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
