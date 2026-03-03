// 할 일 관리 대시보드 컴포넌트입니다. 업무 필터링, 검색, 상태 관리 및 AI 인사이트와의 상호작용을 담당합니다.
"use client";

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
            <div className="sticky top-20 z-40 flex flex-col lg:flex-row gap-6 bg-zinc-900/40 dark:bg-black/40 p-6 sm:p-8 rounded-[3.5rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-3xl ring-1 ring-inset ring-white/[0.05] hover:border-accent/40 transition-all">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="h-6 w-6 text-accent group-focus-within:text-white transition-colors" />
                    </div>
                    <Input
                        placeholder="SEARCH TASKS, PROJECTS, INSIGHTS..."
                        className="pl-16 h-16 bg-black/30 border-white/10 dark:border-white/20 rounded-[2.25rem] focus-visible:ring-accent/40 focus-visible:border-accent text-lg placeholder:text-zinc-600 font-black tracking-tighter transition-all hover:bg-black/50 hover:border-accent/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-16 px-8 bg-black/30 dark:bg-zinc-950/40 border-white/20 rounded-[2.25rem] text-[11px] font-black uppercase tracking-[0.2em] min-w-[180px] hover:bg-black/50 hover:border-accent transition-all focus:ring-accent/40">
                                <SelectValue placeholder="STATUS" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[2rem] border-white/10 bg-zinc-950/90 backdrop-blur-3xl shadow-3xl p-2 min-w-[220px]">
                                {[
                                    { value: "all", label: "전체(ALL)" },
                                    { value: "todo", label: "계획(TODO)" },
                                    { value: "in_progress", label: "진행중(IN PROGRESS)" },
                                    { value: "todo+in_progress", label: "계획+진행중" },
                                    { value: "done", label: "완료(DONE)" }
                                ].map((s) => (
                                    <SelectItem key={s.value} value={s.value} className="rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest focus:bg-accent focus:text-white transition-all mb-1 last:mb-0">
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger className="h-16 px-8 bg-black/20 dark:bg-zinc-950/40 border-white/5 rounded-[2.25rem] text-[11px] font-black uppercase tracking-[0.2em] min-w-[160px] hover:bg-black/40 transition-all focus:ring-accent/40">
                                <SelectValue placeholder="PRIORITY" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[2rem] border-white/10 bg-zinc-950/90 backdrop-blur-3xl shadow-3xl p-2 min-w-[180px]">
                                {["all", "low", "medium", "high", "urgent"].map((p) => (
                                    <SelectItem key={p} value={p} className="rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest focus:bg-accent focus:text-white transition-all mb-1 last:mb-0">
                                        {p === "all" ? "ALL PRIORITY" : p.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-16 flex items-center gap-2 bg-black/20 p-2 rounded-[2.25rem] border border-white/5">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-full px-6 bg-transparent border-none focus:ring-0 shadow-none text-[10px] font-black uppercase tracking-[0.3em] min-w-[130px]">
                                <SelectValue placeholder="SORT" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[2rem] border-white/10 bg-zinc-950/90 backdrop-blur-3xl shadow-3xl p-2">
                                {[
                                    { value: "created_at", label: "LATEST" },
                                    { value: "due_date", label: "DEADLINE" },
                                    { value: "priority", label: "PRIORITY" },
                                    { value: "title", label: "NAME" }
                                ].map((s) => (
                                    <SelectItem key={s.value} value={s.value} className="rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest focus:bg-accent focus:text-white transition-all mb-1 last:mb-0">
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-accent hover:text-white transition-all shadow-lg"
                        >
                            {sortOrder === "asc" ? <ArrowUpWideNarrow className="h-5 w-5" /> : <ArrowDownWideNarrow className="h-5 w-5" />}
                        </Button>
                    </div>

                    {(filterStatus !== "all" || filterPriority !== "all" || searchQuery !== "" || sortBy !== "created_at" || sortOrder !== "desc") && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSearchQuery(""); setFilterStatus("all"); setFilterPriority("all"); setSortBy("created_at"); setSortOrder("desc"); }}
                            className="h-16 w-16 text-zinc-500 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-400/10 transition-all rounded-[2.25rem] border border-white/5"
                        >
                            <FilterX className="h-7 w-7" />
                        </Button>
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
                        <TodoForm key={editingTodo?.id || "new"} initialData={editingTodo || undefined} onSubmit={handleTodoSubmit} isLoading={isSubmitting} />
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog open={!!todoToDelete} onOpenChange={(open) => !open && setTodoToDelete(null)}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없으며, 선택한 할 일이 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={handleTodoDelete} className="bg-red-500 hover:bg-red-600">삭제</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
