import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { useLeads, LeadWithCustomer } from "@/hooks/useLeads";
import type { KanbanCardData } from "@/components/leads/KanbanCard";
import type { LeadStage } from "@/types";
import { Table2, Columns3 } from "lucide-react";

function mapToKanbanCardData(lead: LeadWithCustomer): KanbanCardData {
  return {
    id: lead.id,
    title: lead.title,
    stage: lead.stage,
    value: lead.value ?? null,
    expected_close_date: lead.expected_close_date ?? null,
    customer: lead.customers
      ? {
          full_name: lead.customers.full_name,
          company_name: lead.customers.company_name ?? null,
        }
      : null,
  };
}

export default function Kanban() {
  const navigate = useNavigate();

  const {
    leads,
    loading,
    error,
    fetchAllLeads,
    updateLead,
    deleteLead,
  } = useLeads();

  const [kanbanData, setKanbanData] = useState<KanbanCardData[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<KanbanCardData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  // Sync kanbanData from leads whenever leads changes
  useEffect(() => {
    setKanbanData(leads.map(mapToKanbanCardData));
  }, [leads]);

  const handleStageChange = useCallback(
    async (leadId: string, newStage: LeadStage) => {
      try {
        await updateLead(leadId, { stage: newStage });
        setKanbanData((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
        );
      } catch {
        toast({
          title: "Error",
          description: "Failed to update lead stage.",
          variant: "destructive",
        });
      }
    },
    [updateLead]
  );

  const handleCardClick = useCallback((lead: KanbanCardData) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  }, []);

  const handleEditFromDetail = useCallback(
    () => {
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
      await deleteLead(selectedLead.id);
      toast({ title: "Success", description: "Lead deleted." });
      setDeleteOpen(false);
      setSelectedLead(null);
      setKanbanData((prev) => prev.filter((l) => l.id !== selectedLead.id));
    } catch {
      toast({ title: "Error", description: "Failed to delete lead.", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedLead, deleteLead]);

  // Error state
  if (error && !loading && kanbanData.length === 0) {
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
        <ErrorState message={error} onRetry={fetchAllLeads} />
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
        leads={kanbanData}
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
