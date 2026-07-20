import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "./Badges";
import type { RFIRecord } from "@/lib/nexus/types";
import { cn } from "@/lib/utils";

interface Props {
  record: RFIRecord;
  defaultOpen?: boolean;
  compact?: boolean;
}

function summarize(answer: string): { verdict: string; rest: string } {
  const verdictMatch = answer.match(/VERDICT:\s*([^\n]+)/i);
  const verdict = verdictMatch?.[1]?.trim() ?? answer.split("\n")[0] ?? "";
  return { verdict, rest: answer };
}

export function RFIAnswerCard({ record, defaultOpen = false, compact = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const { verdict, rest } = summarize(record.answer);
  const lowConf = record.confidence === "Low";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground",
        compact ? "p-3" : "p-4",
        lowConf && "border-l-4 border-l-amber-500",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-foreground">{record.question}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{verdict}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ConfidenceBadge value={record.confidence} />
          {record.duplicate_of && (
            <span className="inline-flex items-center rounded-md border border-dashed border-foreground/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Duplicate of {record.duplicate_of}
            </span>
          )}
          {record.linked_flag && (
            <span className="inline-flex items-center rounded-md border border-foreground/15 bg-foreground/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground">
              Linked flag {record.linked_flag}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Hide full reasoning" : "Show full reasoning"}
        </Button>
      </div>

      {open && (
        <div className="mt-2 space-y-3 border-t pt-3">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {rest}
          </pre>
          {record.citations.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Citations
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-foreground">
                {record.citations.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">
              No citations — answer flagged for human review.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Asked by {record.asked_by} · {new Date(record.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
