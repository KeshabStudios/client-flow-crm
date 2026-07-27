import { Plus, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Deals() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description="Track your sales pipeline and close more deals."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { stage: "Lead", count: 24, value: "$48,000", color: "border-slate-300" },
          { stage: "Qualified", count: 18, value: "$72,000", color: "border-blue-300" },
          { stage: "Proposal", count: 12, value: "$96,000", color: "border-blue-400" },
          { stage: "Closed Won", count: 8, value: "$124,500", color: "border-emerald-400" },
        ].map((stage) => (
          <Card key={stage.stage} className={`border-t-4 ${stage.color}`}>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">{stage.stage}</p>
              <p className="text-2xl font-bold">{stage.count}</p>
              <p className="text-xs text-muted-foreground">{stage.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Your pipeline is empty</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            Create your first deal to start tracking sales opportunities.
          </p>
          <Button>Create Your First Deal</Button>
        </CardContent>
      </Card>
    </div>
  );
}
