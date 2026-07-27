import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  User,
  Calendar,
  Flag,
  AlignLeft,
  Link2,
} from "lucide-react";
import type { TaskRow } from "@/hooks/useTasks";

interface TaskDetailProps {
  task: TaskRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: TaskRow) => void;
  onDelete: (task: TaskRow) => void;
}

const priorityConfig: Record<
  string,
  { label: string; variant: "destructive" | "default" | "secondary" }
> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "default" },
  low: { label: "Low", variant: "secondary" },
};

const statusLabel: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  completed: "Completed",
};

export function TaskDetail({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TaskDetailProps) {
  if (!task) return null;

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const assigneeName = task.profiles
    ? [task.profiles.first_name, task.profiles.last_name]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
            <Badge variant={priority.variant}>{priority.label}</Badge>
            <Badge variant="outline">{statusLabel[task.status] || task.status}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {task.description && (
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
              <AlignLeft className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Description</p>
                <p className="text-sm whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {assigneeName && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="text-sm font-medium">{assigneeName}</p>
                </div>
              </div>
            )}

            {task.due_date && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium">
                    {new Date(task.due_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {task.lead_id && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Linked Lead</p>
                  <p className="text-sm font-medium truncate">{task.lead_id.slice(0, 8)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(task);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onDelete(task);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
