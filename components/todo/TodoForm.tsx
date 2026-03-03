import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Todo, Priority, TodoStatus } from "@/lib/types/todo";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

const todoSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요."),
    description: z.string().optional(),
    due_date: z.string().optional(),
    due_time: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    category: z.string().optional(),
    status: z.enum(["todo", "in_progress", "done"]),
    assignee: z.string().optional(),
});

type TodoFormValues = z.infer<typeof todoSchema>;

interface TodoFormProps {
    initialData?: Todo;
    onSubmit: (values: TodoFormValues) => Promise<void>;
    isLoading?: boolean;
}

/**
 * 할 일의 정보를 입력받는 폼을 제공합니다.
 * AI를 사용하여 자연어 문장으로부터 필드를 자동 추출하는 기능을 내장하고 있습니다.
 */
export const TodoForm = ({ initialData, onSubmit, isLoading }: TodoFormProps) => {
    const [aiInput, setAiInput] = useState("");
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    const form = useForm<TodoFormValues>({
        resolver: zodResolver(todoSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            due_date: initialData?.due_date || "",
            due_time: initialData?.due_time || "09:00",
            priority: initialData?.priority || "medium",
            category: initialData?.category || "",
            status: initialData?.status || "todo",
            assignee: initialData?.assignee || "",
        },
    });

    /**
     * AI를 호출하여 입력 문자열을 구조화된 데이터로 파싱하고 폼 값을 업데이트합니다.
     */
    const handleAiParse = async () => {
        if (!aiInput.trim()) {
            toast.error("AI에게 입력할 내용을 적어주세요.");
            return;
        }

        setIsAiProcessing(true);
        try {
            const response = await fetch("/api/todo/parse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: aiInput }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "할 일을 분석하는 중 오류가 발생했습니다.");
            }

            const data = await response.json();

            // AI가 추출한 필드로 폼 업데이트
            form.setValue("title", data.title);
            if (data.due_date) form.setValue("due_date", data.due_date);
            if (data.due_time) form.setValue("due_time", data.due_time);
            if (data.priority) form.setValue("priority", data.priority);
            if (data.category) form.setValue("category", data.category);

            toast.success("AI가 할 일을 똑똑하게 분석했습니다!");
            setAiInput(""); // 초기화
        } catch (error: any) {
            console.error("AI 파싱 실패:", error);
            toast.error(error.message);
        } finally {
            setIsAiProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* AI Quick Add Header Area */}
            {!initialData && (
                <div className="bg-gradient-to-br from-accent/10 to-primary/5 p-6 rounded-3xl border border-accent/20 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                        <h3 className="text-sm font-black text-accent uppercase tracking-widest">AI Quick Insight</h3>
                    </div>
                    <div className="relative group">
                        <Input
                            placeholder="예: 내일 오후 3시까지 팀 회의 준비하기"
                            className="bg-white/50 dark:bg-zinc-900/50 border-accent/20 h-12 pr-14 rounded-2xl focus-visible:ring-accent/30 transition-all font-medium"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAiParse();
                                }
                            }}
                            disabled={isAiProcessing || isLoading}
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 h-10 w-10 text-accent hover:text-accent/80 hover:bg-accent/10 rounded-xl disabled:opacity-50"
                            onClick={handleAiParse}
                            disabled={isAiProcessing || !aiInput.trim() || isLoading}
                        >
                            {isAiProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                    </div>
                    <p className="mt-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter ml-1">
                        말하듯이 자연스럽게 입력하면 AI가 내용을 골라냅니다.
                    </p>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">제목</FormLabel>
                                <FormControl>
                                    <Input placeholder="할 일을 입력하세요" {...field} disabled={isLoading} className="h-12 border-zinc-200/60 dark:border-zinc-800/60 rounded-xl" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">설명</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="상세 내용을 입력하세요" {...field} disabled={isLoading} className="min-h-[100px] border-zinc-200/60 dark:border-zinc-800/60 rounded-xl resize-none" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">우선순위</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 border-zinc-200/60 dark:border-zinc-800/60 rounded-xl">
                                                <SelectValue placeholder="선택" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-2xl border-border/50 bg-background/80 backdrop-blur-3xl">
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">상태</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 border-zinc-200/60 dark:border-zinc-800/60 rounded-xl">
                                                <SelectValue placeholder="선택" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-2xl border-border/50 bg-background/80 backdrop-blur-3xl">
                                            <SelectItem value="todo">To-Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="done">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="due_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">마감일</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} disabled={isLoading} className="h-12 border-zinc-200/60 dark:border-zinc-800/60 rounded-xl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="due_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">시간</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} disabled={isLoading} className="h-12 border-zinc-200/60 dark:border-zinc-800/60 rounded-xl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">카테고리</FormLabel>
                                    <FormControl>
                                        <Input placeholder="예: 업무, 가사" {...field} disabled={isLoading} className="h-12 border-zinc-200/60 dark:border-zinc-800/60 rounded-xl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="assignee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">담당자</FormLabel>
                                    <FormControl>
                                        <Input placeholder="담당자 이름" {...field} disabled={isLoading} className="h-12 border-zinc-200/60 dark:border-zinc-800/60 rounded-xl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 text-lg font-black bg-gradient-to-r from-accent to-accent/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all hover:scale-[1.02] active:scale-95 rounded-2xl border-none mt-6"
                        disabled={isLoading || isAiProcessing}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                PROCESSING...
                            </>
                        ) : (
                            initialData ? "UPDATE TASK" : "CREATE TASK"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
};
