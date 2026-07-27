import {
  Users,
  Target,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { SeoHead } from "@/components/shared/SeoHead";
import { Button } from "@/components/ui/button";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { UpcomingTasksCard } from "@/components/dashboard/UpcomingTasksCard";
import { LeadStatusChart } from "@/components/dashboard/LeadStatusChart";
import { MonthlyLeadsChart } from "@/components/dashboard/MonthlyLeadsChart";
import { dashboardStats } from "@/data/dashboard";

export default function Dashboard() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <SeoHead title="Dashboard" description="Track your business performance at a glance." />

      <PageHeader
        title="Dashboard"
        description="Track your business performance at a glance."
      >
        <Button variant="outline" size="sm">
          Download Report
        </Button>
        <Button size="sm">+ New Deal</Button>
      </PageHeader>

      <WelcomeCard />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Customers"
          value={dashboardStats.totalCustomers.value}
          icon={Users}
          trend={dashboardStats.totalCustomers.trend}
          variant="primary"
        />
        <StatsCard
          title="Total Leads"
          value={dashboardStats.totalLeads.value}
          icon={Target}
          trend={dashboardStats.totalLeads.trend}
          variant="primary"
        />
        <StatsCard
          title="Open Tasks"
          value={dashboardStats.openTasks.value}
          icon={ClipboardList}
          trend={dashboardStats.openTasks.trend}
          variant="warning"
        />
        <StatsCard
          title="Completed Tasks"
          value={dashboardStats.completedTasks.value}
          icon={CheckCircle2}
          trend={dashboardStats.completedTasks.trend}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivities />
        <UpcomingTasksCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <LeadStatusChart />
        </div>
        <div className="lg:col-span-3">
          <MonthlyLeadsChart />
        </div>
      </div>
    </div>
  );
}
