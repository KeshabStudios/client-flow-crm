import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  Trophy,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { StatsCard } from "@/components/shared/StatsCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadForm, LeadFormValues } from "@/components/leads/LeadForm";
import { LeadDetail } from "@/components/leads/LeadDetail";
import { LeadDeleteDialog } from "@/components/leads/LeadDeleteDialog";
import { useLeads, FetchLeadsParams, LeadWithCustomer } from "@/hooks/useLeads";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Lead } from "@/types";

// --- Constants ---

const stageBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  new: "secondary",
  qualified: "default",
  proposal: "default",
  negotiation: "outline",
  won: "default",
  lost: "destructive",
};

const stageLabels: Record<string, string> = {
  new: "New",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const stageColorMap: Record<string, string> = {
  new: "border-slate-300",
  qualified: "border-blue-300",
  proposal: "border-blue-400",
  negotiation: "border-amber-300",
  won: "border-emerald-400",
  lost: "border-red-300",
};

const sourceOptions = [
  { value: "all", label: "All Sources" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social", label: "Social Media" },
  { value: "other", label: "Other" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// --- Page Component ---

export default function Deals() {
  const {
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
  } = useLeads();

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedLead, setSelectedLead] = useState<LeadWithCustomer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const buildParams = useCallback((): FetchLeadsParams => ({
    search: debouncedSearch,
    stage: stageFilter !== "all" ? stageFilter : undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
    sortBy,
    sortOrder,
    page,
    pageSize,
  }), [debouncedSearch, stageFilter, sourceFilter, sortBy, sortOrder, page, pageSize]);

  // Initial load
  useEffect(() => {
    fetchLeads(buildParams());
    fetchStats();
    fetchCustomersForSelector();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchLeads(buildParams());
  }, [fetchLeads, buildParams]);

  const refresh = useCallback(() => {
    fetchLeads(buildParams());
    fetchStats();
  }, [fetchLeads, fetchStats, buildParams]);

  // CRUD
  const mapFormValues = (values: LeadFormValues) => ({
    title: values.title,
    stage: values.stage as Lead["stage"],
    customer_id: values.customer_id === "none" ? undefined : (values.customer_id || undefined),
    value: values.value ? Number(values.value) : undefined,
    source: (values.source || undefined) as Lead["source"],
    expected_close_date: values.expected_close_date || undefined,
  });

  const handleCreate = async (values: LeadFormValues) => {
    try {
      await createLead(mapFormValues(values));
      toast({ title: "Success", description: "Lead created." });
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create lead";
      toast({ title: "Error", description: msg, variant: "destructive" });
      throw err;
    }
  };

  const handleEdit = async (values: LeadFormValues) => {
    if (!selectedLead) return;
    try {
      await updateLead(selectedLead.id, mapFormValues(values));
      toast({ title: "Success", description: "Lead updated." });
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update lead";
      toast({ title: "Error", description: msg, variant: "destructive" });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selectedLead) return;
    setDeleteLoading(true);
    try {
      await deleteLead(selectedLead.id);
      toast({ title: "Success", description: "Lead deleted." });
      setDeleteOpen(false);
      setSelectedLead(null);
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete lead";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const openCreateForm = () => { setSelectedLead(null); setFormMode("create"); setFormOpen(true); };
  const openEditForm = (l: LeadWithCustomer) => { setSelectedLead(l); setFormMode("edit"); setFormOpen(true); };
  const openDetail = (l: LeadWithCustomer) => { setSelectedLead(l); setDetailOpen(true); };
  const openDeleteConfirm = (l: LeadWithCustomer) => { setSelectedLead(l); setDeleteOpen(true); };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
  };

  // Render table
  const renderTableBody = () => {
    if (loading) return null;

    if (leads.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-40 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <TrendingUp className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No leads found</p>
              <p className="text-xs">
                {search ? "Try a different search term." : "Create your first lead to get started."}
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return leads.map((lead) => {
      const stageVar = stageBadgeVariant[lead.stage] || "outline";
      const contact = lead.customers
        ? lead.customers.company_name
          ? `${lead.customers.full_name} (${lead.customers.company_name})`
          : lead.customers.full_name
        : null;

      return (
        <TableRow
          key={lead.id}
          className="cursor-pointer"
          onClick={() => openDetail(lead)}
        >
          <TableCell className="font-medium">{lead.title}</TableCell>
          <TableCell className="text-muted-foreground text-sm">
            {contact || "—"}
          </TableCell>
          <TableCell className="text-muted-foreground text-sm">
            {lead.value != null
              ? formatValue(lead.value)
              : "—"}
          </TableCell>
          <TableCell>
            <Badge variant={stageVar} className="text-[10px] uppercase px-2 py-0.5">
              {stageLabels[lead.stage] || lead.stage}
            </Badge>
          </TableCell>
          <TableCell className="text-muted-foreground text-sm">
            {lead.expected_close_date
              ? format(new Date(lead.expected_close_date), "MMM d, yyyy")
              : "—"}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(lead)} aria-label={`Edit ${lead.title}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteConfirm(lead)} aria-label={`Delete ${lead.title}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  const { formatValue, symbol } = useCurrency();

  // --- Computed stat values ---
  const formatCurrency = (val: number) => formatValue(val);

  return (
    <div className="space-y-6">
      <SeoHead title="Leads" description="Manage and track your sales leads pipeline." />

      <PageHeader title="Leads" description="Manage and track your sales leads pipeline.">
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" /> New Lead
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Leads" value={stats.total} icon={TrendingUp} variant="primary" />
        <StatsCard title="Pipeline Value" value={formatCurrency(stats.pipelineValue)} icon={DollarSign} variant="primary" />
        <StatsCard title="Won" value={stats.wonCount} icon={Trophy} variant="success" description={formatCurrency(stats.wonValue)} />
        <StatsCard title="This Month" value={stats.thisMonth} icon={CalendarDays} variant="default" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search leads..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search leads" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]" aria-label="Filter by stage"><SelectValue placeholder="All Stages" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {Object.entries(stageLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]" aria-label="Filter by source"><SelectValue placeholder="All Sources" /></SelectTrigger>
            <SelectContent>
              {sourceOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]" aria-label="Sort by"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="expected_close_date">Close Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => { setSortOrder((o) => (o === "asc" ? "desc" : "asc")); setPage(1); }} aria-label={sortOrder === "asc" ? "Ascending" : "Descending"}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="m21 8-4-4-4 4" /><path d="M17 4v16" /></svg>
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && <ErrorState message={error} onRetry={refresh} />}

      {/* Table */}
      {loading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Expected Close</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderTableBody()}</TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {Math.min((page - 1) * pageSize + 1, pagination.total)}–{Math.min(page * pageSize, pagination.total)} of {pagination.total}</span>
            <span className="text-muted-foreground/50">|</span>
            <span>Rows:</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-16" aria-label="Rows per page"><SelectValue /></SelectTrigger>
              <SelectContent>{PAGE_SIZE_OPTIONS.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => goToPage(page - 1)} aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {generatePageNumbers(pagination.totalPages, page).map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-1 text-muted-foreground text-sm" aria-hidden="true">...</span>
              ) : (
                <Button key={p} variant={page === p ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => goToPage(p as number)} aria-label={`Page ${p}`} aria-current={page === p ? "page" : undefined}>
                  {p}
                </Button>
              )
            )}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= pagination.totalPages} onClick={() => goToPage(page + 1)} aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      )}

      {/* Modals */}
      <LeadForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={formMode === "create" ? handleCreate : handleEdit}
        mode={formMode}
        customers={customers}
        defaultValues={selectedLead && formMode === "edit" ? {
          title: selectedLead.title,
          customer_id: selectedLead.customer_id || "",
          stage: selectedLead.stage as LeadFormValues["stage"],
          value: selectedLead.value != null ? String(selectedLead.value) : "",
          source: selectedLead.source || "",
          expected_close_date: selectedLead.expected_close_date || "",
        } : undefined}
      />
      <LeadDetail
        lead={selectedLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(l) => { setDetailOpen(false); setTimeout(() => openEditForm(l), 200); }}
        onDelete={(l) => { setDetailOpen(false); setTimeout(() => openDeleteConfirm(l), 200); }}
      />
      <LeadDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        leadTitle={selectedLead?.title || ""}
        loading={deleteLoading}
      />
    </div>
  );
}

function generatePageNumbers(totalPages: number, currentPage: number): (number | "...")[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (currentPage > 3) pages.push("...");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}
