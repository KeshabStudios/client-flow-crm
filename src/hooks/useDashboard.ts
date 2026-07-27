import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Activity, DashboardTask, LeadStatusItem, MonthlyLeadItem } from "@/data/dashboard";

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const time = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - time) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour${diffSec >= 7200 ? "s" : ""} ago`;
  if (diffSec < 172800) return "Yesterday";
  return `${Math.floor(diffSec / 86400)} days ago`;
}

interface DashboardStats {
  totalCustomers: number;
  totalLeads: number;
  openTasks: number;
  completedTasks: number;
}

interface WelcomeStat {
  label: string;
  value: number;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalLeads: 0,
    openTasks: 0,
    completedTasks: 0,
  });
  const [welcomeStats, setWelcomeStats] = useState<WelcomeStat[]>([
    { label: "Due today", value: 0 },
    { label: "Team members", value: 1 },
    { label: "New this week", value: 0 },
  ]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<DashboardTask[]>([]);
  const [leadStatusData, setLeadStatusData] = useState<LeadStatusItem[]>([]);
  const [monthlyLeadsData, setMonthlyLeadsData] = useState<MonthlyLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const startOfWeek = getStartOfWeek().toISOString();
      const todayStr = new Date().toISOString().split("T")[0];

      // All queries in parallel
      const results = await Promise.allSettled([
        // Stats counts
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "completed"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),

        // WelcomeCard: tasks due today
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("due_date", todayStr).neq("status", "completed"),

        // WelcomeCard: new this week (customers + leads)
        supabase.from("customers").select("*", { count: "exact", head: true }).gte("created_at", startOfWeek),
        supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", startOfWeek),

        // Recent activities
        supabase.from("leads").select("id, title, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("tasks").select("id, title, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("customers").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(3),

        // Upcoming tasks
        supabase
          .from("tasks")
          .select("id, title, priority, due_date, category")
          .neq("status", "completed")
          .order("due_date", { ascending: true })
          .limit(5),

        // Lead status data
        supabase.from("leads").select("stage"),

        // Monthly leads - all created_at for aggregation
        supabase.from("leads").select("created_at"),
      ]);

      // --- Parse Stats ---
      const totalCustomers = results[0].status === "fulfilled" ? results[0].value.count ?? 0 : 0;
      const totalLeads = results[1].status === "fulfilled" ? results[1].value.count ?? 0 : 0;
      const openTasks = results[2].status === "fulfilled" ? results[2].value.count ?? 0 : 0;
      const completedTasks = results[3].status === "fulfilled" ? results[3].value.count ?? 0 : 0;

      setStats({ totalCustomers, totalLeads, openTasks, completedTasks });

      // --- WelcomeCard stats ---
      const tasksDueToday = results[4].status === "fulfilled" ? results[4].value.count ?? 0 : 0;
      const customersThisWeek = results[5].status === "fulfilled" ? results[5].value.count ?? 0 : 0;
      const leadsThisWeek = results[6].status === "fulfilled" ? results[6].value.count ?? 0 : 0;

      setWelcomeStats([
        { label: "Due today", value: tasksDueToday },
        { label: "Team members", value: 1 }, // Simplified — counts the current user
        { label: "New this week", value: customersThisWeek + leadsThisWeek },
      ]);

      // --- Recent activities ---
      const activities: Activity[] = [];

      if (results[7].status === "fulfilled") {
        const leads = results[7].value.data ?? [];
        leads.forEach((lead: { id: string; title: string; created_at: string }) => {
          activities.push({
            id: `lead-${lead.id}`,
            user: { name: "You", initials: "Yo" },
            action: "added a new lead",
            target: lead.title,
            time: formatTimeAgo(lead.created_at),
          });
        });
      }

      if (results[8].status === "fulfilled") {
        const tasks = results[8].value.data ?? [];
        tasks.forEach((task: { id: string; title: string; created_at: string }) => {
          activities.push({
            id: `task-${task.id}`,
            user: { name: "You", initials: "Yo" },
            action: "created task:",
            target: task.title,
            time: formatTimeAgo(task.created_at),
          });
        });
      }

      if (results[9].status === "fulfilled") {
        const customers = results[9].value.data ?? [];
        customers.forEach((cust: { id: string; full_name: string; created_at: string }) => {
          activities.push({
            id: `cust-${cust.id}`,
            user: { name: "You", initials: "Yo" },
            action: "added a new customer",
            target: cust.full_name,
            time: formatTimeAgo(cust.created_at),
          });
        });
      }

      activities.sort((a, b) => {
        const timeA = parseFloat(a.time);
        const timeB = parseFloat(b.time);
        return timeA - timeB;
      });
      setRecentActivities(activities.slice(0, 6));

      // --- Upcoming tasks ---
      if (results[10].status === "fulfilled") {
        const tasks = results[10].value.data ?? [];
        setUpcomingTasks(
          tasks.map((t: { id: string; title: string; priority: string; due_date: string | null; category: string | null }) => ({
            id: t.id,
            title: t.title,
            priority: (t.priority as DashboardTask["priority"]) || "medium",
            due: t.due_date ? formatDueDate(t.due_date) : "No due date",
            category: t.category || "General",
          }))
        );
      } else {
        setUpcomingTasks([]);
      }

      // --- Lead status chart ---
      if (results[11].status === "fulfilled") {
        const stageData = results[11].value.data ?? [];
        const stageCounts: Record<string, number> = {};
        stageData.forEach((l: { stage: string }) => {
          stageCounts[l.stage] = (stageCounts[l.stage] || 0) + 1;
        });

        const colorMap: Record<string, string> = {
          new: "#3B82F6",
          qualified: "#8B5CF6",
          proposal: "#F59E0B",
          negotiation: "#EF4444",
          won: "#10B981",
          lost: "#6B7280",
        };
        const labelMap: Record<string, string> = {
          new: "New",
          qualified: "Qualified",
          proposal: "Proposal",
          negotiation: "Negotiation",
          won: "Won",
          lost: "Lost",
        };

        setLeadStatusData(
          Object.entries(stageCounts).map(([stage, value]) => ({
            name: labelMap[stage] || stage,
            value,
            color: colorMap[stage] || "#6B7280",
          }))
        );
      }

      // --- Monthly leads chart ---
      if (results[12].status === "fulfilled") {
        const createdData = results[12].value.data ?? [];
        const monthlyCounts: Record<string, { leads: number }> = {};

        // Initialize all 12 months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentYear = new Date().getFullYear();
        months.forEach((m, i) => {
          monthlyCounts[`${currentYear}-${String(i + 1).padStart(2, "0")}`] = { leads: 0 };
        });

        createdData.forEach((l: { created_at: string }) => {
          const d = new Date(l.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (monthlyCounts[key]) {
            monthlyCounts[key].leads += 1;
          }
        });

        setMonthlyLeadsData(
          Object.entries(monthlyCounts).map(([key, val]) => {
            const monthIdx = parseInt(key.split("-")[1], 10) - 1;
            return {
              month: months[monthIdx],
              leads: val.leads,
              qualified: Math.round(val.leads * 0.6), // approximate qualified
            };
          })
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    welcomeStats,
    recentActivities,
    upcomingTasks,
    leadStatusData,
    monthlyLeadsData,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}

function formatDueDate(dateStr: string): string {
  const now = new Date();
  const due = new Date(dateStr);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
