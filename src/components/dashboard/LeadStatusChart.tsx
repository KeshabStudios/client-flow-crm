import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Loader2, PieChart as PieIcon } from "lucide-react";
import type { LeadStatusItem } from "@/types";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = (payload[0].payload.total || data.payload?.total || 0) as number;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0";
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <p className="text-sm font-medium">{data.name}</p>
        </div>
        <p className="mt-1 text-2xl font-bold">{data.value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{percentage}% of total</p>
      </div>
    );
  }
  return null;
};

interface LeadStatusChartProps {
  data: LeadStatusItem[];
  loading?: boolean;
}

export function LeadStatusChart({ data, loading }: LeadStatusChartProps) {
  const totalLeads = data.reduce((sum, d) => sum + d.value, 0);

  // Add total to each item for tooltip
  const enrichedData = data.map((item) => ({ ...item, total: totalLeads }));

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Lead Status</CardTitle>
          <span className="text-sm text-muted-foreground">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin inline" aria-hidden="true" />
            ) : (
              `${totalLeads.toLocaleString()} total`
            )}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <PieIcon className="mb-2 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm font-medium">No lead data</p>
            <p className="text-xs">Create leads to see status breakdown.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Donut Chart */}
            <div className="h-[200px] w-full max-w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enrichedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {enrichedData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3 self-center sm:self-auto">
              {data.map((item) => {
                const percentage = totalLeads > 0 ? ((item.value / totalLeads) * 100).toFixed(1) : "0";
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-bold">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {percentage}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
