import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, type Role } from "@/lib/nexus/types";
import {
  getRoleDetails,
  isValidEmail,
  saveRoleDetails,
  type RoleDetails,
} from "@/lib/nexus/roleDetails";

interface Props {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (role: Role, details: RoleDetails) => void;
  title?: string;
  description?: string;
}

export function RoleDetailsDialog({
  role,
  open,
  onOpenChange,
  onSaved,
  title,
  description,
}: Props) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; company?: string; email?: string }>({});

  useEffect(() => {
    if (!open || !role) return;
    const existing = getRoleDetails(role);
    setName(existing?.name ?? "");
    setCompany(existing?.company ?? "");
    setEmail(existing?.email ?? "");
    setErrors({});
  }, [open, role]);

  if (!role) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Required";
    if (!company.trim()) next.company = "Required";
    if (!email.trim()) next.email = "Required";
    else if (!isValidEmail(email)) next.email = "Enter a valid email";
    setErrors(next);
    if (Object.keys(next).length) return;
    const details: RoleDetails = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
    };
    saveRoleDetails(role, details);
    onSaved(role, details);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 inline-flex w-fit items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-5 bg-primary/60" />
            Entering as {ROLE_LABELS[role]}
          </div>
          <DialogTitle>{title ?? "A few quick details"}</DialogTitle>
          <DialogDescription>
            {description ?? "Saved on this device only — used to personalise this role's session."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rd-name" className="text-xs">
              Full name
            </Label>
            <Input
              id="rd-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoFocus
            />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rd-company" className="text-xs">
              Company
            </Label>
            <Input
              id="rd-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme EPC"
            />
            {errors.company && <p className="text-[11px] text-destructive">{errors.company}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rd-email" className="text-xs">
              Work email
            </Label>
            <Input
              id="rd-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@acme.com"
            />
            {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
          </div>
          <div className="rounded-md border border-primary/25 bg-primary/[0.05] p-2.5 text-[11px] leading-relaxed text-foreground/75">
            Role is set to <span className="font-medium text-foreground">{ROLE_LABELS[role]}</span>{" "}
            based on the card you selected.
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
