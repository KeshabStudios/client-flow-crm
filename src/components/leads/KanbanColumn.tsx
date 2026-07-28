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
        "flex h-full w-[300px] shrink-0 flex-col rounded-xl transition-colors duration-200",
        bgColor,
        isOver && "ring-2 ring-primary/40 bg-primary/5"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border/40">
        <div className={cn("h-3 w-3 rounded-full shrink-0 ring-2 ring-white/50 dark:ring-black/20", dotColor)} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
          {title}
        </h3>
        <span className="ml-auto flex h-5 min-w-[22px] items-center justify-center rounded-full bg-foreground/10 px-1.5 text-[11px] font-semibold text-foreground/60 tabular-nums">
          {leads.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 overflow-y-auto p-3 transition-all duration-200",
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
              "flex flex-1 items-center justify-center rounded-lg border-2 border-dashed py-10",
              "border-muted-foreground/20 text-muted-foreground/40",
              "text-xs font-medium transition-colors",
              isOver && "border-primary/40 bg-primary/5 text-primary/40"
            )}
          >
            {isOver ? "Drop here" : "Drop leads here"}
          </div>
        )}
      </div>
    </div>
  );
}
