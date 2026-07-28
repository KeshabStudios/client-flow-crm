import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  User,
  DollarSign,
  Calendar,
  TrendingUp,
  Target,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { LeadWithCustomer } from "@/hooks/useLeads";

interface LeadDetailProps {
  lead: LeadWithCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (lead: LeadWithCustomer) => void;
  onDelete: (lead: LeadWithCustomer) => void;
}

const stageBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  new: "secondary",
  qualified: "default",
  proposal: "default",
  negotiation: "outline",
  won: "default",
  lost: "destructive",
};

const stageLabel: Record<string, string> = {
  new: "New",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const sourceLabels: Record<string, string> = {
  phone: "Phone",
  email: "Email",
  website: "Website",
  referral: "Referral",
  social: "Social Media",
  other: "Other",
};

export function LeadDetail({
  lead,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: LeadDetailProps) {
  const { symbol } = useCurrency();
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-xl truncate">
              {lead.title}
            </DialogTitle>
            <Badge
              variant={stageBadgeVariant[lead.stage] || "outline"}
              className="shrink-0"
            >
              {stageLabel[lead.stage] || lead.stage}
            </Badge>
          </div>
          {lead.customers && (
            <DialogDescription className="flex items-center gap-1.5 text-sm">
              <User className="h-3.5 w-3.5" />
              {lead.customers.full_name}
              {lead.customers.company_name
                ? ` — ${lead.customers.company_name}`
                : ""}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {lead.value != null && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="text-sm font-medium">
                    {symbol}{Number(lead.value).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}

            {lead.source && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-sm font-medium">
                    {sourceLabels[lead.source] || lead.source}
                  </p>
                </div>
              </div>
            )}

            {lead.expected_close_date && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                <Target className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Expected Close</p>
                  <p className="text-sm font-medium">
                    {new Date(lead.expected_close_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(lead.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(lead);
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
                onDelete(lead);
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
