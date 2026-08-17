import IntakeForm from "@/components/IntakeForm";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/Motion";
import { ArrowRight, FileText, Sparkles, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-blueprint-grid">
        <div className="absolute inset-0 bp-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
          <FadeIn className="flex items-center gap-2 text-xs font-mono tracking-widest text-blueprint-accent uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blueprint-accent" />
            AI product intelligence · industrial commerce
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.1] max-w-3xl">
              A part number and a spec sheet.
              <br />
              <span className="text-blueprint-accent">A traceable product record</span> out the
              other side.
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-2xl text-blueprint-muted text-lg leading-relaxed">
              ProductIQ turns whatever you have — a name, a pasted spec sheet, a source URL — into a
              structured, commerce-ready product record. Every field carries its own confidence
              score and a leader line back to where it came from: extracted, inferred, or validated.
            </p>
          </FadeIn>

          {/* Before / after schematic strip — the signature element */}
          <StaggerGroup className="mt-14 grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            <StaggerItem className="card-lift border border-blueprint-grid rounded-lg bg-blueprint-panel/60 p-5">
              <div className="flex items-center gap-2 text-xs font-mono text-blueprint-faint mb-3">
                <FileText className="w-3.5 h-3.5" /> RAW INPUT
              </div>
              <p className="font-mono text-sm text-blueprint-muted leading-relaxed">
                &quot;3-phase induction motor, 5.5kW, IP55&quot;
                <br />
                <span className="text-blueprint-faint">— that&apos;s all we were given.</span>
              </p>
            </StaggerItem>

            <StaggerItem>
              <ArrowRight className="w-6 h-6 text-blueprint-accent mx-auto hidden md:block" />
            </StaggerItem>

            <StaggerItem className="card-lift border border-blueprint-grid rounded-lg bg-blueprint-panel/60 p-5">
              <div className="flex items-center gap-2 text-xs font-mono text-blueprint-faint mb-3">
                <Sparkles className="w-3.5 h-3.5" /> STRUCTURED RECORD
              </div>
              <ul className="space-y-2 text-sm font-mono">
                <li className="flex justify-between callout pl-3">
                  <span className="callout-dot pl-3 text-blueprint-text">Power rating</span>
                  <span className="text-blueprint-green">extracted · 0.95</span>
                </li>
                <li className="flex justify-between callout pl-3">
                  <span className="callout-dot pl-3 text-blueprint-text">Mounting type</span>
                  <span className="text-blueprint-amber">inferred · 0.62</span>
                </li>
                <li className="flex justify-between callout pl-3">
                  <span className="callout-dot pl-3 text-blueprint-text">Voltage class</span>
                  <span className="text-blueprint-accent">validated · 0.88</span>
                </li>
              </ul>
            </StaggerItem>
          </StaggerGroup>

          <FadeIn delay={0.3} className="mt-10 flex items-center gap-6 text-sm text-blueprint-faint font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Every field is traceable — nothing is silently
              guessed.
            </span>
          </FadeIn>
        </div>
      </section>

      {/* Intake */}
      <FadeIn delay={0.1} className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-display text-xl font-semibold mb-1">Run a product through the pipeline</h2>
        <p className="text-blueprint-muted text-sm mb-8">
          Give it whatever you have. Extraction, enrichment, and validation agents run in
          sequence — you&apos;ll see each stage&apos;s output on the record page.
        </p>
        <IntakeForm />
      </FadeIn>
    </main>
  );
}
