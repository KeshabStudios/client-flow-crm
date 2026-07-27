import { useNavigate } from "react-router-dom";
import {
  Users,
  Target,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { SeoHead } from "@/components/shared/SeoHead";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { Button } from "@/components/ui/button";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { UpcomingTasksCard } from "@/components/dashboard/UpcomingTasksCard";
import { LeadStatusChart } from "@/components/dashboard/LeadStatusChart";
import { MonthlyLeadsChart } from "@/components/dashboard/MonthlyLeadsChart";
import { useDashboard } from "@/hooks/useDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    stats,
    welcomeStats,
    recentActivities,
    upcomingTasks,
    leadStatusData,
    monthlyLeadsData,
    loading,
    error,
    refetch,
  } = useDashboard();

  if (loading && !stats.totalCustomers && !stats.totalLeads) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <SeoHead title="Dashboard" />
        <PageSkeleton cards={4} />
      </div>
    );
  }

  if (error && !stats.totalCustomers && !stats.totalLeads) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <SeoHead title="Dashboard" />
        <PageHeader
          title="Dashboard"
          description="Track your business performance at a glance."
        />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <SeoHead title="Dashboard" description="Track your business performance at a glance." />

      <PageHeader
        title="Dashboard"
        description="Track your business performance at a glance."
      >
        <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
          Refresh
        </Button>
        <Button size="sm" onClick={() => navigate("/leads")}>+ New Deal</Button>
      </PageHeader>

      <WelcomeCard stats={welcomeStats} loading={loading} />

      {error && <ErrorState message={error} onRetry={refetch} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads.toLocaleString()}
          icon={Target}
          variant="primary"
        />
        <StatsCard
          title="Open Tasks"
          value={stats.openTasks.toLocaleString()}
          icon={ClipboardList}
          variant="warning"
        />
        <StatsCard
          title="Completed Tasks"
          value={stats.completedTasks.toLocaleString()}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivities activities={recentActivities} loading={loading} />
        <UpcomingTasksCard tasks={upcomingTasks} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <LeadStatusChart data={leadStatusData} loading={loading} />
        </div>
        <div className="lg:col-span-3">
          <MonthlyLeadsChart data={monthlyLeadsData} loading={loading} />
        </div>
      </div>
    </div>
  );
}
