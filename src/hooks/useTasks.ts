import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Task, Profile } from "@/types";

// --- Types ---

export interface FetchTasksParams {
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Flat task row returned from Supabase join query */
export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  due_date: string | null;
  assigned_to: string | null;
  lead_id: string | null;
  created_at: string;
  profiles: Pick<Profile, "first_name" | "last_name"> | null;
}

// --- Hook ---

export function useTasks() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // --- Fetch paginated tasks (list view) ---

  const fetchTasks = useCallback(async (params?: FetchTasksParams) => {
    setLoading(true);
    setError(null);
    try {
      const {
        search = "",
        status = "all",
        priority = "all",
        sortBy = "created_at",
        sortOrder = "desc",
        page = 1,
        pageSize = 10,
      } = params || {};

      let query = supabase
        .from("tasks")
        .select("*, profiles(first_name, last_name)", { count: "exact" });

      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }
      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      if (priority && priority !== "all") {
        query = query.eq("priority", priority);
      }

      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, count, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setTasks((data || []) as unknown as TaskRow[]);
      setPagination({
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch tasks";
      setError(msg);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Fetch all tasks (board & calendar views) ---

  const fetchAllTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select("*, profiles(first_name, last_name)")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setTasks((data || []) as unknown as TaskRow[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch tasks";
      setError(msg);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Fetch profiles for assignee dropdown ---

  const fetchProfiles = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name");

      setProfiles(data || []);
    } catch {
      // Non-critical
    }
  }, []);

  // --- CRUD ---

  const createTask = useCallback(
    async (data: {
      title: string;
      description?: string | null;
      priority: Task["priority"];
      status: Task["status"];
      due_date?: string | null;
      assigned_to?: string | null;
      lead_id?: string | null;
    }): Promise<Task> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date || null,
          assigned_to: data.assigned_to || null,
          lead_id: data.lead_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newTask;
    },
    []
  );

  const updateTask = useCallback(
    async (
      id: string,
      data: {
        title?: string;
        description?: string | null;
        priority?: Task["priority"];
        status?: Task["status"];
        due_date?: string | null;
        assigned_to?: string | null;
        lead_id?: string | null;
      }
    ): Promise<Task> => {
      const { data: updatedTask, error } = await supabase
        .from("tasks")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedTask;
    },
    []
  );

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  }, []);

  return {
    tasks,
    pagination,
    loading,
    error,
    profiles,
    fetchTasks,
    fetchAllTasks,
    fetchProfiles,
    createTask,
    updateTask,
    deleteTask,
  };
}
