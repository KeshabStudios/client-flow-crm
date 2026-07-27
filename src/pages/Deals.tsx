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
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LeadForm, LeadFormValues } from "@/components/leads/LeadForm";
import { LeadDetail } from "@/components/leads/LeadDetail";
import { LeadDeleteDialog } from "@/components/leads/LeadDeleteDialog";
import { useLeads, FetchLeadsParams, LeadWithCustomer } from "@/hooks/useLeads";
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

  // Filters & sort state
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedLead, setSelectedLead] = useState<LeadWithCustomer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Build fetch params
  const buildParams = useCallback((): FetchLeadsParams => {
    return {
      search: debouncedSearch,
      stage: stageFilter !== "all" ? stageFilter : undefined,
      source: sourceFilter !== "all" ? sourceFilter : undefined,
      sortBy,
      sortOrder,
      page,
      pageSize,
    };
  }, [debouncedSearch, stageFilter, sourceFilter, sortBy, sortOrder, page, pageSize]);

  // Initial data load
  useEffect(() => {
    fetchLeads(buildParams());
    fetchStats();
    fetchCustomersForSelector();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch on filter changes
  useEffect(() => {
    fetchLeads(buildParams());
  }, [fetchLeads, buildParams]);

  // Refresh stats after mutations
  const refresh = useCallback(() => {
    fetchLeads(buildParams());
    fetchStats();
  }, [fetchLeads, fetchStats, buildParams]);

  // --- Filter handlers ---

  const handleStageChange = (value: string) => {
    setStageFilter(value);
    setPage(1);
  };

  const handleSourceChange = (value: string) => {
    setSourceFilter(value);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  // --- CRUD handlers ---

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
      toast({ title: "Success", description: "Lead created successfully." });
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
      toast({ title: "Success", description: "Lead updated successfully." });
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
      toast({ title: "Success", description: "Lead deleted successfully." });
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

  // --- Modal openers ---

  const openCreateForm = () => {
    setSelectedLead(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEditForm = (lead: LeadWithCustomer) => {
    setSelectedLead(lead);
    setFormMode("edit");
    setFormOpen(true);
  };

  const openDetail = (lead: LeadWithCustomer) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  const openDeleteConfirm = (lead: LeadWithCustomer) => {
    setSelectedLead(lead);
    setDeleteOpen(true);
  };

  // --- Pagination ---

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
  };

  // --- Render helpers ---

  const renderTableBody = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skel-${i}`}>
          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
        </TableRow>
      ));
    }

    if (leads.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-32 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">No leads found</p>
              <p className="text-xs">
                {debouncedSearch || stageFilter !== "all" || sourceFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Get started by adding your first lead."}
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return leads.map((lead) => (
      <TableRow
        key={lead.id}
        className="cursor-pointer"
        onClick={() => openDetail(lead)}
      >
        <TableCell className="font-medium">{lead.title}</TableCell>
        <TableCell className="text-muted-foreground">
          {lead.customers ? lead.customers.full_name : "—"}
        </TableCell>
        <TableCell>
          {lead.value != null
            ? `$${Number(lead.value).toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`
            : "—"}
        </TableCell>
        <TableCell>
          <Badge variant={stageBadgeVariant[lead.stage] || "outline"}>
            {stageLabels[lead.stage] || lead.stage}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground text-xs">
          {lead.expected_close_date
            ? format(new Date(lead.expected_close_date), "MMM d, yyyy")
            : "—"}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                openEditForm(lead);
              }}
            >
              <span className="sr-only">Edit</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteConfirm(lead);
              }}
            >
              <span className="sr-only">Delete</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  // --- Full-page error state ---

  if (error && leads.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Leads" description="Track your sales pipeline." />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading leads</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => {
            fetchLeads(buildParams());
            fetchStats();
          }}
        >
          <Loader2 className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // --- Main render ---

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Track your sales pipeline."
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </PageHeader>

      {/* Error banner */}
      {error && leads.length > 0 && (
        <Alert variant="destructive" className="py-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Error</AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={stats.total}
          icon={TrendingUp}
          variant="primary"
        />
        <StatsCard
          title="Pipeline Value"
          value={`$${stats.pipelineValue.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          icon={DollarSign}
          variant="warning"
        />
        <StatsCard
          title="Won"
          value={stats.wonCount}
          description={`$${stats.wonValue.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })} total`}
          icon={Trophy}
          variant="success"
        />
        <StatsCard
          title="This Month"
          value={stats.thisMonth}
          icon={CalendarDays}
        />
      </div>

      {/* Pipeline stage cards */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(stageLabels).map(([key, label]) => {
          const count = leads.filter((l) => l.stage === key).length;
          return (
            <Card
              key={key}
              className={`border-t-4 ${stageColorMap[key] || "border-slate-300"}`}
            >
              <CardContent className="p-3 text-center">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-xl font-bold mt-1">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={stageFilter} onValueChange={handleStageChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {Object.entries(stageLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={handleSourceChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={toggleSortOrder}
            title={sortOrder === "asc" ? "Oldest first" : "Newest first"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m3 16 4 4 4-4" />
              <path d="M7 20V4" />
              <path d="m21 8-4-4-4 4" />
              <path d="M17 4v16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, pagination.total)}
              –{Math.min(page * pageSize, pagination.total)} of{" "}
              {pagination.total}
            </span>
            <span className="text-muted-foreground/50">|</span>
            <span>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>

            {generatePageNumbers(pagination.totalPages, page).map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-1 text-muted-foreground text-sm"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(p as number)}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= pagination.totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <LeadForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={formMode === "create" ? handleCreate : handleEdit}
        mode={formMode}
        customers={customers}
        defaultValues={
          selectedLead && formMode === "edit"
            ? {
                title: selectedLead.title,
                customer_id: selectedLead.customer_id || "",
                stage: selectedLead.stage as LeadFormValues["stage"],
                value: selectedLead.value != null ? String(selectedLead.value) : "",
                source: selectedLead.source || "",
                expected_close_date: selectedLead.expected_close_date || "",
              }
            : undefined
        }
      />

      <LeadDetail
        lead={selectedLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(l) => {
          setDetailOpen(false);
          setTimeout(() => openEditForm(l), 200);
        }}
        onDelete={(l) => {
          setDetailOpen(false);
          setTimeout(() => openDeleteConfirm(l), 200);
        }}
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

// --- Helpers ---

function generatePageNumbers(
  totalPages: number,
  currentPage: number
): (number | "...")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  pages.push(1);

  if (currentPage > 3) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}
