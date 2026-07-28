import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Lead, LeadStage, LeadSource } from "@/types";

// --- Types ---

export interface FetchLeadsParams {
  search?: string;
  stage?: string;
  source?: string;
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

export interface LeadStats {
  total: number;
  pipelineValue: number;
  wonCount: number;
  wonValue: number;
  thisMonth: number;
}

export interface LeadWithCustomer extends Lead {
  customers: Pick<Customer, "full_name" | "company_name"> | null;
}

interface Customer {
  id: string;
  full_name: string;
  company_name?: string;
}

// --- Notification helper ---

async function insertNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error",
  link?: string
) {
  try {
    await supabase.from("notifications").insert({
      user_id: userId,
      title,
      message,
      type,
      link,
    });
  } catch {
    // Non-critical
  }
}

// --- Hook ---

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadWithCustomer[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    pipelineValue: 0,
    wonCount: 0,
    wonValue: 0,
    thisMonth: 0,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);

  // --- Fetch leads with joined customer data ---

  const fetchLeads = useCallback(
    async (params?: FetchLeadsParams) => {
      setLoading(true);
      setError(null);

      try {
        const {
          search = "",
          stage = "all",
          source = "all",
          sortBy = "created_at",
          sortOrder = "desc",
          page = 1,
          pageSize = 10,
        } = params || {};

        let query = supabase
          .from("leads")
          .select("*, customers(full_name, company_name)", {
            count: "exact",
          });

        // Search by title
        if (search.trim()) {
          query = query.ilike("title", `%${search.trim()}%`);
        }

        // Filter by stage
        if (stage && stage !== "all") {
          query = query.eq("stage", stage);
        }

        // Filter by source
        if (source && source !== "all") {
          query = query.eq("source", source);
        }

        // Sort
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setLeads((data || []) as unknown as LeadWithCustomer[]);
        setPagination({
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch leads";
        setError(message);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Fetch statistics ---

  const fetchStats = useCallback(async () => {
    try {
      // Total leads count
      const { count: total } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      // Pipeline value (sum of values where stage is not won/lost)
      const { data: pipelineData } = await supabase
        .from("leads")
        .select("value")
        .not("stage", "in", '("won","lost")');

      const pipelineValue =
        pipelineData?.reduce(
          (sum, l) => sum + (Number(l.value) || 0),
          0
        ) || 0;

      // Won count and value
      const { data: wonData } = await supabase
        .from("leads")
        .select("value", { count: "exact" })
        .eq("stage", "won");

      const wonCount = wonData?.length || 0;
      const wonValue =
        wonData?.reduce((sum, l) => sum + (Number(l.value) || 0), 0) || 0;

      // This month leads
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonth } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      setStats({
        total: total || 0,
        pipelineValue,
        wonCount,
        wonValue,
        thisMonth: thisMonth || 0,
      });
    } catch {
      // Stats are non-critical, don't set error state
    }
  }, []);

  // --- Fetch customers for the form selector ---

  const fetchCustomersForSelector = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("customers")
        .select("id, full_name, company_name")
        .order("full_name");

      setCustomers(data || []);
    } catch {
      // Non-critical
    }
  }, []);

  // --- CRUD operations ---

  const createLead = useCallback(
    async (
      data: Omit<Lead, "id" | "created_at">
    ): Promise<Lead> => {
      const { data: newLead, error } = await supabase
        .from("leads")
        .insert({
          customer_id: data.customer_id || null,
          title: data.title,
          stage: data.stage,
          value: data.value || null,
          source: data.source || null,
          expected_close_date: data.expected_close_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (user) {
        insertNotification(
          user.id,
          "New deal created",
          `"${data.title}" has been added as a new deal.`,
          "info",
          "/leads"
        );
      }

      return newLead;
    },
    [user]
  );

  const updateLead = useCallback(
    async (id: string, data: Partial<Lead>): Promise<Lead> => {
      // Fetch old lead to detect stage changes
      const { data: oldLead } = await supabase
        .from("leads")
        .select("stage, title")
        .eq("id", id)
        .single();

      const { data: updatedLead, error } = await supabase
        .from("leads")
        .update({
          customer_id: data.customer_id,
          title: data.title,
          stage: data.stage,
          value: data.value,
          source: data.source,
          expected_close_date: data.expected_close_date,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (user && oldLead && data.stage && data.stage !== oldLead.stage) {
        const stageLabels: Record<string, string> = {
          new: "New",
          qualified: "Qualified",
          proposal: "Proposal",
          negotiation: "Negotiation",
          won: "Won 🎉",
          lost: "Lost",
        };

        const newStageLabel = stageLabels[data.stage] || data.stage;
        const title = oldLead.title || updatedLead.title;

        if (data.stage === "won") {
          insertNotification(
            user.id,
            "Deal won! 🎉",
            `"${title}" has been marked as won.`,
            "success",
            "/leads"
          );
        } else if (data.stage === "lost") {
          insertNotification(
            user.id,
            "Deal lost",
            `"${title}" has been marked as lost.`,
            "error",
            "/leads"
          );
        } else {
          insertNotification(
            user.id,
            "Deal stage changed",
            `"${title}" moved to ${newStageLabel}.`,
            "info",
            "/leads"
          );
        }
      }

      return updatedLead;
    },
    [user]
  );

  const deleteLead = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
  }, []);

  return {
    leads,
    pagination,
    loading,
    error,
    stats,
    customers,
    fetchLeads,
    fetchStats,
    fetchCustomersForSelector,
    createLead,
    updateLead,
    deleteLead,
  };
}
