import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard, KanbanDragOverlay, type KanbanCardData } from "./KanbanCard";
import { LeadStage, Lead } from "@/types";
import { cn } from "@/lib/utils";

// --- Constants ---

const STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

// --- Props ---

interface KanbanBoardProps {
  leads: KanbanCardData[];
  loading?: boolean;
  onStageChange: (leadId: string, newStage: LeadStage) => Promise<void>;
  onCardClick: (lead: KanbanCardData) => void;
  className?: string;
}

// --- Helpers ---

function groupLeadsByStage(leads: KanbanCardData[]): Record<LeadStage, KanbanCardData[]> {
  const grouped: Record<LeadStage, KanbanCardData[]> = {
    new: [],
    qualified: [],
    proposal: [],
    negotiation: [],
    won: [],
    lost: [],
  };
  for (const lead of leads) {
    if (grouped[lead.stage]) {
      grouped[lead.stage].push(lead);
    }
  }
  return grouped;
}

// --- Component ---

export function KanbanBoard({
  leads,
  loading,
  onStageChange,
  onCardClick,
  className,
}: KanbanBoardProps) {
  const [activeLead, setActiveLead] = useState<KanbanCardData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Local optimistic state for instant feedback
  const [optimisticLeads, setOptimisticLeads] = useState<KanbanCardData[] | null>(null);
  const displayLeads = optimisticLeads ?? leads;

  const grouped = useMemo(() => groupLeadsByStage(displayLeads), [displayLeads]);

  // Sensors — delay and tolerance for better UX
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 100,
        tolerance: 5,
      },
    })
  );

  // Drag start — set the overlay card
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const lead = active.data.current?.lead as KanbanCardData | undefined;
    if (lead) {
      setActiveLead(lead);
    }
  }, []);

  // Drag end — update stage
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveLead(null);

      if (!over) return;

      const lead = active.data.current?.lead as KanbanCardData | undefined;
      if (!lead) return;

      // Determine target stage
      let newStage: LeadStage | null = null;

      if (over.data.current?.type === "column") {
        // Dropped on a column
        newStage = over.data.current.stage as LeadStage;
      } else if (over.data.current?.type === "lead") {
        // Dropped on another card — use that card's column
        const overLead = over.data.current.lead as KanbanCardData | undefined;
        if (overLead) {
          newStage = overLead.stage;
        }
      }

      if (!newStage || newStage === lead.stage) return;

      // Optimistic update
      setOptimisticLeads((prev) => {
        const source = prev ?? leads;
        return source.map((l) =>
          l.id === lead.id ? { ...l, stage: newStage! } : l
        );
      });

      setIsUpdating(true);

      try {
        await onStageChange(lead.id, newStage);
      } catch {
        // Revert on failure
        setOptimisticLeads(null);
      } finally {
        setIsUpdating(false);
      }
    },
    [leads, onStageChange]
  );

  // Drag cancel — clear overlay
  const handleDragCancel = useCallback(() => {
    setActiveLead(null);
  }, []);

  // --- Loading skeleton ---

  if (loading) {
    return (
      <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className="flex h-full w-[280px] shrink-0 flex-col rounded-xl bg-muted/30 animate-pulse"
          >
            <div className="flex items-center gap-2 px-3 pt-3 pb-2">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
              <div className="h-3 w-16 rounded bg-muted-foreground/20" />
              <div className="ml-auto h-5 w-5 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="flex flex-col gap-2 p-3 pt-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-muted-foreground/10"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- Main render ---

  return (
    <div className={cn("relative", className)}>
      {/* Updating indicator */}
      {isUpdating && (
        <div className="absolute top-0 right-0 z-10 flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Updating...
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage.key}
              id={stage.key}
              title={stage.label}
              color={stage.key}
              leads={grouped[stage.key]}
              onCardClick={onCardClick}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeLead ? <KanbanDragOverlay lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Empty state */}
      {!loading && leads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1">No leads yet</h3>
          <p className="text-sm text-center max-w-sm">
            Create your first lead to see it on the board.
          </p>
        </div>
      )}
    </div>
  );
}
