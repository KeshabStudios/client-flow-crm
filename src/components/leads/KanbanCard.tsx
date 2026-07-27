import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { DollarSign, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types";

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

export function KanbanCard({ lead, isDragOverlay, onClick }: KanbanCardProps) {
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

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
      onClick={onClick}
      className={cn(
        "group rounded-lg border bg-card p-3 transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30 scale-95",
        isDragOverlay && "shadow-xl rotate-2 scale-105 border-primary/40 cursor-grabbing",
      )}
    >
      {/* Title */}
      <p className="text-sm font-medium leading-snug line-clamp-2 mb-2">
        {lead.title}
      </p>

      {/* Value */}
      {lead.value != null && lead.value > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1.5">
          <DollarSign className="h-3 w-3" />
          <span>
            ${Number(lead.value).toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-1.5">
        {lead.customer ? (
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <User className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground truncate">
              {lead.customer.full_name}
            </span>
          </div>
        ) : (
          <div />
        )}

        {lead.expected_close_date && (
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">
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
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 shadow-2xl rotate-2 scale-105 border-primary/40",
        "pointer-events-none"
      )}
    >
      <p className="text-sm font-medium leading-snug line-clamp-2 mb-2">
        {lead.title}
      </p>
      {lead.value != null && lead.value > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1.5">
          <DollarSign className="h-3 w-3" />
          <span>${Number(lead.value).toLocaleString()}</span>
        </div>
      )}
      {lead.customer && (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            {lead.customer.full_name}
          </span>
        </div>
      )}
    </div>
  );
}
