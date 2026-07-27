import { Plus, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sampleTasks = [
  { id: "1", title: "Follow up with Acme Corp", priority: "high" as const, status: "In Progress", due: "Today" },
  { id: "2", title: "Review Q3 pipeline report", priority: "high" as const, status: "Todo", due: "Tomorrow" },
  { id: "3", title: "Update contact email list", priority: "medium" as const, status: "Todo", due: "In 2 days" },
  { id: "4", title: "Prepare client presentation", priority: "medium" as const, status: "In Progress", due: "In 3 days" },
  { id: "5", title: "Team standup notes", priority: "low" as const, status: "Completed", due: "Yesterday" },
];

export default function Tasks() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Stay on top of your to-do list."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </PageHeader>

      <div className="rounded-lg border">
        <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
          <div className="col-span-6">Task</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Due</div>
        </div>
        {sampleTasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-12 gap-4 border-b px-4 py-3 text-sm last:border-0 hover:bg-accent/50 transition-colors"
          >
            <div className="col-span-6 flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                defaultChecked={task.status === "Completed"}
              />
              <span className={task.status === "Completed" ? "line-through text-muted-foreground" : ""}>
                {task.title}
              </span>
            </div>
            <div className="col-span-2">
              <Badge
                variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
                className="text-[10px] uppercase"
              >
                {task.priority}
              </Badge>
            </div>
            <div className="col-span-2 text-muted-foreground">{task.status}</div>
            <div className="col-span-2 text-muted-foreground">{task.due}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3">
            <CheckSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Showing 5 sample tasks</p>
        </CardContent>
      </Card>
    </div>
  );
}
