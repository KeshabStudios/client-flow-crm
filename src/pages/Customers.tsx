import { useState, useEffect, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  Users,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
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
  // Data & fetch
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

  // Filters & sort state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("full_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounced search ref
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Build query params
  const buildParams = useCallback((): FetchCustomersParams => {
    return {
      search: debouncedSearch,
      status: statusFilter !== "all" ? statusFilter : undefined,
      sortBy,
      sortOrder,
      page,
      pageSize,
    };
  }, [debouncedSearch, statusFilter, sortBy, sortOrder, page, pageSize]);

  // Fetch when params change
  useEffect(() => {
    fetchCustomers(buildParams());
  }, [fetchCustomers, buildParams]);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  // --- CRUD handlers ---

  const mapFormValues = (values: CustomerFormValues) => ({
    full_name: values.full_name,
    company_name: values.company_name || null,
    email: values.email || null,
    phone: values.phone || null,
    status: values.status,
    notes: values.notes || null,
  });

  const handleCreate = async (values: CustomerFormValues) => {
    try {
      await createCustomer(mapFormValues(values));
      toast({ title: "Success", description: "Customer created successfully." });
      fetchCustomers(buildParams());
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
      toast({ title: "Success", description: "Customer updated successfully." });
      fetchCustomers(buildParams());
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
      toast({ title: "Success", description: "Customer deleted successfully." });
      setDeleteOpen(false);
      setSelectedCustomer(null);
      fetchCustomers(buildParams());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete customer";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Modal openers ---

  const openCreateForm = () => {
    setSelectedCustomer(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEditForm = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormMode("edit");
    setFormOpen(true);
  };

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailOpen(true);
  };

  const openDeleteConfirm = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteOpen(true);
  };

  // --- Pagination ---

  const canPrevious = page > 1;
  const canNext = page < pagination.totalPages;

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
  };

  // --- Render helpers ---

  const renderTableBody = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
          <TableCell><Skeleton className="h-5 w-36" /></TableCell>
          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
        </TableRow>
      ));
    }

    if (customers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-32 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Users className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs">
                {debouncedSearch || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Get started by adding your first customer."}
              </p>
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
        <TableCell className="text-muted-foreground">
          {customer.company_name || "—"}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {customer.email || "—"}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {customer.phone || "—"}
        </TableCell>
        <TableCell>
          <Badge variant={statusBadgeVariant[customer.status] || "outline"}>
            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                openEditForm(customer);
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
                openDeleteConfirm(customer);
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

  // --- Fallback pages ---

  if (error && customers.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customers" description="Manage your customer relationships." />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading customers</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => fetchCustomers(buildParams())}
        >
          <Loader2 className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer relationships."
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </PageHeader>

      {/* Error banner (non-blocking) */}
      {error && customers.length > 0 && (
        <Alert variant="destructive" className="py-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Error</AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, email or phone..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_name">Name</SelectItem>
              <SelectItem value="company_name">Company</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="created_at">Created</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={toggleSortOrder}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing{" "}
              {Math.min((page - 1) * pageSize + 1, pagination.total)}–{Math.min(page * pageSize, pagination.total)}{" "}
              of {pagination.total}
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
              disabled={!canPrevious}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>

            {/* Page numbers */}
            {generatePageNumbers(pagination.totalPages, page).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
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
              disabled={!canNext}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={formMode === "create" ? handleCreate : handleEdit}
        mode={formMode}
        defaultValues={
          selectedCustomer && formMode === "edit"
            ? {
                full_name: selectedCustomer.full_name,
                company_name: selectedCustomer.company_name || "",
                email: selectedCustomer.email || "",
                phone: selectedCustomer.phone || "",
                status: selectedCustomer.status as "active" | "inactive" | "lead",
                notes: selectedCustomer.notes || "",
              }
            : undefined
        }
      />

      <CustomerDetail
        customer={selectedCustomer}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(c) => {
          setDetailOpen(false);
          setTimeout(() => openEditForm(c), 200);
        }}
        onDelete={(c) => {
          setDetailOpen(false);
          setTimeout(() => openDeleteConfirm(c), 200);
        }}
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

/** Helper to render page numbers with ellipsis */
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
