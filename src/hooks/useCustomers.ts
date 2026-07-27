import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";

export interface FetchCustomersParams {
  search?: string;
  status?: string;
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

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(
    async (params?: FetchCustomersParams) => {
      setLoading(true);
      setError(null);

      try {
        const {
          search = "",
          status = "all",
          sortBy = "full_name",
          sortOrder = "asc",
          page = 1,
          pageSize = 10,
        } = params || {};

        let query = supabase
          .from("customers")
          .select("*", { count: "exact" });

        // Search across name, company, email, phone
        if (search.trim()) {
          const searchTerm = `%${search.trim()}%`;
          query = query.or(
            `full_name.ilike.${searchTerm},company_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`
          );
        }

        // Filter by status
        if (status && status !== "all") {
          query = query.eq("status", status);
        }

        // Sort
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setCustomers(data || []);
        setPagination({
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch customers";
        setError(message);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createCustomer = useCallback(
    async (
      data: Omit<Customer, "id" | "user_id" | "created_at">
    ): Promise<Customer> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: newCustomer, error } = await supabase
        .from("customers")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return newCustomer;
    },
    []
  );

  const updateCustomer = useCallback(
    async (id: string, data: Partial<Customer>): Promise<Customer> => {
      const { data: updatedCustomer, error } = await supabase
        .from("customers")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedCustomer;
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }, []);

  return {
    customers,
    pagination,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
