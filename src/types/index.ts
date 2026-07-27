export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: "admin" | "member";
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  full_name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive" | "lead";
  notes?: string;
  created_at: string;
}

export type LeadStage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type LeadSource = "phone" | "email" | "website" | "referral" | "social" | "other";

export interface Lead {
  id: string;
  customer_id?: string;
  title: string;
  stage: LeadStage;
  value?: number;
  source?: LeadSource;
  expected_close_date?: string;
  created_at: string;
}

export interface Task {
  id: string;
  lead_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "completed";
  due_date?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}
