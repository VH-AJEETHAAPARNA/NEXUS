import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/nexus/auth";
import { ROLE_LABELS, type Role } from "@/lib/nexus/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getRoleDetails, type RoleDetails } from "@/lib/nexus/roleDetails";
import { RoleDetailsDialog } from "@/components/nexus/RoleDetailsDialog";

const ROLE_NAV: Record<Role, Array<{ to: string; label: string }>> = {
  engineer: [{ to: "/app/rfi", label: "RFI Assistant" }],
  qa: [
    { to: "/app/compliance", label: "Compliance Flags" },
    { to: "/app/rfi", label: "RFI History" },
  ],
  pm: [
    { to: "/app/overview", label: "Overview" },
    { to: "/app/compliance", label: "Details" },
  ],
  admin: [
    { to: "/app/overview", label: "Overview" },
    { to: "/app/compliance", label: "Compliance" },
    { to: "/app/rfi", label: "RFI" },
    { to: "/app/admin", label: "Admin" },
  ],
};

export function AppShell() {
  const { user, role, setRole, signOut, hydrated, touchSession } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [details, setDetails] = useState<RoleDetails | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!role) {
      setDetails(null);
      return;
    }
    setDetails(getRoleDetails(role));
    const onChange = () => setDetails(getRoleDetails(role));
    window.addEventListener("nexus:role-details-changed", onChange);
    return () => window.removeEventListener("nexus:role-details-changed", onChange);
  }, [role]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) navigate({ to: "/signin" });
    else if (!role) navigate({ to: "/select-role" });
  }, [hydrated, user, role, navigate]);

  // Track user activity for the idle-session timeout.
  useEffect(() => {
    if (!user) return;
    touchSession();
    const bump = () => touchSession();
    window.addEventListener("mousemove", bump, { passive: true });
    window.addEventListener("keydown", bump);
    window.addEventListener("click", bump);
    return () => {
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("click", bump);
    };
  }, [user, touchSession]);

  // Per-route firewall authorization on every navigation inside /app/*.
  useEffect(() => {
    if (!user || !role) return;
    let cancelled = false;
    import("@/lib/nexus/firewall").then(({ firewallCheck, getCsrfToken }) => {
      firewallCheck({
        stage: "route",
        principal: { email: user.email, role },
        csrf: getCsrfToken(),
        meta: { path: pathname },
      }).then((v) => {
        if (!cancelled && !v.allowed) {
          signOut();
          navigate({ to: "/signin" });
        }
      });
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, user, role, signOut, navigate]);

  if (!hydrated || !user || !role) return null;

  const nav = ROLE_NAV[role];

  const switchRole = async (r: Role) => {
    const primary = ROLE_NAV[r][0].to;
    if (!getRoleDetails(r)) {
      setPendingRole(r);
      setEditOpen(true);
      return;
    }
    await setRole(r);
    navigate({ to: primary });
  };

  const displayName = user.name;
  const displayEmail = user.email;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/app/rfi" className="flex items-center gap-2">
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
            <nav className="flex items-center gap-1">
              {nav.map((n) => {
                const active = pathname === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={
                      "rounded-md px-3 py-1.5 text-sm transition-colors " +
                      (active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPendingRole(role);
                setEditOpen(true);
              }}
              className="hidden text-[11px] text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline md:inline"
            >
              Not you? Edit details
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <span className="text-xs text-muted-foreground">Viewing as:</span>
                  <span className="text-xs font-medium">{ROLE_LABELS[role]}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Demo convenience — switch role
                </DropdownMenuLabel>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <DropdownMenuItem key={r} onClick={() => switchRole(r)}>
                    {ROLE_LABELS[r]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/signin" });
                  }}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="relative flex h-1.5 w-1.5" title="Live system">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Live
              </span>
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-xs font-medium leading-tight">{displayName}</div>
              <div className="text-[10px] leading-tight text-muted-foreground">{displayEmail}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div key={role} className="animate-crossfade">
          <Outlet />
        </div>
      </main>

      <RoleDetailsDialog
        role={pendingRole}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setPendingRole(null);
        }}
        onSaved={async (r, d) => {
          setDetails(d);
          if (r !== role) {
            await setRole(r);
            navigate({ to: ROLE_NAV[r][0].to });
          }
        }}
        title="Update your details"
        description="Overwrite what's saved on this device for this role."
      />
    </div>
  );
}
