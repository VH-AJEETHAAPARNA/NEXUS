import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileSearch,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Layers,
  Copy,
  Link2,
  HardHat,
  ClipboardCheck,
  BarChart3,
  Settings,
  CalendarClock,
  Truck,
  ClipboardList,
} from "lucide-react";
import { Reveal } from "@/hooks/use-reveal";
import { AgentLinkDiagram } from "@/components/nexus/AgentLinkDiagram";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXUS — AI Intelligence for Data Centre EPC" },
      {
        name: "description",
        content:
          "Two AI agents, one shared knowledge base, auto-linked findings — for data centre EPC delivery.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background text-xs font-bold">
              N
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">NEXUS</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                EPC Intelligence
              </div>
            </div>
          </Link>
          <Link
            to="/signin"
            className="hover-lift inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal delay={0}>
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" /> AI Intelligence Platform
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">
              Two AI agents
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-4 max-w-2xl text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              One shared knowledge base, auto-linked findings
            </p>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              NEXUS pairs an RFI Intelligence Agent with a Specification Compliance Agent
              so data centre EPC teams catch spec deviations before install and stop
              re-answering the same questions.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 mb-2">
              <AgentLinkDiagram />
            </div>
          </Reveal>
          <Reveal delay={380}>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                to="/signin"
                className="hover-lift inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#how-it-works"
                className="hover-lift inline-flex items-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                See how it works
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-[1fr_1.5fr] md:items-center">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                The Problem
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                67% of data centre EPC projects overrun by 10%+
              </h2>
            </div>
            <ul className="space-y-3 text-sm leading-relaxed text-foreground/90">
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                Vendor submittals miss spec requirements — discovered only after expensive
                installation and rework.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                Engineers repeatedly ask questions that were answered weeks earlier, buried
                in RFI logs and PDFs.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60" />
                Procurement misalignment and commissioning failures compound into schedule
                slip and margin erosion.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            How it works
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            One knowledge base. Two agents that talk to each other.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Reveal delay={0}>
            <Step
              n={1}
              icon={<Layers className="h-5 w-5" />}
              title="Ingest"
              body="Specs, vendor submittals, RFIs, and industry standards flow into one shared, structured knowledge base."
            />
          </Reveal>
          <Reveal delay={100}>
            <Step
              n={2}
              icon={<FileSearch className="h-5 w-5" />}
              title="Agents work in parallel"
              body="RFI Agent answers questions with citations. Compliance Agent checks each submittal against its matching spec."
            />
          </Reveal>
          <Reveal delay={200}>
            <Step
              n={3}
              icon={<GitBranch className="h-5 w-5" />}
              title="Auto-link on shared clauses"
              body="When an RFI and a compliance flag touch the same clause, NEXUS links them automatically — no manual triage."
            />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Capabilities
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Built for grounded, auditable delivery
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Reveal delay={0}>
              <Feature
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Grounded Answers"
                body="Every answer cites the exact clause, or explicitly says it couldn't find one. Never guesses."
              />
            </Reveal>
            <Reveal delay={80}>
              <Feature
                icon={<Copy className="h-5 w-5" />}
                title="Duplicate Detection"
                body="Semantic match catches repeat RFIs instantly and reuses the vetted prior answer."
              />
            </Reveal>
            <Reveal delay={160}>
              <Feature
                icon={<ClipboardCheck className="h-5 w-5" />}
                title="Automated Compliance"
                body="Rule-based field diffing with AI-judged severity: Critical, Major, Minor, or Pass."
              />
            </Reveal>
            <Reveal delay={240}>
              <Feature
                icon={<Link2 className="h-5 w-5" />}
                title="Cross-Agent Intelligence"
                body="The standout: RFIs and flags that share a clause auto-link so nothing falls between the two agents."
                highlight
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            One product, four views
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            The workspace adapts to your role
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <RoleChip icon={<HardHat className="h-4 w-4" />} label="Site Engineer" />
          <RoleChip icon={<ClipboardCheck className="h-4 w-4" />} label="QA/QC Manager" />
          <RoleChip icon={<BarChart3 className="h-4 w-4" />} label="Project Manager" />
          <RoleChip icon={<Settings className="h-4 w-4" />} label="Admin" />
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/signin"
            className="hover-lift inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in to explore <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Roadmap
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built to extend</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Predictive Schedule Risk, Supply Chain Visibility, and Commissioning QA agents
              plug into the same shared knowledge base and cross-agent trigger bus already
              powering NEXUS.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            <Reveal delay={0}>
              <RoadmapCard
                icon={<CalendarClock className="h-5 w-5" />}
                title="Predictive Schedule Risk"
                body="Flags likely slip windows from RFI velocity, deviation load, and vendor lead-time signals."
              />
            </Reveal>
            <Reveal delay={100}>
              <RoadmapCard
                icon={<Truck className="h-5 w-5" />}
                title="Supply Chain Visibility"
                body="Cross-links submittal status with procurement milestones and site logistics windows."
              />
            </Reveal>
            <Reveal delay={200}>
              <RoadmapCard
                icon={<ClipboardList className="h-5 w-5" />}
                title="Commissioning QA"
                body="Turns spec fields and resolved flags into a live L1–L5 commissioning checklist."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground">
          <div>© 2026 NEXUS · Built for the Data Centre EPC Hackathon 2026</div>
          <div>Prototype — demo data only</div>
        </div>
      </footer>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-xl border bg-card p-6">
      <div className="absolute -top-3 left-6 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
        Step {n}
      </div>
      <div className="mt-2 grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border bg-card p-5 " +
        (highlight ? "ring-2 ring-primary/40 shadow-sm" : "")
      }
    >
      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {highlight && (
          <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-primary-foreground">
            Differentiator
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function RoleChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3">
      <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function RoadmapCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-xl border-2 border-dashed border-foreground/15 bg-transparent p-5">
      <div className="absolute -top-2.5 right-4 rounded-md border border-foreground/20 bg-background px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        Coming next
      </div>
      <div className="grid h-8 w-8 place-items-center rounded-md bg-foreground/5 text-muted-foreground">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground/80">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
