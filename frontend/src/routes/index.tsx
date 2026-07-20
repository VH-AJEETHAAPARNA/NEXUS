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
  Mail,
  Linkedin,
  Github,
  Twitter,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Reveal, useCountUp, AnimatedNumber } from "@/hooks/use-reveal";
import { useTypewriter } from "@/hooks/use-typewriter";
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
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
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
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 via-transparent to-transparent animate-shimmer" />

        <div className="mx-auto max-w-6xl px-6 pb-20 pt-24">
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
                NEXUS pairs an RFI Intelligence Agent with a Specification Compliance Agent so data
                centre EPC teams catch spec deviations before install and stop re-answering the same
                questions.
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
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatItem value={67} suffix="%" label="Projects Overrun" />
            <StatItem value={40} suffix="%" label="Time Saved on RFIs" />
            <StatItem value={100} suffix="%" label="Audit Trail" />
            <StatItem value={2} suffix="x" label="Faster Compliance" />
          </div>
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
                Engineers repeatedly ask questions that were answered weeks earlier, buried in RFI
                logs and PDFs.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60" />
                Procurement misalignment and commissioning failures compound into schedule slip and
                margin erosion.
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

      {/* Live Demo Section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            See it in action
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Ask a question. Get a grounded answer.
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <LiveDemo />
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
              Predictive Schedule Risk, Supply Chain Visibility, and Commissioning QA agents plug
              into the same shared knowledge base and cross-agent trigger bus already powering
              NEXUS.
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

      {/* Our Story */}
      <section id="story" className="border-t bg-linear-to-b from-muted/30 to-muted/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal delay={0}>
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                Our Story
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Born from the Data Centre EPC Hackathon 2026
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto mt-10 max-w-3xl space-y-4 text-sm leading-relaxed text-foreground/90">
              <p>
                NEXUS was built during the Data Centre EPC Hackathon 2026 with a clear mission: to
                solve the chronic information fragmentation that plagues EPC projects. We discovered
                that specification deviations and repeated RFIs weren't just annoyances — they were
                systemic failures caused by disconnected data silos.
              </p>
              <p>
                Our solution pairs two specialized AI agents — the RFI Intelligence Agent and the
                Specification Compliance Agent — that share one unified knowledge base. The
                differentiator is our cross-agent auto-linking via clause_id: when an RFI and a
                compliance flag reference the same clause, NEXUS connects them automatically,
                eliminating manual triage and ensuring nothing falls through the cracks.
              </p>
              <p>
                The journey wasn't without challenges: dataset sourcing complexities, SDK drift
                fixes, embedding dimension mismatches, and frontend credit exhaustion tested our
                resolve. But with successful deployment on Render and a shared vision to make EPC
                delivery smarter, faster, and more reliable for India's data centre boom, NEXUS
                stands as a testament to what a focused team can achieve.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Hackathon Team */}
      <section id="team" className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal delay={0}>
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                Hackathon Team
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Meet the Team Behind NEXUS
              </h2>
            </div>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal delay={0}>
              <TeamCard
                image="/images/team/ajee photo 2.jpg"
                name="Ajeetha Aparna V H"
                role="Team Lead, Backend, Integration & Frontend"
                description="Architecting the full-stack solution and orchestrating cross-agent intelligence"
              />
            </Reveal>
            <Reveal delay={80}>
              <TeamCard
                image="/images/team/abi_photo.jpeg"
                name="Abirami S"
                role="Specification Compliance Agent"
                description="Building the compliance engine that catches spec deviations before installation"
              />
            </Reveal>
            <Reveal delay={160}>
              <TeamCard
                image="/images/team/nithya_photo.jpeg"
                name="Nithya Sree Bala"
                role="RFI Intelligence Agent"
                description="Developing the intelligent RFI system that answers questions with grounded citations"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Column 1 — Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
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
              <p className="text-sm text-muted-foreground mb-3">
                EPC Intelligence for Data Centre Construction
              </p>
              <div className="space-y-1 text-xs text-muted-foreground/80">
                <p>© 2026 NEXUS · Built for the Data Centre EPC Hackathon 2026</p>
                <p>Prototype — demo data only</p>
              </div>
            </div>

            {/* Column 2 — Product */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/signin"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    RFI Assistant
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signin"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Compliance Agent
                  </Link>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <a
                    href="#capabilities"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Capabilities
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 — Company */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#team"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hackathon Team
                  </a>
                </li>
                <li>
                  <a
                    href="#story"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Our Story
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4 — Contact */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="mailto:vh.ajeethaaaparna@gmail.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  vh.ajeethaaaparna@gmail.com
                </a>
                <a
                  href="mailto:abi707804@gmail.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  abi707804@gmail.com
                </a>
                <a
                  href="mailto:nithyaselvam768@gmail.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  nithyaselvam768@gmail.com
                </a>
                <p className="text-muted-foreground">Built in India</p>
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 border-t border-border/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
            <p>© 2026 NEXUS. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const count = useCountUp(value, 1500);
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary">
        <AnimatedNumber value={count} />
        {suffix}
      </div>
      <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

function LiveDemo() {
  const question = "What is UPS redundancy?";
  const answer =
    "UPS redundancy refers to the configuration of Uninterruptible Power Supply systems to ensure continuous power availability. According to Section 3.2.1 of the Electrical Standards, N+1 redundancy is required for critical loads, meaning one additional UPS module beyond the maximum load capacity.";

  const { displayedText: questionText } = useTypewriter({
    phrases: [question],
    typingSpeed: 60,
    pauseDuration: 1000,
    loop: false,
  });

  const { displayedText: answerText, isDeleting } = useTypewriter({
    phrases: [answer],
    typingSpeed: 20,
    deletingSpeed: 0,
    pauseDuration: 0,
    loop: false,
  });

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary shrink-0">
          <FileSearch className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium mb-1">RFI Agent</div>
          <div className="text-sm text-foreground/90 font-mono">
            {questionText}
            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 ml-4 border-l-2 border-primary/20 pl-4">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary shrink-0">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium mb-1">Compliance Agent</div>
          <div className="text-sm text-foreground/90 leading-relaxed">
            {answerText}
            {!isDeleting && answerText.length < answer.length && (
              <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
            )}
          </div>
        </div>
      </div>
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
  icon: React.ReactElement;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-xl border bg-card p-6 hover-lift">
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={
        "rounded-xl border bg-card p-5 transition-all duration-300 cursor-pointer " +
        (highlight ? "ring-2 ring-primary/40 shadow-sm" : "") +
        (isHovered ? "shadow-lg scale-[1.02]" : "")
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      {isHovered && (
        <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground animate-crossfade">
          <strong className="text-foreground">Learn more:</strong> This capability integrates
          seamlessly with the NEXUS knowledge base to provide real-time insights and automated
          workflows.
        </div>
      )}
    </div>
  );
}

function RoleChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 hover-lift">
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
    <div className="relative rounded-xl border-2 border-dashed border-foreground/15 bg-transparent p-5 hover-lift">
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

function TeamCard({
  image,
  name,
  role,
  description,
}: {
  image: string;
  name: string;
  role: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border bg-card p-6 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1">
      <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 bg-muted/50">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.parentElement!.innerHTML = `
              <div class="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
                ${name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            `;
          }}
        />
      </div>
      <h3 className="text-base font-semibold">{name}</h3>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-primary">{role}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
