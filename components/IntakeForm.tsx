"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wand2 } from "lucide-react";

const STAGES = [
  "Extraction agent reading the raw input…",
  "Enrichment agent filling category-standard gaps…",
  "Validation agent cross-checking plausibility…"
];

const fieldClass =
  "w-full bg-blueprint-panel border border-blueprint-grid rounded-md px-4 py-3 text-sm placeholder:text-blueprint-faint outline-none focus:border-blueprint-accent focus:shadow-[0_0_0_4px_rgba(200,30,58,0.08)]";

export default function IntakeForm() {
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [categoryHint, setCategoryHint] = useState("");
  const [rawText, setRawText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(() => {
        setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
      }, 3200);
    } else {
      setStageIndex(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!productName.trim()) {
      setError("Give it at least a product name to work from.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, categoryHint, rawText, sourceUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push(`/product/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to process product");
      setLoading(false);
    }
  }

  function loadSample() {
    setProductName("Heavy-duty ball bearing conveyor roller");
    setCategoryHint("Material handling — conveyor components");
    setRawText(
      "50mm diameter galvanized steel roller, load capacity 80kg, for gravity roller conveyors. Shaft type: hex axle. Frame width 500mm."
    );
    setSourceUrl("");
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {[
        {
          label: "Product name",
          required: true,
          value: productName,
          set: setProductName,
          placeholder: "e.g. 3-phase induction motor, 5.5kW"
        },
        {
          label: "Category hint (optional)",
          value: categoryHint,
          set: setCategoryHint,
          placeholder: "e.g. Industrial motors — AC induction"
        }
      ].map((f) => (
        <motion.div key={f.label} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-faint mb-2">
            {f.label} {f.required && <span className="text-blueprint-red">*</span>}
          </label>
          <input
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            placeholder={f.placeholder}
            className={fieldClass}
          />
        </motion.div>
      ))}

      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-faint mb-2">
          Paste any spec text you have (optional)
        </label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={4}
          placeholder="Paste a datasheet excerpt, a spec table, an email — anything with product facts in it."
          className={`${fieldClass} resize-none`}
        />
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-faint mb-2">
          Source URL (optional)
        </label>
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://manufacturer.com/product-page"
          className={fieldClass}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-blueprint-red font-mono"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        className="flex items-center gap-4 pt-2"
      >
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.03 }}
          whileTap={loading ? {} : { scale: 0.97 }}
          className="inline-flex items-center gap-2 bg-blueprint-accent text-white font-medium px-5 py-3 rounded-md text-sm shadow-[0_8px_20px_-8px_rgba(200,30,58,0.5)] hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          <AnimatePresence mode="wait">
            <motion.span
              key={loading ? STAGES[stageIndex] : "idle"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? STAGES[stageIndex] : "Generate product intelligence"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <button
          type="button"
          onClick={loadSample}
          disabled={loading}
          className="text-sm text-blueprint-muted hover:text-blueprint-accent underline underline-offset-4 decoration-blueprint-grid"
        >
          Load a sample product
        </button>
      </motion.div>
    </motion.form>
  );
}
