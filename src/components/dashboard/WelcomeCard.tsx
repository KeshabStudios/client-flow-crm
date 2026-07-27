import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface WelcomeStat {
  label: string;
  value: number;
}

interface WelcomeCardProps {
  stats: WelcomeStat[];
  loading?: boolean;
}

export function WelcomeCard({ stats, loading }: WelcomeCardProps) {
  const { user } = useAuth();
  const name = user?.user_metadata?.name || user?.email?.split("@")[0] || "there";

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-xl shadow-primary/20">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {name} 👋
            </h2>
            <p className="text-blue-100">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8">
            {loading ? (
              <div className="flex items-center gap-2 text-blue-100">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : (
              stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-blue-100">{stat.label}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
