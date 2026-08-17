"use client";

import { FieldSource } from "@/lib/types";
import { motion } from "framer-motion";
import clsx from "clsx";

const SOURCE_STYLES: Record<FieldSource, { label: string; className: string }> = {
  extracted: { label: "extracted", className: "text-blueprint-green border-blueprint-green/40 bg-blueprint-green/10" },
  inferred: { label: "inferred", className: "text-blueprint-amber border-blueprint-amber/40 bg-blueprint-amber/10" },
  validated: { label: "validated", className: "text-blueprint-accent border-blueprint-accent/40 bg-blueprint-accent/10" },
  corrected: { label: "corrected", className: "text-blueprint-text border-blueprint-text/30 bg-blueprint-text/10" }
};

export function SourceBadge({ source }: { source: FieldSource }) {
  const s = SOURCE_STYLES[source] ?? SOURCE_STYLES.extracted;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono uppercase tracking-wide",
        s.className
      )}
    >
      {s.label}
    </motion.span>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-blueprint-green" : pct >= 55 ? "bg-blueprint-amber" : "bg-blueprint-red";
  return (
    <div className="flex items-center gap-2 w-28">
      <div className="h-1.5 flex-1 rounded-full bg-blueprint-grid overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={clsx("h-full rounded-full", color)}
        />
      </div>
      <span className="text-[11px] font-mono text-blueprint-faint w-8">{pct}%</span>
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const styles = {
    low: "text-blueprint-muted border-blueprint-muted/30 bg-blueprint-muted/10",
    medium: "text-blueprint-amber border-blueprint-amber/40 bg-blueprint-amber/10",
    high: "text-blueprint-red border-blueprint-red/40 bg-blueprint-red/10"
  };
  return (
    <span className={clsx("px-2 py-0.5 rounded border text-[11px] font-mono uppercase", styles[severity])}>
      {severity}
    </span>
  );
}
