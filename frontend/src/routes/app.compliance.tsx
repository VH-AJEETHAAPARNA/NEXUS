import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeverityBadge } from "@/components/nexus/Badges";
import { listFlags, listRFIs, updateFlagStatus } from "@/lib/nexus/api";
import { recordActivity } from "@/lib/nexus/activity";
import type { FlagStatus, Severity } from "@/lib/nexus/types";
import { useAuth } from "@/lib/nexus/auth";
import { Link2, Download } from "lucide-react";
import { toast } from "sonner";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-card";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeIn, tableRow } from "@/lib/animations";

export const Route = createFileRoute("/app/compliance")({
  head: () => ({ meta: [{ title: "Compliance Flags — NEXUS" }] }),
  component: CompliancePage,
});

const SEVERITY_ORDER: Record<Severity, number> = { Critical: 0, Major: 1, Minor: 2, Pass: 3 };

function CompliancePage() {
  const { role } = useAuth();
  const prefersReduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);

  let flags: ReturnType<typeof listFlags> = [];
  let rfis: ReturnType<typeof listRFIs> = [];
  try {
    flags = listFlags();
    rfis = listRFIs();
  } catch (e) {
    console.error("[CompliancePage] Failed to load data:", e);
    const errorMessage = e instanceof Error ? e.message : "Failed to load compliance data";
    setLoadError(errorMessage);
  }

  const linkedPairs = useMemo(
    () =>
      flags
        .filter((f) => f.linked_rfi)
        .map((f) => ({ flag: f, rfi: rfis.find((r) => r.id === f.linked_rfi) }))
        .filter((p) => p.rfi),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flags, rfis, tick],
  );

  const filtered = useMemo(() => {
    return flags
      .filter((f) => severityFilter === "all" || f.severity === severityFilter)
      .filter((f) => statusFilter === "all" || f.status === statusFilter)
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags, severityFilter, statusFilter, tick]);

  if (loadError) {
    return (
      <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">Unable to load compliance data</p>
        <p className="mt-1 text-xs text-muted-foreground">{loadError}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            setLoadError(null);
            setTick((t) => t + 1);
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const setStatus = (id: string, status: FlagStatus) => {
    updateFlagStatus(id, status);
    setTick((t) => t + 1);
    toast.success(`Flag ${id} marked ${status}`);
  };

  const readOnly = role === "engineer";

  return (
    <div className="space-y-8">
      <motion.div
        variants={!prefersReduced ? fadeIn : undefined}
        initial={!prefersReduced ? "hidden" : undefined}
        animate="visible"
      >
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Compliance Flags</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Deviations between vendor submittals and approved specifications, ranked by severity.
            </p>
          </div>
{(role === "qa" || role === "admin") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  // Build CSV from all flags
                  const rows: string[][] = [
                    [
                      "Equipment",
                      "Field",
                      "Expected",
                      "Actual",
                      "Severity",
                      "Reason",
                      "Linked RFI",
                      "Status",
                      "Clause ID",
                    ],
                  ];
                  for (const f of flags) {
                    rows.push([
                      f.equipment_category,
                      f.field,
                      f.expected_value,
                      f.actual_value,
                      f.severity,
                      f.reason,
                      f.linked_rfi ?? "—",
                      f.status,
                      f.clause_id ?? "—",
                    ]);
                  }

                  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `nexus-qms-audit-report-${new Date().toISOString().slice(0, 10)}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);

                  recordActivity({
                    category: "export",
                    action: "QMS audit report exported",
                    detail: `qms-audit-report-${new Date().toISOString().slice(0, 10)}.csv (${flags.length} flags)`,
                  });

                  toast.success("QMS audit report exported", {
                    description: `CSV with ${flags.length} flag${flags.length === 1 ? "" : "s"} has been downloaded.`,
                  });
                } catch (err) {
                  console.error("[CompliancePage] Export failed:", err);
                  toast.error("Export failed", {
                    description: err instanceof Error ? err.message : "Could not generate the report.",
                  });
                }
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export QMS audit report
            </Button>
          )}
        </header>
      </motion.div>

      {linkedPairs.length > 0 && (
        <motion.div
          variants={!prefersReduced ? fadeIn : undefined}
          initial={!prefersReduced ? "hidden" : undefined}
          animate="visible"
          transition={{ delay: 0.08 }}
        >
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Cross-agent links
            </h2>
            <StaggerContainer className="grid gap-3 md:grid-cols-2">
              {linkedPairs.map(({ flag, rfi }) => {
                if (!rfi) return null;
                return (
                  <StaggerItem key={flag.id}>
                    <div className="relative rounded-xl border-2 border-primary/40 bg-primary/3 p-4">
                      <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                        <Link2 className="h-3 w-3" /> Auto-linked — same clause under review
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border bg-card p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Compliance flag
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <SeverityBadge value={flag.severity} />
                            <span className="text-xs font-medium">{flag.equipment_category}</span>
                          </div>
                          <p className="mt-2 text-sm">
                            <span className="font-medium">{flag.field}</span>: expected{" "}
                            <span className="font-mono">{flag.expected_value}</span>, got{" "}
                            <span className="font-mono">{flag.actual_value}</span>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{flag.reason}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Linked RFI
                          </div>
                          <p className="mt-1 line-clamp-3 text-sm">{rfi.question}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Confidence: {rfi.confidence} · Clause {flag.clause_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </section>
        </motion.div>
      )}

      <motion.div
        variants={!prefersReduced ? fadeIn : undefined}
        initial={!prefersReduced ? "hidden" : undefined}
        animate="visible"
        transition={{ delay: 0.15 }}
      >
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              All flags
            </h2>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="h-8 w-35 text-xs">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Major">Major</SelectItem>
                  <SelectItem value="Minor">Minor</SelectItem>
                  <SelectItem value="Pass">Pass</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-35 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Linked RFI</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No flags match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((f, i) => (
                    <motion.tr
                      key={f.id}
                      variants={!prefersReduced ? tableRow : undefined}
                      initial={!prefersReduced ? "hidden" : undefined}
                      animate="visible"
                      custom={i}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <TableCell className="font-medium">{f.equipment_category}</TableCell>
                      <TableCell className="font-mono text-xs">{f.field}</TableCell>
                      <TableCell className="font-mono text-xs">{f.expected_value}</TableCell>
                      <TableCell className="font-mono text-xs">{f.actual_value}</TableCell>
                      <TableCell>
                        <SeverityBadge value={f.severity} />
                      </TableCell>
                      <TableCell className="max-w-70 text-xs text-muted-foreground">
                        {f.reason}
                      </TableCell>
                      <TableCell className="text-xs">
                        {f.linked_rfi ? (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Link2 className="h-3 w-3" /> {f.linked_rfi}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {readOnly ? (
                          <span className="text-xs text-muted-foreground">{f.status}</span>
                        ) : (
                          <Select
                            value={f.status}
                            onValueChange={(v) => setStatus(f.id, v as FlagStatus)}
                          >
                            <SelectTrigger className="h-7 w-32 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="Under Review">Under Review</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
