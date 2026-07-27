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
import { leadStatusData } from "@/data/dashboard";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = leadStatusData.reduce((sum, d) => sum + d.value, 0);
    const percentage = ((data.value / total) * 100).toFixed(1);
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

export function LeadStatusChart() {
  const totalLeads = leadStatusData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Lead Status</CardTitle>
          <span className="text-sm text-muted-foreground">
            {totalLeads.toLocaleString()} total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Donut Chart */}
          <div className="h-[200px] w-full max-w-[220px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {leadStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3 self-center sm:self-auto">
            {leadStatusData.map((item) => {
              const percentage = ((item.value / totalLeads) * 100).toFixed(1);
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
      </CardContent>
    </Card>
  );
}
