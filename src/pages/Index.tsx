import { Users, TrendingUp, CheckSquare, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const recentActivities = [
  { id: "1", user: "Sarah J.", action: "added a new contact", target: "TechStart Inc.", time: "2 min ago" },
  { id: "2", user: "Mike R.", action: "closed a deal with", target: "Acme Corp", time: "15 min ago" },
  { id: "3", user: "Emily L.", action: "updated deal stage for", target: "GlobalSys", time: "1 hour ago" },
  { id: "4", user: "Alex K.", action: "completed task:", target: "Follow-up call design", time: "2 hours ago" },
  { id: "5", user: "Sarah J.", action: "sent proposal to", target: "NexGen Ltd", time: "3 hours ago" },
];

const upcomingTasks = [
  { id: "1", title: "Review quarterly pipeline", priority: "high" as const, due: "Today" },
  { id: "2", title: "Send follow-up to WebFlow client", priority: "medium" as const, due: "Tomorrow" },
  { id: "3", title: "Update contact records", priority: "low" as const, due: "In 3 days" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your business today."
      >
        <Button variant="outline" size="sm">Download Report</Button>
        <Button size="sm">+ New Deal</Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Contacts"
          value="2,843"
          icon={Users}
          trend={{ value: "12% this month", positive: true }}
          variant="primary"
        />
        <StatsCard
          title="Active Deals"
          value="47"
          icon={TrendingUp}
          trend={{ value: "8% this week", positive: true }}
          variant="success"
        />
        <StatsCard
          title="Tasks Due"
          value="23"
          icon={CheckSquare}
          trend={{ value: "3 overdue", positive: false }}
          variant="warning"
        />
        <StatsCard
          title="Revenue"
          value="$124.5K"
          icon={DollarSign}
          description="This quarter"
          variant="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {activity.user.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}{" "}
                      <span className="font-medium text-primary">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                    </div>
                  </div>
                  <Badge
                    variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
                    className="text-[10px] uppercase"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { stage: "Lead", count: 24, value: "$48K", color: "bg-slate-400" },
              { stage: "Qualified", count: 18, value: "$72K", color: "bg-blue-400" },
              { stage: "Proposal", count: 12, value: "$96K", color: "bg-blue-500" },
              { stage: "Negotiation", count: 7, value: "$84K", color: "bg-primary" },
            ].map((stage) => (
              <div key={stage.stage} className="rounded-lg border p-4 text-center">
                <div className={cn("mx-auto mb-3 h-2 w-16 rounded-full", stage.color)} />
                <p className="text-sm font-medium text-muted-foreground">{stage.stage}</p>
                <p className="text-2xl font-bold">{stage.count}</p>
                <p className="text-xs text-muted-foreground">{stage.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { cn } from "@/lib/utils";
