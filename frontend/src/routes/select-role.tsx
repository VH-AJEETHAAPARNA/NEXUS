import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/nexus/auth";
import { ROLE_LABELS, type Role } from "@/lib/nexus/types";
import { getRoleDetails } from "@/lib/nexus/roleDetails";
import { RoleDetailsDialog } from "@/components/nexus/RoleDetailsDialog";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-card";

export const Route = createFileRoute("/select-role")({
  head: () => ({ meta: [{ title: "Choose your view — NEXUS" }] }),
  component: SelectRolePage,
});

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  engineer: "Ask questions, get grounded answers with citations.",
  qa: "Review deviation flags and cross-agent links.",
  pm: "Track KPIs, hours saved, and open risks at a glance.",
  admin: "Full access — ingestion, agent status, all views.",
};

const PRIMARY: Record<Role, string> = {
  engineer: "/app/rfi",
  qa: "/app/compliance",
  pm: "/app/overview",
  admin: "/app/overview",
};

function SelectRolePage() {
  const { user, role, setRole, hydrated } = useAuth();
  const prefersReduced = usePrefersReducedMotion();
  const navigate = useNavigate();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) navigate({ to: "/signin" });
    else if (role) navigate({ to: PRIMARY[role] });
  }, [hydrated, user, role, navigate]);

  if (!hydrated || !user) return null;

  const enter = async (r: Role) => {
    await setRole(r);
    navigate({ to: PRIMARY[r] });
  };

  const pick = (r: Role) => {
    if (getRoleDetails(r)) {
      enter(r);
      return;
    }
    setPendingRole(r);
    setDialogOpen(true);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <motion.div
        className="w-full max-w-3xl"
        initial={!prefersReduced ? { opacity: 0, y: 16 } : undefined}
        animate={!prefersReduced ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary animate-nexus-in">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Access Granted
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight animate-nexus-in"
          style={{ animationDelay: "70ms" }}
        >
          Which view would you like to see?
        </h1>
        <p
          className="mt-1 text-sm text-muted-foreground animate-nexus-in"
          style={{ animationDelay: "140ms" }}
        >
          You can switch views any time from the top navigation.
        </p>

        <StaggerContainer className="mt-6 grid gap-3 sm:grid-cols-2">
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <StaggerItem key={r}>
              <motion.button
                onClick={() => pick(r)}
                whileHover={!prefersReduced ? { y: -2, borderColor: "var(--color-primary)" } : undefined}
                whileTap={!prefersReduced ? { scale: 0.98 } : undefined}
                className="group w-full rounded-xl border bg-card p-5 text-left transition-colors hover:border-primary/60 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-primary)_40%,transparent)]"
              >
                <div className="text-base font-semibold">{ROLE_LABELS[r]}</div>
                <div className="mt-1 text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</div>
                <div className="mt-4 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                  Enter as {ROLE_LABELS[r]} →
                </div>
              </motion.button>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </motion.div>

      <RoleDetailsDialog
        role={pendingRole}
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setPendingRole(null);
        }}
        onSaved={(r) => enter(r)}
      />
    </div>
  );
}
