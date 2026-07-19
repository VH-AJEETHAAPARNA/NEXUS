import { cn } from "@/lib/utils";
import type { Confidence, Severity } from "@/lib/nexus/types";

export function ConfidenceBadge({ value }: { value: Confidence }) {
  const styles: Record<Confidence, string> = {
    High: "bg-foreground/5 text-foreground border-foreground/15",
    Medium: "bg-foreground/5 text-muted-foreground border-foreground/10",
    Low: "bg-foreground/5 text-muted-foreground border-dashed border-foreground/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[value],
      )}
    >
      {value} confidence
    </span>
  );
}

export function SeverityBadge({ value }: { value: Severity }) {
  const styles: Record<Severity, string> = {
    Critical: "bg-red-100 text-red-800 border-red-200",
    Major: "bg-orange-100 text-orange-800 border-orange-200",
    Minor: "bg-yellow-100 text-yellow-900 border-yellow-200",
    Pass: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        styles[value],
      )}
    >
      {value}
    </span>
  );
}
