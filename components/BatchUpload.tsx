"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { UploadCloud, Play, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

type CsvRow = {
  productName: string;
  categoryHint?: string;
  rawText?: string;
  sourceUrl?: string;
};

type RowStatus = "pending" | "processing" | "done" | "error";

type RowState = CsvRow & {
  status: RowStatus;
  productId?: string;
  error?: string;
};

const SAMPLE_CSV = `productName,categoryHint,rawText
"3-phase induction motor, 5.5kW, IP55",Industrial motors,
Heavy-duty ball bearing conveyor roller,Material handling,"50mm diameter galvanized steel roller, load capacity 80kg, hex axle, frame width 500mm"
Double-acting hydraulic cylinder,Hydraulics,"100mm bore, 250mm stroke, chrome-plated rod"
Industrial control relay,Electrical control components,"24V DC coil, 2 changeover contacts"
`;

export default function BatchUpload() {
  const [rows, setRows] = useState<RowState[]>([]);
  const [running, setRunning] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function parseCsv(text: string) {
    setParseError(null);
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true
    });
    if (result.errors.length) {
      setParseError(result.errors[0].message);
      return;
    }
    const parsed: RowState[] = result.data
      .filter((r) => r.productName && r.productName.trim())
      .map((r) => ({
        productName: r.productName.trim(),
        categoryHint: r.categoryHint?.trim() || undefined,
        rawText: r.rawText?.trim() || undefined,
        sourceUrl: r.sourceUrl?.trim() || undefined,
        status: "pending"
      }));
    if (!parsed.length) {
      setParseError("No rows with a productName column found.");
      return;
    }
    setRows(parsed);
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => parseCsv(String(reader.result || ""));
    reader.readAsText(file);
  }

  async function runBatch() {
    setRunning(true);
    // Sequential on purpose: respects Groq rate limits and lets the UI show
    // real per-row progress rather than firing everything at once.
    for (let i = 0; i < rows.length; i++) {
      setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "processing" } : r)));
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: rows[i].productName,
            categoryHint: rows[i].categoryHint,
            rawText: rows[i].rawText,
            sourceUrl: rows[i].sourceUrl
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setRows((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: "done", productId: data.id } : r))
        );
      } catch (err: any) {
        setRows((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: "error", error: err.message || "Failed" } : r
          )
        );
      }
      // Small pacing gap between rows, on top of the retry/backoff already
      // built into the agent pipeline itself.
      await new Promise((r) => setTimeout(r, 300));
    }
    setRunning(false);
  }

  const doneCount = rows.filter((r) => r.status === "done").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const finished = rows.length > 0 && rows.every((r) => r.status === "done" || r.status === "error");

  return (
    <div className="space-y-6">
      {rows.length === 0 && (
        <>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="card-lift border border-dashed border-blueprint-grid rounded-lg py-12 text-center cursor-pointer hover:border-blueprint-accent transition-colors"
          >
            <UploadCloud className="w-6 h-6 text-blueprint-accent mx-auto mb-3" />
            <p className="text-sm text-blueprint-text font-medium">
              Drop a CSV here, or click to choose a file
            </p>
            <p className="text-xs text-blueprint-faint font-mono mt-2">
              Columns: productName (required), categoryHint, rawText, sourceUrl
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
          <button
            onClick={() => parseCsv(SAMPLE_CSV)}
            className="text-sm text-blueprint-muted hover:text-blueprint-accent underline underline-offset-4 decoration-blueprint-grid"
          >
            Load a sample CSV instead
          </button>
          {parseError && <p className="text-sm text-blueprint-red font-mono">{parseError}</p>}
        </>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-blueprint-muted">
              {rows.length} product{rows.length !== 1 ? "s" : ""} parsed
              {running && ` — processing ${doneCount + errorCount + 1} of ${rows.length}`}
            </p>
            {!running && !finished && (
              <motion.button
                onClick={runBatch}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-blueprint-accent text-white font-medium px-4 py-2 rounded-md text-sm shadow-[0_8px_20px_-8px_rgba(200,30,58,0.5)] hover:brightness-110 transition"
              >
                <Play className="w-3.5 h-3.5" /> Run batch
              </motion.button>
            )}
            {!running && (
              <button
                onClick={() => setRows([])}
                className="text-sm text-blueprint-muted hover:text-blueprint-accent underline underline-offset-4"
              >
                Start over
              </button>
            )}
          </div>

          <div className="h-1.5 rounded-full bg-blueprint-grid overflow-hidden">
            <motion.div
              className="h-full bg-blueprint-accent rounded-full"
              animate={{ width: `${((doneCount + errorCount) / rows.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="border border-blueprint-grid rounded-lg divide-y divide-blueprint-grid overflow-hidden">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="min-w-0">
                  <div className="text-blueprint-text truncate">{row.productName}</div>
                  {row.error && <div className="text-xs text-blueprint-red font-mono mt-0.5">{row.error}</div>}
                </div>
                <div className="shrink-0 pl-4">
                  {row.status === "pending" && (
                    <span className="text-xs font-mono text-blueprint-faint uppercase">pending</span>
                  )}
                  {row.status === "processing" && (
                    <Loader2 className="w-4 h-4 text-blueprint-accent animate-spin" />
                  )}
                  {row.status === "done" && row.productId && (
                    <Link
                      href={`/product/${row.productId}`}
                      className="inline-flex items-center gap-1 text-blueprint-green text-xs font-mono uppercase hover:underline"
                    >
                      <CheckCircle2 className="w-4 h-4" /> view
                    </Link>
                  )}
                  {row.status === "error" && <XCircle className="w-4 h-4 text-blueprint-red" />}
                </div>
              </div>
            ))}
          </div>

          {finished && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between border border-blueprint-grid rounded-lg px-4 py-3 bg-blueprint-panel/40"
            >
              <p className="text-sm">
                <span className="text-blueprint-green font-medium">{doneCount} processed</span>
                {errorCount > 0 && (
                  <span className="text-blueprint-red ml-2">{errorCount} failed</span>
                )}
              </p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 text-blueprint-accent text-sm font-medium hover:underline"
              >
                View catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
