import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Inbox } from "lucide-react";
import type { Activity } from "@/data/dashboard";

interface RecentActivitiesProps {
  activities: Activity[];
  loading?: boolean;
}

export function RecentActivities({ activities, loading }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Inbox className="mb-2 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm font-medium">No recent activity</p>
            <p className="text-xs">Start creating leads, tasks, or customers.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
              >
                <Avatar className="mt-0.5 h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {activity.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-0.5 min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{activity.user.name}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium text-primary truncate">
                      {activity.target}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
