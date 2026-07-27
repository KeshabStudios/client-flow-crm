import { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskRow } from "@/hooks/useTasks";

// --- Constants ---

const statusLabel: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  completed: "Completed",
};

const statusStyles: Record<string, string> = {
  todo: "border-l-slate-400",
  in_progress: "border-l-blue-400",
  completed: "border-l-emerald-400",
};

const dotColors: Record<string, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-blue-400",
  completed: "bg-emerald-400",
};

const priorityBadge: Record<string, { label: string; variant: "destructive" | "default" | "secondary" }> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "default" },
  low: { label: "Low", variant: "secondary" },
};

// --- Props ---

interface TaskCalendarViewProps {
  tasks: TaskRow[];
  loading?: boolean;
  onTaskClick: (task: TaskRow) => void;
  onEditClick: (task: TaskRow) => void;
  onDeleteClick: (task: TaskRow) => void;
}

// --- Component ---

export function TaskCalendarView({
  tasks,
  loading,
  onTaskClick,
  onEditClick,
  onDeleteClick,
}: TaskCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMonth, setViewMonth] = useState<Date>(new Date());

  // Build task lookup: date string → tasks
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskRow[]>();
    for (const task of tasks) {
      if (!task.due_date) continue;
      const key = format(new Date(task.due_date), "yyyy-MM-dd");
      const existing = map.get(key) || [];
      existing.push(task);
      map.set(key, existing);
    }
    return map;
  }, [tasks]);

  // Set of dates that have tasks
  const taskDateStrings = useMemo(() => new Set(tasksByDate.keys()), [tasksByDate]);

  // Tasks for the selected date
  const selectedTasks = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd");
    return tasksByDate.get(key) || [];
  }, [selectedDate, tasksByDate]);

  // Build modifiers for react-day-picker
  const modifiers = useMemo(() => {
    const mods: Record<string, Date[]> = {};
    for (const dateStr of taskDateStrings) {
      const date = new Date(dateStr + "T00:00:00");
      // Add to each status group for color-coding
      const tasksOnDate = tasksByDate.get(dateStr) || [];
      for (const task of tasksOnDate) {
        const key = `has-${task.status}` as string;
        if (!mods[key]) mods[key] = [];
        mods[key].push(date);
      }
    }
    return mods;
  }, [taskDateStrings, tasksByDate]);

  // Count tasks per day for badge display
  const taskCountForDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const [dateStr, tasks] of tasksByDate) {
      map.set(dateStr, tasks.length);
    }
    return map;
  }, [tasksByDate]);

  // --- Loading state ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
        <div className="h-64 w-full max-w-md rounded-lg bg-muted" />
      </div>
    );
  }

  // --- Empty state ---

  if (!loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm font-medium">No tasks with due dates</p>
        <p className="text-xs">Create a task with a due date to see it on the calendar.</p>
      </div>
    );
  }

  // --- Main render ---

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Calendar */}
      <div className="lg:w-[400px]">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          month={viewMonth}
          onMonthChange={setViewMonth}
          className="rounded-lg border bg-card"
          modifiers={modifiers}
          components={{
            DayContent: (props: { date: Date }) => {
              const dateStr = format(props.date, "yyyy-MM-dd");
              const count = taskCountForDay.get(dateStr);
              const hasTask = taskDateStrings.has(dateStr);

              return (
                <div className="relative flex h-full w-full items-center justify-center">
                  <span>{props.date.getDate()}</span>
                  {hasTask && (
                    <span className="absolute -bottom-0.5 flex gap-0.5">
                      {count && count <= 3 ? (
                        getDotsForDate(dateStr, tasksByDate)
                      ) : count && count > 3 ? (
                        <span className="flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary/20 px-1 text-[8px] font-medium text-primary">
                          {count}
                        </span>
                      ) : null}
                    </span>
                  )}
                </div>
              );
            },
          } as any}
          classNames={{
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              "relative [&>button]:h-full"
            ),
            day_today: "bg-accent text-accent-foreground",
          }}
        />

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground px-1">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> Todo
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-400" /> In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Done
          </span>
        </div>
      </div>

      {/* Tasks for selected date */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <Badge variant="secondary" className="text-[11px]">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {selectedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground rounded-lg border border-dashed">
            <p className="text-sm">No tasks due on this date</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map((task) => {
              const priority = priorityBadge[task.priority] || priorityBadge.medium;
              const assignee = task.profiles
                ? [task.profiles.first_name, task.profiles.last_name]
                    .filter(Boolean)
                    .join(" ")
                : null;

              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border border-l-4 bg-card p-3 cursor-pointer",
                    "hover:shadow-md transition-all duration-200",
                    statusStyles[task.status] || "border-l-muted"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant={priority.variant} className="text-[10px] uppercase px-1.5 py-0">
                        {priority.label}
                      </Badge>
                      <span className={cn(
                        "text-[11px] font-medium px-1.5 py-0.5 rounded",
                        task.status === "todo" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                        task.status === "in_progress" && "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
                        task.status === "completed" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                      )}>
                        {statusLabel[task.status] || task.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {assignee && (
                      <span className="text-[11px] text-muted-foreground">{assignee}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onEditClick(task); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDeleteClick(task); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helpers ---

function getDotsForDate(dateStr: string, tasksByDate: Map<string, TaskRow[]>) {
  const tasks = tasksByDate.get(dateStr) || [];
  // Group by status and show one dot per status group
  const statuses = new Set(tasks.map((t) => t.status));
  const dots: React.ReactNode[] = [];
  let i = 0;
  for (const status of statuses) {
    const color = dotColors[status] || "bg-slate-400";
    dots.push(
      <span
        key={`${status}-${i}`}
        className={`h-1 w-1 rounded-full ${color}`}
      />
    );
    i++;
  }
  return dots;
}
