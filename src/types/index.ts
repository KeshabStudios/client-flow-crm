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

export interface Lead {
  id: string;
  customer_id?: string;
  title: string;
  stage: "new" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  value?: number;
  source?: string;
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
  name?: string;
  avatar_url?: string;
  role: string;
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
