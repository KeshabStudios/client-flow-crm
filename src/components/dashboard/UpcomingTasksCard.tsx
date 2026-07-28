import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, ClipboardList } from "lucide-react";
import type { DashboardTask } from "@/types";

const priorityStyles: Record<DashboardTask["priority"], string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const priorityBadge: Record<DashboardTask["priority"], "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

interface UpcomingTasksCardProps {
  tasks: DashboardTask[];
  loading?: boolean;
}

export function UpcomingTasksCard({ tasks, loading }: UpcomingTasksCardProps) {
  const navigate = useNavigate();
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (id: string) => {
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading..." : `${checkedTasks.size} of ${tasks.length} completed`}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/tasks")}>
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ClipboardList className="mb-2 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm font-medium">No upcoming tasks</p>
            <p className="text-xs">Create tasks to track your work.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const isChecked = checkedTasks.has(task.id);
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    isChecked && "bg-muted/50"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      isChecked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 hover:border-primary"
                    )}
                    aria-label={isChecked ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
                  >
                    {isChecked && (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isChecked && "text-muted-foreground line-through"
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        Due: {task.due}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={priorityBadge[task.priority]}
                    className={cn(
                      "shrink-0 text-[10px] font-semibold uppercase",
                      priorityStyles[task.priority]
                    )}
                  >
                    {task.priority}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
