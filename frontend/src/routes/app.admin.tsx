import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ingestDocument, listDocuments, listFlags, listRFIs, resetDemoData } from "@/lib/nexus/api";
import { listActivities } from "@/lib/nexus/activity";
import type { NexusDocument } from "@/lib/nexus/types";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { audit, clearAudit, FIREWALL_URL, listAudit, verifyCsrf } from "@/lib/nexus/firewall";
import { useAuth } from "@/lib/nexus/auth";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeIn } from "@/lib/animations";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-card";

export const Route = createFileRoute("/app/admin")({
  head: () => ({ meta: [{ title: "Admin — NEXUS" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { csrf } = useAuth();
  const prefersReduced = usePrefersReducedMotion();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<NexusDocument["type"]>("submittal");
  const [equipment, setEquipment] = useState("UPS");
  const [clause, setClause] = useState("");
  const [capacity, setCapacity] = useState("");
  const [voltage, setVoltage] = useState("");
  const [redundancy, setRedundancy] = useState("");
  const [ipRating, setIpRating] = useState("");
  const [tick, setTick] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  let docCount = 0;
  let flagCount = 0;
  let rfiCount = 0;
  let auditEvents: ReturnType<typeof listAudit> = [];
  try {
    docCount = listDocuments().length;
    flagCount = listFlags().length;
    rfiCount = listRFIs().length;
    auditEvents = listAudit();
  } catch (e) {
    console.error("[AdminPage] Failed to load data:", e);
    setLoadError(e instanceof Error ? e.message : "Failed to load admin data");
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // CSRF check — the form's hidden token must match the session token.
    const form = e.currentTarget as HTMLFormElement;
    const token = (form.elements.namedItem("csrf_token") as HTMLInputElement | null)?.value;
    if (!verifyCsrf(token)) {
      toast.error("CSRF token mismatch — refresh and try again.");
      audit({ kind: "csrf.failed", meta: { form: "ingest" } });
      return;
    }
    if (!title.trim()) return;
    audit({ kind: "ingest.submit", meta: { title: title.trim(), type, equipment } });
    const fields: Record<string, string | number> = {};
    if (capacity) fields.capacity_kva = Number(capacity) || capacity;
    if (voltage) fields.voltage = voltage;
    if (redundancy) fields.redundancy = redundancy;
    if (ipRating) fields.ip_rating = ipRating;

    const { doc, flags } = ingestDocument({
      title: title.trim(),
      type,
      equipment_category: equipment,
      fields,
      clause_id: clause || undefined,
    });

    const passes = flags.filter((f) => f.severity === "Pass").length;
    const devs = flags.length - passes;
    toast.success(`Ingested "${doc.title}"`, {
      description:
        type === "submittal"
          ? `Compliance Agent ran: ${devs} deviation${devs === 1 ? "" : "s"}, ${passes} pass${passes === 1 ? "" : "es"}.`
          : "Added to shared knowledge base.",
    });
    setTitle("");
    setCapacity("");
    setVoltage("");
    setRedundancy("");
    setIpRating("");
    setClause("");
    setTick((t) => t + 1);
  };

  if (loadError) {
    return (
      <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">Unable to load admin dashboard</p>
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

  return (
    <StaggerContainer className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]" data-tick={tick}>
      <StaggerItem>
        <section>
          <motion.div
            variants={!prefersReduced ? fadeIn : undefined}
            initial={!prefersReduced ? "hidden" : undefined}
            animate="visible"
          >
            <div className="mb-4">
              <h1 className="text-xl font-semibold tracking-tight">Document ingestion</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a spec, submittal, or standard to the shared knowledge base. Submittals are
                automatically checked against the matching spec by the Compliance Agent.
              </p>
            </div>
          </motion.div>

        <form onSubmit={submit} className="grid gap-4 rounded-xl border bg-card p-5">
          <input type="hidden" name="csrf_token" value={csrf} readOnly />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">Document title</Label>
              <Input
                required
                className="mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vendor Submittal — Generator (PowerGen Ltd)"
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as NexusDocument["type"])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spec">Spec</SelectItem>
                  <SelectItem value="submittal">Submittal</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Equipment category</Label>
              <Select value={equipment} onValueChange={setEquipment}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="CRAC">CRAC</SelectItem>
                  <SelectItem value="Switchgear">Switchgear</SelectItem>
                  <SelectItem value="Generator">Generator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Clause ID (optional)</Label>
              <Input
                className="mt-1"
                value={clause}
                onChange={(e) => setClause(e.target.value)}
                placeholder="e.g. CL-UPS-4.2"
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed p-4">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Structured spec fields
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">capacity_kva</Label>
                <Input
                  className="mt-1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="500"
                />
              </div>
              <div>
                <Label className="text-xs">voltage</Label>
                <Input
                  className="mt-1"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="415V"
                />
              </div>
              <div>
                <Label className="text-xs">redundancy</Label>
                <Input
                  className="mt-1"
                  value={redundancy}
                  onChange={(e) => setRedundancy(e.target.value)}
                  placeholder="N+1"
                />
              </div>
              <div>
                <Label className="text-xs">ip_rating</Label>
                <Input
                  className="mt-1"
                  value={ipRating}
                  onChange={(e) => setIpRating(e.target.value)}
                  placeholder="IP54"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Ingest document</Button>
          </div>
        </form>
        </section>
      </StaggerItem>

      <StaggerItem>
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-green-600" /> System status
            </div>
            <dl className="mt-3 space-y-1.5 text-xs">
              <Row k="RFI Intelligence Agent" v="Online" ok />
              <Row k="Compliance Agent" v="Online" ok />
              <Row k="Last sync" v={new Date().toLocaleTimeString()} />
              <Row k="Documents ingested" v={String(docCount)} />
              <Row k="Compliance flags" v={String(flagCount)} />
              <Row k="RFIs on record" v={String(rfiCount)} />
              <Row k="Backend" v="Mock (in-memory)" />
            </dl>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm font-semibold">Recent activity</div>
            <ul className="mt-3 space-y-2 text-xs">
              {buildActivity()
                .slice(0, 5)
                .map((a) => (
                  <li key={a.id} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="leading-snug text-foreground">{a.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(a.at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              {buildActivity().length === 0 && (
                <li className="text-muted-foreground">No activity yet.</li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Security
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                {FIREWALL_URL ? "Firewall connected" : "Firewall: mock"}
              </span>
            </div>
            <dl className="mt-3 grid gap-1.5 text-xs">
              <Row k="Endpoint" v={FIREWALL_URL || "VITE_FIREWALL_URL (unset)"} />
              <Row k="CSRF token" v={csrf ? `${csrf.slice(0, 8)}…` : "—"} />
              <Row k="Idle timeout" v="15 min" />
              <Row k="Rate limit" v="5 sign-ins / min" />
              <Row k="Audit events" v={String(auditEvents.length)} />
            </dl>
            <div className="mt-3 max-h-40 overflow-auto rounded-md border bg-muted/30 p-2 text-[10px]">
              {auditEvents.length === 0 ? (
                <p className="text-muted-foreground">No audit events yet.</p>
              ) : (
                <ul className="space-y-1">
                  {auditEvents.slice(0, 15).map((a) => (
                    <li key={a.id} className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-mono text-foreground">{a.kind}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {new Date(a.at).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-[11px]"
              onClick={() => {
                clearAudit();
                setTick((t) => t + 1);
                toast.success("Audit log cleared");
              }}
            >
              Clear audit log
            </Button>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm font-semibold">Demo controls</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Reset the mock knowledge base back to seed data — useful between demo runs.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                resetDemoData();
                setTick((t) => t + 1);
                toast.success("Demo data reset to seed state");
              }}
            >
              Reset demo data
            </Button>
          </div>
        </aside>
      </StaggerItem>
    </StaggerContainer>
  );
}

interface Activity {
  id: string;
  label: string;
  at: string;
}

function buildActivity(): Activity[] {
  const items: Activity[] = [];

  // Include all activities from the centralized activity log
  for (const a of listActivities()) {
    items.push({
      id: a.id,
      at: a.at,
      label: a.detail ? `${a.action} — ${a.detail}` : a.action,
    });
  }

  // Also include flag and RFI events from the mock store for backward compatibility
  for (const f of listFlags()) {
    items.push({
      id: `f-${f.id}`,
      at: f.created_at,
      label:
        f.status === "Resolved"
          ? `Flag ${f.id} marked Resolved (${f.equipment_category} · ${f.field})`
          : `Flag ${f.id} raised — ${f.severity} on ${f.equipment_category} ${f.field}`,
    });
    if (f.linked_rfi) {
      items.push({
        id: `l-${f.id}`,
        at: f.created_at,
        label: `${f.linked_rfi} auto-linked to ${f.id} on clause ${f.clause_id ?? "—"}`,
      });
    }
  }
  for (const r of listRFIs()) {
    items.push({
      id: `r-${r.id}`,
      at: r.created_at,
      label: r.duplicate_of
        ? `${r.id} answered from cache (duplicate of ${r.duplicate_of})`
        : `${r.id} answered with ${r.confidence.toLowerCase()} confidence`,
    });
  }
  for (const d of listDocuments()) {
    items.push({
      id: `d-${d.id}`,
      at: (d as unknown as { created_at?: string }).created_at ?? new Date().toISOString(),
      label: `Document "${d.title}" ingested`,
    });
  }
  return items.sort((a, b) => (a.at < b.at ? 1 : -1));
}

function Row({ k, v, ok }: { k: string; v: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={ok ? "font-medium text-green-700" : "font-medium"}>{v}</dd>
    </div>
  );
}
