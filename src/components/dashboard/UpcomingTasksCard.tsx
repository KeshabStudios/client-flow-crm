import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { upcomingTasks, type DashboardTask } from "@/data/dashboard";

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

export function UpcomingTasksCard() {
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
            {checkedTasks.size} of {upcomingTasks.length} completed
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          View all
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {upcomingTasks.map((task) => {
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
      </CardContent>
    </Card>
  );
}
