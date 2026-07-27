import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import {
  KanbanBoard,
} from "@/components/leads/KanbanBoard";
import { LeadDetail } from "@/components/leads/LeadDetail";
import { LeadDeleteDialog } from "@/components/leads/LeadDeleteDialog";
import type { KanbanCardData } from "@/components/leads/KanbanCard";
import type { LeadStage, Lead } from "@/types";
import { Table2, Columns3 } from "lucide-react";

interface CustomerInfo {
  full_name: string;
  company_name?: string | null;
}

interface LeadRow {
  id: string;
  title: string;
  stage: LeadStage;
  value: number | null;
  expected_close_date: string | null;
  customer_id: string | null;
  customers: CustomerInfo | null;
  created_at: string;
}

export default function Kanban() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<KanbanCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<KanbanCardData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("leads")
        .select("*, customers(full_name, company_name)")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const rows = (data || []) as unknown as LeadRow[];
      const mapped: KanbanCardData[] = rows.map((row) => ({
        id: row.id,
        title: row.title,
        stage: row.stage,
        value: row.value,
        expected_close_date: row.expected_close_date,
        customer: row.customers
          ? {
              full_name: row.customers.full_name,
              company_name: row.customers.company_name,
            }
          : null,
      }));

      setLeads(mapped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load leads";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStageChange = useCallback(
    async (leadId: string, newStage: LeadStage) => {
      const { error: updateError } = await supabase
        .from("leads")
        .update({ stage: newStage })
        .eq("id", leadId);

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to update lead stage.",
          variant: "destructive",
        });
        throw updateError;
      }

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
      );
    },
    []
  );

  const handleCardClick = useCallback((lead: KanbanCardData) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  }, []);

  const handleEditFromDetail = useCallback(
    (lead: KanbanCardData) => {
      setDetailOpen(false);
      navigate("/leads");
      toast({
        title: "Info",
        description: "Switch to table view to edit lead details.",
      });
    },
    [navigate]
  );

  const handleDeleteFromDetail = useCallback(
    (lead: KanbanCardData) => {
      setDetailOpen(false);
      setSelectedLead(lead);
      setTimeout(() => setDeleteOpen(true), 200);
    },
    []
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedLead) return;
    setDeleteLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from("leads")
        .delete()
        .eq("id", selectedLead.id);

      if (deleteError) throw deleteError;

      toast({ title: "Success", description: "Lead deleted." });
      setDeleteOpen(false);
      setSelectedLead(null);
      setLeads((prev) => prev.filter((l) => l.id !== selectedLead.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete lead";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedLead]);

  // Error state
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <SeoHead title="Kanban Board" />
        <PageHeader
          title="Kanban Board"
          description="Drag and drop leads to update their stage."
        >
          <Button variant="outline" onClick={() => navigate("/leads")}>
            <Table2 className="mr-2 h-4 w-4" />
            Table View
          </Button>
        </PageHeader>
        <ErrorState message={error} onRetry={fetchLeads} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SeoHead title="Kanban Board" description="Drag and drop leads to update their stage." />

      <PageHeader
        title="Kanban Board"
        description="Drag and drop leads to update their stage."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/leads")}>
            <Table2 className="mr-2 h-4 w-4" />
            Table View
          </Button>
          <Button variant="secondary" disabled className="cursor-default" aria-label="Board view active">
            <Columns3 className="mr-2 h-4 w-4" />
            Board
          </Button>
        </div>
      </PageHeader>

      <KanbanBoard
        leads={leads}
        loading={loading}
        onStageChange={handleStageChange}
        onCardClick={handleCardClick}
      />

      <LeadDetail
        lead={selectedLead ? {
          id: selectedLead.id,
          title: selectedLead.title,
          stage: selectedLead.stage,
          value: selectedLead.value ?? undefined,
          expected_close_date: selectedLead.expected_close_date ?? undefined,
          customer_id: null,
          customers: selectedLead.customer
            ? { full_name: selectedLead.customer.full_name, company_name: selectedLead.customer.company_name ?? undefined }
            : null,
          created_at: "",
        } : null}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      <LeadDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        leadTitle={selectedLead?.title || ""}
        loading={deleteLoading}
      />
    </div>
  );
}
