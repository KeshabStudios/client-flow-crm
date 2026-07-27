export interface Activity {
  id: string;
  user: { name: string; initials: string };
  action: string;
  target: string;
  time: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  due: string;
  category: string;
}

export interface LeadStatusItem {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyLeadItem {
  month: string;
  leads: number;
  qualified: number;
}

export const dashboardStats = {
  totalCustomers: {
    value: "2,843",
    trend: { value: "+12.5% this month", positive: true },
  },
  totalLeads: {
    value: "847",
    trend: { value: "+23.1% this month", positive: true },
  },
  openTasks: {
    value: "23",
    trend: { value: "3 overdue tasks", positive: false },
  },
  completedTasks: {
    value: "156",
    trend: { value: "+18.2% this month", positive: true },
  },
};

export const welcomeStats = [
  { label: "Active today", value: "12" },
  { label: "Team members", value: "8" },
  { label: "New this week", value: "43" },
];

export const recentActivities: Activity[] = [
  {
    id: "1",
    user: { name: "Sarah Johnson", initials: "SJ" },
    action: "added a new contact",
    target: "TechStart Inc.",
    time: "2 min ago",
  },
  {
    id: "2",
    user: { name: "Mike Reynolds", initials: "MR" },
    action: "closed a deal with",
    target: "Acme Corp ($24,000)",
    time: "15 min ago",
  },
  {
    id: "3",
    user: { name: "Emily Chen", initials: "EC" },
    action: "updated deal stage for",
    target: "GlobalSys to Negotiation",
    time: "1 hour ago",
  },
  {
    id: "4",
    user: { name: "Alex Kim", initials: "AK" },
    action: "completed task:",
    target: "Q3 Budget Review",
    time: "2 hours ago",
  },
  {
    id: "5",
    user: { name: "Sarah Johnson", initials: "SJ" },
    action: "sent proposal to",
    target: "NexGen Ltd",
    time: "3 hours ago",
  },
  {
    id: "6",
    user: { name: "David Park", initials: "DP" },
    action: "added a new deal:",
    target: "PixelCraft - $12,000",
    time: "5 hours ago",
  },
];

export const upcomingTasks: DashboardTask[] = [
  {
    id: "1",
    title: "Review quarterly pipeline report",
    priority: "high",
    due: "Today",
    category: "Deals",
  },
  {
    id: "2",
    title: "Send follow-up to WebFlow client",
    priority: "high",
    due: "Today",
    category: "Contacts",
  },
  {
    id: "3",
    title: "Update contact records",
    priority: "medium",
    due: "Tomorrow",
    category: "Admin",
  },
  {
    id: "4",
    title: "Prepare Q4 strategy presentation",
    priority: "medium",
    due: "In 2 days",
    category: "Deals",
  },
  {
    id: "5",
    title: "Team feedback session",
    priority: "low",
    due: "In 3 days",
    category: "Internal",
  },
];

export const leadStatusData: LeadStatusItem[] = [
  { name: "New", value: 340, color: "#3B82F6" },
  { name: "Qualified", value: 280, color: "#8B5CF6" },
  { name: "Proposal", value: 150, color: "#F59E0B" },
  { name: "Negotiation", value: 77, color: "#EF4444" },
];

export const monthlyLeadsData: MonthlyLeadItem[] = [
  { month: "Jan", leads: 45, qualified: 28 },
  { month: "Feb", leads: 52, qualified: 34 },
  { month: "Mar", leads: 61, qualified: 41 },
  { month: "Apr", leads: 48, qualified: 30 },
  { month: "May", leads: 73, qualified: 52 },
  { month: "Jun", leads: 68, qualified: 47 },
  { month: "Jul", leads: 55, qualified: 36 },
  { month: "Aug", leads: 82, qualified: 58 },
  { month: "Sep", leads: 91, qualified: 63 },
  { month: "Oct", leads: 77, qualified: 51 },
  { month: "Nov", leads: 85, qualified: 59 },
  { month: "Dec", leads: 66, qualified: 44 },
];

export const totalLeads = monthlyLeadsData.reduce((sum, m) => sum + m.leads, 0);
export const totalQualified = monthlyLeadsData.reduce(
  (sum, m) => sum + m.qualified,
  0
);
