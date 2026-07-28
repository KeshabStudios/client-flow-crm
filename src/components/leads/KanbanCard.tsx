import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { DollarSign, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface CustomerInfo {
  full_name: string;
  company_name?: string | null;
}

export interface KanbanCardData {
  id: string;
  title: string;
  value?: number | null;
  stage: Lead["stage"];
  expected_close_date?: string | null;
  customer?: CustomerInfo | null;
}

interface KanbanCardProps {
  lead: KanbanCardData;
  isDragOverlay?: boolean;
  onClick?: () => void;
}

const stageAccentMap: Record<string, string> = {
  new: "border-l-slate-400",
  qualified: "border-l-blue-400",
  proposal: "border-l-indigo-400",
  negotiation: "border-l-amber-400",
  won: "border-l-emerald-400",
  lost: "border-l-red-400",
};

export function KanbanCard({ lead, isDragOverlay, onClick }: KanbanCardProps) {
  const { symbol } = useCurrency();
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: lead.id,
    data: { type: "lead", lead },
    disabled: isDragOverlay,
  });

  const accentBorder = stageAccentMap[lead.stage] || "border-l-border";

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
      onClick={onClick}
      className={cn(
        "group rounded-lg border-l-4 bg-card p-3.5 transition-all duration-200",
        accentBorder,
        "border shadow-sm hover:shadow-md",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30 scale-95",
        isDragOverlay && "shadow-xl rotate-2 scale-105 border-l-primary/60 cursor-grabbing",
      )}
    >
      {/* Title */}
      <p className="text-sm font-semibold leading-snug line-clamp-2 mb-2.5">
        {lead.title}
      </p>

      {/* Value */}
      {lead.value != null && lead.value > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
          <DollarSign className="h-3 w-3" />
          <span>
            {symbol}{Number(lead.value).toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/50">
        {lead.customer ? (
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <User className="h-3 w-3 text-primary/60" />
            </div>
            <span className="text-[11px] text-muted-foreground truncate font-medium">
              {lead.customer.full_name}
            </span>
          </div>
        ) : (
          <div />
        )}

        {lead.expected_close_date && (
          <div className="flex items-center gap-1 shrink-0 text-muted-foreground/70">
            <Calendar className="h-3 w-3" />
            <span className="text-[11px] font-medium">
              {new Date(lead.expected_close_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Non-draggable card used inside DragOverlay */
export function KanbanDragOverlay({ lead }: { lead: KanbanCardData }) {
  const { symbol } = useCurrency();
  const accentBorder = stageAccentMap[lead.stage] || "border-l-border";

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 bg-card p-3.5 shadow-2xl rotate-2 scale-105 border-l-primary/60",
        accentBorder,
        "pointer-events-none"
      )}
    >
      <p className="text-sm font-semibold leading-snug line-clamp-2 mb-2.5">
        {lead.title}
      </p>
      {lead.value != null && lead.value > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
          <DollarSign className="h-3 w-3" />
          <span>{symbol}{Number(lead.value).toLocaleString()}</span>
        </div>
      )}
      {lead.customer && (
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/50">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
            <User className="h-3 w-3 text-primary/60" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {lead.customer.full_name}
          </span>
        </div>
      )}
    </div>
  );
}
