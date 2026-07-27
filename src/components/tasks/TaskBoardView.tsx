import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TaskRow } from "@/hooks/useTasks";

// --- Constants ---

const COLUMNS: { key: TaskRow["status"]; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const columnStyles: Record<string, string> = {
  todo: "bg-slate-50 dark:bg-slate-900/40 border-t-slate-400",
  in_progress: "bg-blue-50 dark:bg-blue-950/20 border-t-blue-400",
  completed: "bg-emerald-50 dark:bg-emerald-950/20 border-t-emerald-400",
};

const priorityBadge: Record<string, { label: string; variant: "destructive" | "default" | "secondary" }> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "default" },
  low: { label: "Low", variant: "secondary" },
};

// --- Draggable Card ---

function DraggableCard({
  task,
  onClick,
  isDragOverlay,
}: {
  task: TaskRow;
  onClick: () => void;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: "task", task },
  });

  const priority = priorityBadge[task.priority] || priorityBadge.medium;
  const assignee = task.profiles
    ? [task.profiles.first_name, task.profiles.last_name].filter(Boolean).join(" ")
    : null;

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-3 transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30 scale-95",
        isDragOverlay && "shadow-xl rotate-2 scale-105 border-primary/40 cursor-grabbing"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{task.title}</p>
        <Badge variant={priority.variant} className="text-[10px] uppercase shrink-0 px-1.5 py-0">
          {priority.label}
        </Badge>
      </div>
      {task.due_date && (
        <p className="text-[11px] text-muted-foreground">
          Due{" "}
          {new Date(task.due_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      )}
      {assignee && (
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{assignee}</p>
      )}
    </div>
  );
}

// --- DragOverlay card ---

function DragOverlayCard({ task }: { task: TaskRow }) {
  const priority = priorityBadge[task.priority] || priorityBadge.medium;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-2xl rotate-2 scale-105 border-primary/40 pointer-events-none">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium">{task.title}</p>
        <Badge variant={priority.variant} className="text-[10px] uppercase shrink-0 px-1.5 py-0">
          {priority.label}
        </Badge>
      </div>
      {task.due_date && (
        <p className="text-[11px] text-muted-foreground">
          Due {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
    </div>
  );
}

// --- Droppable Column ---

function TaskColumn({
  id,
  label,
  tasks,
  isOver,
  onCardClick,
}: {
  id: string;
  label: string;
  tasks: TaskRow[];
  isOver: boolean;
  onCardClick: (task: TaskRow) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: `col-${id}`,
    data: { type: "column", status: id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full w-[300px] shrink-0 flex-col rounded-xl border border-t-4",
        columnStyles[id] || "bg-muted/30 border-t-muted-foreground/30",
        isOver && "ring-2 ring-primary/40 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h3>
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted-foreground/15 px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">
          {tasks.length}
        </span>
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 overflow-y-auto p-3 flex-1",
          "min-h-[150px] transition-colors duration-200",
          tasks.length === 0 && "flex-1"
        )}
      >
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} onClick={() => onCardClick(task)} />
        ))}

        {tasks.length === 0 && (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-lg border-2 border-dashed",
              "border-muted-foreground/20 text-muted-foreground/40",
              "text-xs font-medium py-10",
              isOver && "border-primary/40 bg-primary/5 text-primary/40"
            )}
          >
            {isOver ? "Drop here" : "No tasks"}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Board Component ---

interface TaskBoardViewProps {
  tasks: TaskRow[];
  loading?: boolean;
  onStatusChange: (taskId: string, newStatus: TaskRow["status"]) => Promise<void>;
  onTaskClick: (task: TaskRow) => void;
}

export function TaskBoardView({
  tasks,
  loading,
  onStatusChange,
  onTaskClick,
}: TaskBoardViewProps) {
  const [activeTask, setActiveTask] = useState<TaskRow | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<string, TaskRow[]> = { todo: [], in_progress: [], completed: [] };
    for (const t of tasks) {
      if (g[t.status]) g[t.status].push(t);
      else g[t.status] = [t];
    }
    return g;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5, delay: 100, tolerance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as TaskRow | undefined;
    if (task) setActiveTask(task);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setOverColumn(null);
      if (!over) return;

      const task = active.data.current?.task as TaskRow | undefined;
      if (!task) return;

      let newStatus: TaskRow["status"] | null = null;
      const overData = over.data.current;
      if (overData?.type === "column") {
        newStatus = overData.status as TaskRow["status"];
      } else if (overData?.type === "task") {
        newStatus = (overData.task as TaskRow).status;
      }
      if (!newStatus || newStatus === task.status) return;

      try {
        await onStatusChange(task.id, newStatus);
      } catch {
        // Revert handled by parent
      }
    },
    [onStatusChange]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setOverColumn(null);
  }, []);

  const handleDragOver = useCallback((event: any) => {
    const { over } = event;
    if (over?.data?.current?.type === "column") {
      setOverColumn(over.data.current.status);
    } else if (over?.data?.current?.type === "task") {
      setOverColumn(over.data.current.task.status);
    } else {
      setOverColumn(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="flex h-full w-[300px] shrink-0 flex-col rounded-xl bg-muted/30 animate-pulse"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-muted">
              <div className="h-3 w-20 rounded bg-muted-foreground/20" />
              <div className="ml-auto h-5 w-5 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="flex flex-col gap-2 p-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-muted-foreground/10" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm font-medium">No tasks yet</p>
        <p className="text-xs">Create your first task to see it on the board.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {COLUMNS.map((col) => (
          <TaskColumn
            key={col.key}
            id={col.key}
            label={col.label}
            tasks={grouped[col.key] || []}
            isOver={overColumn === col.key}
            onCardClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <DragOverlayCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
