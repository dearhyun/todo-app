import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Todo, TodoStatus, Priority } from "@/lib/types/todo";
import { TodoList } from "@/components/todo/TodoList";
import { TodoForm } from "@/components/todo/TodoForm";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Loader2,
    Sparkles,
    Plus,
    Search,
    FilterX,
    SlidersHorizontal,
    ArrowDownWideNarrow,
    ArrowUpWideNarrow
} from "lucide-react";
import { toast } from "sonner";
import { AIInsights } from "@/components/todo/AIInsights";

export const Dashboard = () => {
    const [user, setUser] = useState<any>(null);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterPriority, setFilterPriority] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Dialog states
    const [isTodoFormOpen, setIsTodoFormOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

    const supabase = createClient();

    // 통계 계산
    const stats = {
        total: todos.length,
        completed: todos.filter(t => t.status === "done").length,
        urgent: todos.filter(t => t.priority === "urgent" && t.status !== "done").length,
    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, [supabase]);

    const fetchTodos = useCallback(async () => {
        if (!user) return;
        setIsDataLoading(true);
        try {
            let query = supabase
                .from("todos")
                .select("*")
                .eq("user_id", user.id);

            if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);

            // 상태 필터처리 (복합 필터 포함)
            if (filterStatus !== "all") {
                if (filterStatus === "todo+in_progress") {
                    query = query.in("status", ["todo", "in_progress"]);
                } else {
                    query = query.eq("status", filterStatus);
                }
            }

            if (filterPriority !== "all") query = query.eq("priority", filterPriority);

            const isAsc = sortOrder === "asc";
            switch (sortBy) {
                case "due_date": query = query.order("due_date", { ascending: isAsc, nullsFirst: false }); break;
                case "priority": query = query.order("priority", { ascending: isAsc }); break;
                case "title": query = query.order("title", { ascending: isAsc }); break;
                default: query = query.order("created_at", { ascending: isAsc });
            }

            const { data, error } = await query;
            if (error) throw error;
            setTodos(data || []);
        } catch (error: any) {
            toast.error("데이터 동기화 오류: " + error.message);
        } finally {
            setIsDataLoading(false);
        }
    }, [supabase, user, searchQuery, filterStatus, filterPriority, sortBy, sortOrder]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos, user]);

    const handleTodoSubmit = async (values: any) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            // 빈 문자열 필드를 null로 변환하여 DB 제약 조건 충돌 방지
            const sanitizedValues = Object.fromEntries(
                Object.entries(values).map(([key, value]) => [key, value === "" ? null : value])
            );

            const todoData = {
                ...sanitizedValues,
                user_id: user.id,
                is_completed: sanitizedValues.status === "done"
            };

            if (editingTodo) {
                const { error } = await supabase.from("todos").update(todoData).eq("id", editingTodo.id);
                if (error) throw error;
                toast.success("업무가 수정되었습니다.");
            } else {
                const { error } = await supabase.from("todos").insert([todoData]);
                if (error) throw error;
                toast.success("새 업무가 등록되었습니다.");
            }
            setIsTodoFormOpen(false);
            setEditingTodo(null);
            fetchTodos();
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error("업무 저장 중 오류 발생: " + (error.message || "알 수 없는 오류"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTodoDelete = async () => {
        if (!todoToDelete) return;
        try {
            const { error } = await supabase.from("todos").delete().eq("id", todoToDelete);
            if (error) throw error;
            toast.success("업무가 삭제되었습니다.");
            setTodos(prev => prev.filter(t => t.id !== todoToDelete));
        } catch (error: any) {
            toast.error("삭제 실패: " + error.message);
        } finally {
            setTodoToDelete(null);
        }
    };

    const handleToggleStatus = async (id: string, isCompleted: boolean) => {
        try {
            const status: TodoStatus = isCompleted ? "done" : "todo";
            const { error } = await supabase.from("todos").update({ is_completed: isCompleted, status }).eq("id", id);
            if (error) throw error;
            setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: isCompleted, status } : t));
        } catch (error: any) {
            toast.error("상태 업데이트 실패: " + error.message);
        }
    };

    const handlePriorityChange = async (id: string, priority: Priority) => {
        try {
            const { error } = await supabase.from("todos").update({ priority }).eq("id", id);
            if (error) throw error;
            setTodos(prev => prev.map(t => t.id === id ? { ...t, priority } : t));
            toast.success("우선순위가 업데이트되었습니다.");
        } catch (error: any) {
            toast.error("우선순위 업데이트 실패: " + error.message);
        }
    };

    if (!user && !isDataLoading) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm font-bold tracking-widest uppercase text-primary/80">Intelligent Dashboard</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl">
                        AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">TODO</span>
                    </h1>
                </div>
                <Button
                    size="lg"
                    className="h-14 px-10 text-lg font-black bg-gradient-to-br from-accent to-accent/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all hover:scale-105 active:scale-95 rounded-2xl group border-none"
                    onClick={() => { setEditingTodo(null); setIsTodoFormOpen(true); }}
                >
                    <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                    NEW TASK
                </Button>
            </div>

            {/* AI Insights Section */}
            <AIInsights todos={todos} todoCount={stats.total} completedCount={stats.completed} urgentCount={stats.urgent} />

            {/* Productivity Toolbar */}
            <div className="sticky top-20 z-40 flex flex-col lg:flex-row gap-4 bg-background/60 dark:bg-zinc-950/40 p-5 rounded-[2.5rem] border-2 border-accent/20 dark:border-white/10 shadow-3xl backdrop-blur-3xl transition-all">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                    <Input placeholder="Search tasks, projects, insights..." className="pl-14 h-12 bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/40 transition-all font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-3">
                    <div className="hidden sm:flex gap-3">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-12 w-[160px] bg-secondary/50 dark:bg-zinc-900/40 border-accent/10 rounded-2xl text-xs font-bold uppercase tracking-wider"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/50 dark:border-white/5 bg-background dark:bg-zinc-950 backdrop-blur-2xl">
                                <SelectItem value="all">전체 (ALL)</SelectItem>
                                <SelectItem value="todo">계획 (TODO)</SelectItem>
                                <SelectItem value="in_progress">진행중 (IN PROGRESS)</SelectItem>
                                <SelectItem value="todo+in_progress">계획+진행중</SelectItem>
                                <SelectItem value="done">완료 (DONE)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger className="h-12 w-[140px] bg-secondary/50 dark:bg-zinc-900/40 border-accent/10 rounded-2xl text-xs font-bold uppercase tracking-wider"><SelectValue placeholder="Priority" /></SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/50 dark:border-white/5 bg-background dark:bg-zinc-950 backdrop-blur-2xl">
                                <SelectItem value="all">ALL PRIORITY</SelectItem>
                                <SelectItem value="low">LOW</SelectItem>
                                <SelectItem value="medium">MEDIUM</SelectItem>
                                <SelectItem value="high">HIGH</SelectItem>
                                <SelectItem value="urgent">URGENT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 bg-accent/10 p-1.5 px-3 rounded-2xl border border-accent/20 col-span-2 sm:col-auto">
                        <span className="text-[10px] font-black text-accent whitespace-nowrap hidden md:inline ml-1 uppercase">Sort By:</span>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-9 w-full sm:w-[130px] bg-transparent border-none focus:ring-0 shadow-none text-xs font-black p-0 px-2 uppercase tracking-tight">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/50 dark:border-white/5 bg-background dark:bg-zinc-950 backdrop-blur-2xl">
                                <SelectItem value="created_at">LATEST</SelectItem>
                                <SelectItem value="due_date">DEADLINE</SelectItem>
                                <SelectItem value="priority">PRIORITY</SelectItem>
                                <SelectItem value="title">NAME</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")} className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary transition-all border border-zinc-200/50 dark:border-zinc-700/50 ml-1">
                            {sortOrder === "asc" ? <ArrowUpWideNarrow className="h-4 w-4" /> : <ArrowDownWideNarrow className="h-4 w-4" />}
                        </Button>
                    </div>

                    {(filterStatus !== "all" || filterPriority !== "all" || searchQuery !== "" || sortBy !== "created_at" || sortOrder !== "desc") && (
                        <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(""); setFilterStatus("all"); setFilterPriority("all"); setSortBy("created_at"); setSortOrder("desc"); }} className="h-12 w-12 text-muted-foreground hover:text-primary transition-all rounded-full hover:bg-primary/10"><FilterX className="h-6 w-6" /></Button>
                    )}
                </div>
            </div>

            {/* Main List Area */}
            <div className="pb-20">
                <TodoList todos={todos} isLoading={isDataLoading} onToggle={handleToggleStatus} onPriorityChange={handlePriorityChange} onEdit={(todo) => { setEditingTodo(todo); setIsTodoFormOpen(true); }} onDelete={setTodoToDelete} />
            </div>

            {/* Dialogs */}
            <Dialog open={isTodoFormOpen} onOpenChange={setIsTodoFormOpen}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl shadow-2xl">
                    <div className="p-8">
                        <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent"><Plus className="h-6 w-6" /></div>{editingTodo ? "EDIT TASK" : "DEFINE NEW TASK"}</DialogTitle></DialogHeader>
                        <TodoForm initialData={editingTodo || undefined} onSubmit={handleTodoSubmit} isLoading={isSubmitting} />
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog open={!!todoToDelete} onOpenChange={(open) => !open && setTodoToDelete(null)}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없으며, 선택한 할 일이 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={handleTodoDelete} className="bg-red-500 hover:bg-red-600">삭제</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
