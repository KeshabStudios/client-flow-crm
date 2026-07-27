import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { KanbanCard, KanbanCardData } from "./KanbanCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  leads: KanbanCardData[];
  isOver?: boolean;
  onCardClick: (lead: KanbanCardData) => void;
}

const colorMap: Record<string, string> = {
  new: "bg-slate-500",
  qualified: "bg-blue-500",
  proposal: "bg-indigo-500",
  negotiation: "bg-amber-500",
  won: "bg-emerald-500",
  lost: "bg-red-500",
};

const lightColorMap: Record<string, string> = {
  new: "bg-slate-100 dark:bg-slate-900/50",
  qualified: "bg-blue-50 dark:bg-blue-950/30",
  proposal: "bg-indigo-50 dark:bg-indigo-950/30",
  negotiation: "bg-amber-50 dark:bg-amber-950/30",
  won: "bg-emerald-50 dark:bg-emerald-950/30",
  lost: "bg-red-50 dark:bg-red-950/30",
};

export function KanbanColumn({
  id,
  title,
  leads,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "column", stage: id },
  });

  const dotColor = colorMap[id] || "bg-gray-400";
  const bgColor = lightColorMap[id] || "bg-muted/30";

  return (
    <div
      className={cn(
        "flex h-full w-[280px] shrink-0 flex-col rounded-xl transition-colors duration-200",
        bgColor,
        isOver && "ring-2 ring-primary/40 bg-primary/5"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", dotColor)} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted-foreground/20 px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">
          {leads.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 overflow-y-auto p-3 pt-1 transition-all duration-200",
          "min-h-[120px]",
          leads.length === 0 && "flex-1"
        )}
      >
        {leads.map((lead) => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            onClick={() => onCardClick(lead)}
          />
        ))}

        {/* Empty state */}
        {leads.length === 0 && (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-lg border-2 border-dashed",
              "border-muted-foreground/20 text-muted-foreground/40",
              "text-xs font-medium py-8",
              isOver && "border-primary/40 bg-primary/5 text-primary/40"
            )}
          >
            {isOver ? "Drop here" : "No leads"}
          </div>
        )}
      </div>
    </div>
  );
}
