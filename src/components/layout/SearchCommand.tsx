import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  CheckSquare,
  Settings,
  Search,
  Building2,
  Target,
  ClipboardList,
  Loader2,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "page" | "customer" | "lead" | "task";
  href: string;
  icon: React.ElementType;
}

const pageItems: SearchResult[] = [
  { id: "dashboard", title: "Dashboard", type: "page", href: "/", icon: LayoutDashboard },
  { id: "customers", title: "Customers", type: "page", href: "/customers", icon: Users },
  { id: "leads", title: "Deals", type: "page", href: "/leads", icon: TrendingUp },
  { id: "kanban", title: "Kanban Board", type: "page", href: "/kanban", icon: Target },
  { id: "tasks", title: "Tasks", type: "page", href: "/tasks", icon: CheckSquare },
  { id: "settings", title: "Settings", type: "page", href: "/settings", icon: Settings },
];

export function SearchCommand() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch data when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [customersResult, leadsResult, tasksResult] = await Promise.allSettled([
          supabase.from("customers").select("id, full_name, company_name").limit(20),
          supabase.from("leads").select("id, title, customer_id").limit(20),
          supabase.from("tasks").select("id, title").limit(20),
        ]);

        const items: SearchResult[] = [...pageItems];

        if (customersResult.status === "fulfilled" && customersResult.value.data) {
          for (const c of customersResult.value.data) {
            items.push({
              id: `customer-${c.id}`,
              title: c.full_name,
              subtitle: c.company_name || undefined,
              type: "customer",
              href: `/customers`,
              icon: Building2,
            });
          }
        }

        if (leadsResult.status === "fulfilled" && leadsResult.value.data) {
          for (const l of leadsResult.value.data) {
            items.push({
              id: `lead-${l.id}`,
              title: l.title,
              type: "lead",
              href: `/leads`,
              icon: Target,
            });
          }
        }

        if (tasksResult.status === "fulfilled" && tasksResult.value.data) {
          for (const t of tasksResult.value.data) {
            items.push({
              id: `task-${t.id}`,
              title: t.title,
              type: "task",
              href: `/tasks`,
              icon: ClipboardList,
            });
          }
        }

        setResults(items);
      } catch {
        setResults(pageItems);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full max-w-sm justify-start rounded-lg border border-border bg-muted/50 text-sm font-normal text-muted-foreground shadow-none md:w-72 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>{t("nav.search")}</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, contacts, deals..." />
        <CommandList>
          {loading && results.length <= pageItems.length ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Pages">
                {results
                  .filter((r) => r.type === "page")
                  .map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      onSelect={() => runCommand(() => navigate(item.href))}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
              {results.filter((r) => r.type === "customer").length > 0 && (
                <CommandGroup heading="Customers">
                  {results
                    .filter((r) => r.type === "customer")
                    .map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.title} ${item.subtitle ?? ""} customer`}
                        onSelect={() => runCommand(() => navigate(item.href))}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                        {item.subtitle && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {item.subtitle}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              {results.filter((r) => r.type === "lead").length > 0 && (
                <CommandGroup heading="Deals">
                  {results
                    .filter((r) => r.type === "lead")
                    .map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.title} deal lead`}
                        onSelect={() => runCommand(() => navigate(item.href))}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              {results.filter((r) => r.type === "task").length > 0 && (
                <CommandGroup heading="Tasks">
                  {results
                    .filter((r) => r.type === "task")
                    .map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.title} task`}
                        onSelect={() => runCommand(() => navigate(item.href))}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
