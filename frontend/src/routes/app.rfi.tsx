import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askRFI, loadRFIs, listRFIs, subscribeDataChanges } from "@/lib/nexus/api";
import type { RFIRecord } from "@/lib/nexus/types";
import { RFIAnswerCard } from "@/components/nexus/RFIAnswerCard";
import { useAuth } from "@/lib/nexus/auth";
import { getRoleDetails } from "@/lib/nexus/roleDetails";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-card";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeIn } from "@/lib/animations";

export const Route = createFileRoute("/app/rfi")({
  head: () => ({ meta: [{ title: "RFI Assistant — NEXUS" }] }),
  component: RFIPage,
});

function RFIPage() {
  const { role } = useAuth();
  const prefersReduced = usePrefersReducedMotion();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0); // re-render after mock store mutation
  const [lastId, setLastId] = useState<string | null>(null);
  const [rfis, setRfis] = useState<RFIRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const readOnly = role !== "engineer" && role !== "admin";

  const loadRfis = async (): Promise<RFIRecord[]> => {
    console.log("[RFI Page] Loading RFIs...");
    const data = await loadRFIs();
    console.log("[RFI Page] Loaded RFIs:", data.length, "records");
    setRfis(data);
    return data;
  };

  useEffect(() => {
    loadRfis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // Subscribe to data changes so the list refreshes when new flags/RFIs are created elsewhere
  useEffect(() => {
    const unsub = subscribeDataChanges(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const ask = async () => {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const asker = (role && getRoleDetails(role)?.email) || undefined;
      console.log("[RFI Page] Asking question:", q);
      await askRFI(q, asker);
      console.log("[RFI Page] Question asked, reloading list...");
      const updated = await loadRfis();
      setLastId(updated[0]?.id ?? null);
      setQuestion("");
      setTick((t) => t + 1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("[RFI Page] Error asking question:", e);
      setError(`Failed to get answer: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section>
        <motion.div
          variants={!prefersReduced ? fadeIn : undefined}
          initial={!prefersReduced ? "hidden" : undefined}
          animate="visible"
        >
          <div className="mb-4">
            <h1 className="text-xl font-semibold tracking-tight">RFI Assistant</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask a question. Answers are grounded in ingested specs, submittals and standards.
              Duplicate detection prevents re-asking previously answered questions.
            </p>
          </div>
        </motion.div>

        {!readOnly && (
          <motion.div
            variants={!prefersReduced ? fadeIn : undefined}
            initial={!prefersReduced ? "hidden" : undefined}
            animate="visible"
            transition={{ delay: 0.08 }}
          >
            <div className="rounded-xl border bg-card p-4">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Can we substitute a 450kVA UPS for the specified 500kVA unit?"
                className="min-h-90 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                disabled={loading}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") ask();
                }}
              />
              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <p className="text-[11px] text-muted-foreground">
                  ⌘/Ctrl + Enter to submit · answers cite the exact clause
                </p>
                <Button size="sm" onClick={ask} disabled={loading || !question.trim()}>
                  {loading ? "Thinking…" : "Ask agent"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="mt-6"
          data-tick={tick}
          variants={!prefersReduced ? fadeIn : undefined}
          initial={!prefersReduced ? "hidden" : undefined}
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {readOnly ? "RFI history (read-only)" : "Your RFI history"}
            </h2>
            <span className="text-xs text-muted-foreground">{rfis.length} total</span>
          </div>

          {rfis.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Ask your first question below.
            </div>
          ) : (
            <StaggerContainer className="space-y-2">
              {rfis.map((r) => (
                <StaggerItem key={r.id}>
                  <RFIAnswerCard record={r} defaultOpen={r.id === lastId} compact />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </motion.div>
      </section>

      <motion.aside
        className="hidden lg:block"
        variants={!prefersReduced ? fadeIn : undefined}
        initial={!prefersReduced ? "hidden" : undefined}
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <div className="sticky top-20 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold">How the agent grounds answers</h3>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li>• Checks semantic similarity to prior RFIs (duplicate detection).</li>
            <li>• Retrieves relevant clauses from specs, submittals and standards.</li>
            <li>• Cites the exact document/clause used.</li>
            <li>
              • Returns <b>Low confidence</b> or "insufficient grounding" instead of guessing.
            </li>
          </ul>
          <div className="mt-4 rounded-lg border bg-background/60 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Try
            </div>
            <ul className="mt-1 space-y-1 text-xs text-foreground/80">
              <li>"CRAC clearance per BICSI 002?"</li>
              <li>"Switchgear redundancy per Section 4.2?"</li>
            </ul>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
