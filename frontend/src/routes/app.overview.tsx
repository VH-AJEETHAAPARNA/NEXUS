import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Download } from "lucide-react";
import { listFlags, listRFIs } from "@/lib/nexus/api";
import { recordActivity } from "@/lib/nexus/activity";
import { toast } from "sonner";
import { AnimatedNumber } from "@/hooks/use-reveal";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-card";
import { fadeIn } from "@/lib/animations";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

export const Route = createFileRoute("/app/overview")({
  head: () => ({ meta: [{ title: "Overview — NEXUS" }] }),
  component: OverviewPage,
});

function OverviewPage() {
  const prefersReduced = usePrefersReducedMotion();
  const [loadError, setLoadError] = useState<string | null>(null);

  let flags: ReturnType<typeof listFlags> = [];
  let rfis: ReturnType<typeof listRFIs> = [];
  try {
    flags = listFlags();
    rfis = listRFIs();
  } catch (e) {
    console.error("[OverviewPage] Failed to load data:", e);
    setLoadError(e instanceof Error ? e.message : "Failed to load overview data");
  }

  const deviations = flags.length;
  const duplicates = rfis.filter((r) => r.duplicate_of).length;
  const honest = rfis.filter(
    (r) => r.citations.length > 0 || /insufficient grounding/i.test(r.answer),
  ).length;
  const groundingRate = rfis.length ? Math.round((honest / rfis.length) * 100) : 0;
  const hoursSaved = duplicates * 2 + deviations * 8;

  const critical = flags.filter((f) => f.severity === "Critical" && f.status !== "Resolved").length;
  const resolved = flags.filter((f) => f.status === "Resolved").length;

  const trendData = useMemo(() => {
    const byDay = new Map<string, { day: string; RFIs: number; Resolved: number }>();
    const dayKey = (iso: string) => iso.slice(0, 10);
    const label = (iso: string) =>
      new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

    for (const r of rfis) {
      const k = dayKey(r.created_at);
      const existing = byDay.get(k);
      if (existing) {
        existing.RFIs += 1;
      } else {
        byDay.set(k, { day: label(r.created_at), RFIs: 1, Resolved: 0 });
      }
    }
    for (const f of flags) {
      if (f.status !== "Resolved") continue;
      const k = dayKey(f.created_at);
      const existing = byDay.get(k);
      if (existing) {
        existing.Resolved += 1;
      } else {
        byDay.set(k, { day: label(f.created_at), RFIs: 0, Resolved: 1 });
      }
    }
    return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }, [rfis, flags]);

  if (loadError) {
    return (
      <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">Unable to load project overview</p>
        <p className="mt-1 text-xs text-muted-foreground">{loadError}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            setLoadError(null);
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <motion.div
          variants={!prefersReduced ? fadeIn : undefined}
          initial={!prefersReduced ? "hidden" : undefined}
          animate="visible"
        >
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Project Overview</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Delivery health at a glance. Drill in for the underlying flags and RFIs.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  const rows: string[][] = [
                    ["Metric", "Value"],
                    ["Deviations caught", String(deviations)],
                    ["Duplicate RFIs detected", String(duplicates)],
                    ["Grounded or Honestly Declined", `${groundingRate}%`],
                    ["Estimated hours saved", `${hoursSaved}h`],
                    ["Critical issues open", String(critical)],
                    ["Resolved issues", String(resolved)],
                    ["Total RFIs", String(rfis.length)],
                    ["Total compliance flags", String(flags.length)],
                    ["Exported at", new Date().toISOString()],
                  ];

                  // Add trend data
                  if (trendData.length > 0) {
                    rows.push([], ["--- Activity Trend ---"]);
                    rows.push(["Day", "RFIs", "Resolved"]);
                    for (const d of trendData) {
                      rows.push([d.day, String(d.RFIs), String(d.Resolved)]);
                    }
                  }

                  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `nexus-client-summary-${new Date().toISOString().slice(0, 10)}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);

                  recordActivity({
                    category: "export",
                    action: "Client summary exported",
                    detail: `client-summary-${new Date().toISOString().slice(0, 10)}.csv`,
                  });

                  toast.success("Client summary exported", {
                    description: "CSV file has been downloaded.",
                  });
                } catch (err) {
                  console.error("[OverviewPage] Export failed:", err);
                  toast.error("Export failed", {
                    description: err instanceof Error ? err.message : "Could not generate the report.",
                  });
                }
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export client summary
            </Button>
          </header>
        </motion.div>

        <StaggerContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <KPI
              label="Deviations caught"
              value={deviations}
              tooltip="Total compliance flags raised by the Specification Compliance Agent across all ingested submittals."
            />
          </StaggerItem>
          <StaggerItem>
            <KPI
              label="Duplicate RFIs detected"
              value={duplicates}
              tooltip="RFIs the agent recognised as semantically similar to a prior question and answered from cache."
            />
          </StaggerItem>
          <StaggerItem>
            <KPI
              label="Grounded or Honestly Declined"
              value={`${groundingRate}%`}
              tooltip="Every answer either cites a real source or explicitly says it couldn't find one — we never guess. Share of RFIs meeting that bar."
            />
          </StaggerItem>
          <StaggerItem>
            <KPI
              label="Estimated hours saved"
              value={`${hoursSaved}h`}
              tooltip="Basis: 2h per duplicate RFI avoided + 8h per deviation caught before install (rework avoided)."
            />
          </StaggerItem>
        </StaggerContainer>

        <motion.div
          variants={!prefersReduced ? fadeIn : undefined}
          initial={!prefersReduced ? "hidden" : undefined}
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <section className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Activity trend
              </h2>
              <span className="text-[11px] text-muted-foreground">
                RFIs answered & flags resolved per day
              </span>
            </div>
            <div className="mt-4 h-56 w-full">
              {trendData.length === 0 ? (
                <div className="grid h-full place-items-center text-xs text-muted-foreground">
                  No activity yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--color-border)" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--color-border)" }}
                    />
                    <RTooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="RFIs"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "var(--color-primary)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Resolved"
                      stroke="var(--color-foreground)"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </motion.div>

        <motion.div
          variants={!prefersReduced ? fadeIn : undefined}
          initial={!prefersReduced ? "hidden" : undefined}
          animate="visible"
          transition={{ delay: 0.25 }}
        >
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Status summary
            </h2>
            <p className="mt-2 text-base leading-relaxed text-foreground">
              <span className="font-semibold">{critical}</span> Critical issue
              {critical === 1 ? "" : "s"} open, <span className="font-semibold">{resolved}</span>{" "}
              resolved this week.{" "}
              {duplicates > 0 && (
                <>
                  The RFI agent has prevented <span className="font-semibold">{duplicates}</span>{" "}
                  repeat question
                  {duplicates === 1 ? "" : "s"} from reaching engineering.
                </>
              )}
            </p>
            <div className="mt-4">
              <Link
                to="/app/compliance"
                className="text-sm font-medium text-primary underline underline-offset-4"
              >
                View details →
              </Link>
            </div>
          </section>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}

function KPI({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string | number;
  tooltip: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-3 w-3 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-60 text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
        <AnimatedNumber value={value} />
      </div>
    </div>
  );
}
