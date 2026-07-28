import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2, BarChart3 } from "lucide-react";
import type { MonthlyLeadItem } from "@/types";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface MonthlyLeadsChartProps {
  data: MonthlyLeadItem[];
  loading?: boolean;
}

export function MonthlyLeadsChart({ data, loading }: MonthlyLeadsChartProps) {
  const totalLeads = data.reduce((sum, m) => sum + m.leads, 0);
  const totalQualified = data.reduce((sum, m) => sum + (m.qualified ?? 0), 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Monthly Leads
            </CardTitle>
            <CardDescription>
              New leads vs qualified leads over the past year
            </CardDescription>
          </div>
          <div className="hidden gap-4 sm:flex">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Leads</p>
              <p className="text-lg font-bold">
                {loading ? "..." : totalLeads}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Qualified</p>
              <p className="text-lg font-bold">
                {loading ? "..." : totalQualified}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : data.length === 0 || data.every((d) => d.leads === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BarChart3 className="mb-2 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm font-medium">No leads data</p>
            <p className="text-xs">Create leads to see monthly trends.</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  dataKey="leads"
                  name="New Leads"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="qualified"
                  name="Qualified"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
