import { useState, useEffect, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { Plus, List, Columns2, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskBoardView } from "@/components/tasks/TaskBoardView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { TaskForm, TaskFormValues } from "@/components/tasks/TaskForm";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { TaskDeleteDialog } from "@/components/tasks/TaskDeleteDialog";
import { useTasks, TaskRow } from "@/hooks/useTasks";
import type { Task } from "@/types";

type ViewMode = "list" | "board" | "calendar";

export default function Tasks() {
  const {
    tasks,
    pagination,
    loading,
    error,
    profiles,
    fetchTasks,
    fetchAllTasks,
    fetchProfiles,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  // View mode
  const [view, setView] = useState<ViewMode>("list");

  // List view state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [listPage, setListPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Initial load: profiles for assignee dropdown
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Debounce search for list view
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setListPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data based on view mode
  useEffect(() => {
    if (view === "list") {
      fetchTasks({
        search: debouncedSearch,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        sortBy,
        sortOrder,
        page: listPage,
        pageSize,
      });
    } else {
      fetchAllTasks();
    }
  }, [
    view,
    debouncedSearch,
    statusFilter,
    priorityFilter,
    sortBy,
    sortOrder,
    listPage,
    pageSize,
    fetchTasks,
    fetchAllTasks,
  ]);

  // --- CRUD handlers ---

  const mapFormValues = (
    values: TaskFormValues
  ): Parameters<typeof createTask>[0] => ({
    title: values.title,
    description: values.description || null,
    status: values.status,
    priority: values.priority,
    due_date: values.due_date || null,
    assigned_to: values.assigned_to === "none" ? null : (values.assigned_to || null),
    lead_id: null, // Lead linking not exposed in this form version
  });

  const refreshCurrentView = useCallback(() => {
    if (view === "list") {
      fetchTasks({
        search: debouncedSearch,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        sortBy,
        sortOrder,
        page: listPage,
        pageSize,
      });
    } else {
      fetchAllTasks();
    }
  }, [
    view,
    debouncedSearch,
    statusFilter,
    priorityFilter,
    sortBy,
    sortOrder,
    listPage,
    pageSize,
    fetchTasks,
    fetchAllTasks,
  ]);

  const handleCreate = async (values: TaskFormValues) => {
    try {
      await createTask(mapFormValues(values));
      toast({ title: "Success", description: "Task created." });
      refreshCurrentView();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create task";
      toast({ title: "Error", description: msg, variant: "destructive" });
      throw err;
    }
  };

  const handleEdit = async (values: TaskFormValues) => {
    if (!selectedTask) return;
    try {
      await updateTask(selectedTask.id, mapFormValues(values));
      toast({ title: "Success", description: "Task updated." });
      refreshCurrentView();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update task";
      toast({ title: "Error", description: msg, variant: "destructive" });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    setDeleteLoading(true);
    try {
      await deleteTask(selectedTask.id);
      toast({ title: "Success", description: "Task deleted." });
      setDeleteOpen(false);
      setSelectedTask(null);
      refreshCurrentView();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete task";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Board view: status change (drag & drop)
  const handleStatusChange = useCallback(
    async (taskId: string, newStatus: Task["status"]) => {
      try {
        await updateTask(taskId, { status: newStatus });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update task status.",
          variant: "destructive",
        });
        throw err;
      }
    },
    [updateTask]
  );

  // --- Modal openers ---

  const openCreateForm = () => {
    setSelectedTask(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEditForm = (task: TaskRow) => {
    setSelectedTask(task);
    setFormMode("edit");
    setFormOpen(true);
  };

  const openDetail = (task: TaskRow) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const openDeleteConfirm = (task: TaskRow) => {
    setSelectedTask(task);
    setDeleteOpen(true);
  };

  // --- Helpers for list view ---

  const handleSearchChange = (value: string) => setSearch(value);

  // --- Error state ---

  if (error && tasks.length === 0 && view === "list") {
    return (
      <div className="space-y-6">
        <PageHeader title="Tasks" description="Manage your tasks.">
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </PageHeader>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading tasks</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => refreshCurrentView()}>
          <Loader2 className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  // --- Main render ---

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Manage your tasks.">
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as ViewMode)}
            className="border rounded-lg"
          >
            <ToggleGroupItem value="list" aria-label="List view" className="h-9 px-3 text-xs gap-1.5">
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="board" aria-label="Board view" className="h-9 px-3 text-xs gap-1.5">
              <Columns2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Board</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" aria-label="Calendar view" className="h-9 px-3 text-xs gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </PageHeader>

      {/* Error banner */}
      {error && tasks.length > 0 && (
        <Alert variant="destructive" className="py-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Error</AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Views */}
      {view === "list" && (
        <TaskListView
          tasks={tasks}
          pagination={pagination}
          loading={loading}
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => { setStatusFilter(v); setListPage(1); }}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={(v) => { setPriorityFilter(v); setListPage(1); }}
          sortBy={sortBy}
          onSortByChange={(v) => { setSortBy(v); setListPage(1); }}
          sortOrder={sortOrder}
          onToggleSortOrder={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          page={listPage}
          pageSize={pageSize}
          onPageChange={setListPage}
          onPageSizeChange={(s) => { setPageSize(s); setListPage(1); }}
          onTaskClick={openDetail}
          onEditClick={openEditForm}
          onDeleteClick={openDeleteConfirm}
        />
      )}

      {view === "board" && (
        <TaskBoardView
          tasks={tasks}
          loading={loading}
          onStatusChange={handleStatusChange}
          onTaskClick={openDetail}
        />
      )}

      {view === "calendar" && (
        <TaskCalendarView
          tasks={tasks}
          loading={loading}
          onTaskClick={openDetail}
          onEditClick={openEditForm}
          onDeleteClick={openDeleteConfirm}
        />
      )}

      {/* Modals */}
      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={formMode === "create" ? handleCreate : handleEdit}
        mode={formMode}
        profiles={profiles}
        defaultValues={
          selectedTask && formMode === "edit"
            ? {
                title: selectedTask.title,
                description: selectedTask.description || "",
                status: selectedTask.status,
                priority: selectedTask.priority,
                due_date: selectedTask.due_date || "",
                assigned_to: selectedTask.assigned_to || "",
              }
            : undefined
        }
      />

      <TaskDetail
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(t) => {
          setDetailOpen(false);
          setTimeout(() => openEditForm(t), 200);
        }}
        onDelete={(t) => {
          setDetailOpen(false);
          setTimeout(() => openDeleteConfirm(t), 200);
        }}
      />

      <TaskDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        taskTitle={selectedTask?.title || ""}
        loading={deleteLoading}
      />
    </div>
  );
}
