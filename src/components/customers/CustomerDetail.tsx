import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Building2, Mail, Phone, Calendar, FileText } from "lucide-react";
import { Customer } from "@/types";

interface CustomerDetailProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  lead: "outline",
};

export function CustomerDetail({
  customer,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: CustomerDetailProps) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{customer.full_name}</DialogTitle>
            <Badge variant={statusBadgeVariant[customer.status] || "outline"}>
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </Badge>
          </div>
          {customer.company_name && (
            <DialogDescription className="flex items-center gap-1.5 text-sm">
              <Building2 className="h-3.5 w-3.5" />
              {customer.company_name}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {customer.email && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{customer.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(customer.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {customer.notes && (
              <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Notes</p>
                </div>
                <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(customer);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onDelete(customer);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
