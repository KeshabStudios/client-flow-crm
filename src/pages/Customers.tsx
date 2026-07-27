import { useState, useEffect, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  Users,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { EmptyState } from "@/components/shared/EmptyState";
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
import { CustomerForm, CustomerFormValues } from "@/components/customers/CustomerForm";
import { CustomerDetail } from "@/components/customers/CustomerDetail";
import { CustomerDeleteDialog } from "@/components/customers/CustomerDeleteDialog";
import { useCustomers, FetchCustomersParams } from "@/hooks/useCustomers";
import type { Customer } from "@/types";

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  lead: "outline",
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function Customers() {
  const {
    customers,
    pagination,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("full_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const buildParams = useCallback((): FetchCustomersParams => ({
    search: debouncedSearch,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
    sortOrder,
    page,
    pageSize,
  }), [debouncedSearch, statusFilter, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    fetchCustomers(buildParams());
  }, [fetchCustomers, buildParams]);

  const handleSearchChange = (value: string) => setSearch(value);

  // CRUD
  const mapFormValues = (values: CustomerFormValues) => ({
    full_name: values.full_name,
    company_name: values.company_name || null,
    email: values.email || null,
    phone: values.phone || null,
    status: values.status,
    notes: values.notes || null,
  });

  const refresh = () => fetchCustomers(buildParams());

  const handleCreate = async (values: CustomerFormValues) => {
    try {
      await createCustomer(mapFormValues(values));
      toast({ title: "Success", description: "Customer created." });
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create customer";
      toast({ title: "Error", description: msg, variant: "destructive" });
      throw err;
    }
  };

  const handleEdit = async (values: CustomerFormValues) => {
    if (!selectedCustomer) return;
    try {
      await updateCustomer(selectedCustomer.id, mapFormValues(values));
      toast({ title: "Success", description: "Customer updated." });
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update customer";
      toast({ title: "Error", description: msg, variant: "destructive" });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    setDeleteLoading(true);
    try {
      await deleteCustomer(selectedCustomer.id);
      toast({ title: "Success", description: "Customer deleted." });
      setDeleteOpen(false);
      setSelectedCustomer(null);
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete customer";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Modal openers
  const openCreateForm = () => { setSelectedCustomer(null); setFormMode("create"); setFormOpen(true); };
  const openEditForm = (c: Customer) => { setSelectedCustomer(c); setFormMode("edit"); setFormOpen(true); };
  const openDetail = (c: Customer) => { setSelectedCustomer(c); setDetailOpen(true); };
  const openDeleteConfirm = (c: Customer) => { setSelectedCustomer(c); setDeleteOpen(true); };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
  };

  // Render
  const renderTableBody = () => {
    if (loading) {
      return null; // TableSkeleton handles loading
    }

    if (customers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-40 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Users className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs">
                {search
                  ? "Try a different search term."
                  : "Create your first customer to get started."}
              </p>
              {!search && (
                <Button variant="link" size="sm" className="mt-2" onClick={openCreateForm}>
                  <UserPlus className="mr-1 h-3.5 w-3.5" />
                  Add customer
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return customers.map((customer) => (
      <TableRow
        key={customer.id}
        className="cursor-pointer"
        onClick={() => openDetail(customer)}
      >
        <TableCell className="font-medium">{customer.full_name}</TableCell>
        <TableCell className="text-muted-foreground">{customer.company_name || "—"}</TableCell>
        <TableCell className="text-muted-foreground">{customer.email || "—"}</TableCell>
        <TableCell className="text-muted-foreground">{customer.phone || "—"}</TableCell>
        <TableCell>
          <Badge variant={statusBadgeVariant[customer.status] || "outline"}>
            {customer.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEditForm(customer)}
              aria-label={`Edit ${customer.full_name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => openDeleteConfirm(customer)}
              aria-label={`Delete ${customer.full_name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Customers" description="Manage your customers and contacts." />

      <PageHeader title="Customers" description="Manage your customers and contacts.">
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" /> New Customer
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search customers"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]" aria-label="Filter by status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]" aria-label="Sort by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_name">Name</SelectItem>
              <SelectItem value="company_name">Company</SelectItem>
              <SelectItem value="created_at">Created</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => { setSortOrder((o) => (o === "asc" ? "desc" : "asc")); setPage(1); }}
            aria-label={sortOrder === "asc" ? "Ascending order" : "Descending order"}
          >
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
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
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
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, pagination.total)}
              –{Math.min(page * pageSize, pagination.total)} of {pagination.total}
            </span>
            <span className="text-muted-foreground/50">|</span>
            <span>Rows:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-16" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <nav className="flex items-center gap-1" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {generatePageNumbers(pagination.totalPages, page).map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-1 text-muted-foreground text-sm" aria-hidden="true">...</span>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(p as number)}
                  aria-label={`Page ${p}`}
                  aria-current={page === p ? "page" : undefined}
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
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      )}

      {/* Empty state (no data at all) */}
      {!loading && !error && customers.length === 0 && (
        <EmptyState
          icon={<Users className="h-7 w-7 text-muted-foreground" />}
          title="No customers yet"
          description="Get started by adding your first customer."
          actions={
            <Button onClick={openCreateForm}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Your First Customer
            </Button>
          }
        />
      )}

      {/* Modals */}
      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={formMode === "create" ? handleCreate : handleEdit}
        mode={formMode}
        defaultValues={selectedCustomer && formMode === "edit" ? {
          full_name: selectedCustomer.full_name,
          company_name: selectedCustomer.company_name || "",
          email: selectedCustomer.email || "",
          phone: selectedCustomer.phone || "",
          status: selectedCustomer.status as "active" | "inactive" | "lead",
          notes: selectedCustomer.notes || "",
        } : undefined}
      />
      <CustomerDetail
        customer={selectedCustomer}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(c) => { setDetailOpen(false); setTimeout(() => openEditForm(c), 200); }}
        onDelete={(c) => { setDetailOpen(false); setTimeout(() => openDeleteConfirm(c), 200); }}
      />
      <CustomerDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        customerName={selectedCustomer?.full_name || ""}
        loading={deleteLoading}
      />
    </div>
  );
}

function generatePageNumbers(totalPages: number, currentPage: number): (number | "...")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (currentPage > 3) pages.push("...");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}
