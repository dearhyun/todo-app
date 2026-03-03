import { Todo, Priority } from "@/lib/types/todo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, User, Tag, Trash2, ChevronDown, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TodoCardProps {
    todo: Todo;
    onToggle?: (id: string, isCompleted: boolean) => void;
    onClick?: (todo: Todo) => void;
    onDelete?: (id: string) => void;
    onPriorityChange?: (id: string, priority: Priority) => void;
}

/**
 * 개별 할 일 아이템을 카드 형태로 렌더링하며, 지능형 인디고 테마의 목업 디자인을 따릅니다.
 */
export const TodoCard = ({ todo, onToggle, onClick, onDelete, onPriorityChange }: TodoCardProps) => {
    const priorityLabels: Record<Priority, string> = {
        low: "LOW",
        medium: "MEDIUM",
        high: "HIGH",
        urgent: "URGENT",
    };

    return (
        <Card
            className={cn(
                "group relative cursor-pointer transition-all duration-500 overflow-hidden border-2 border-border/40 dark:border-accent/20 bg-card/80 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-[2.5rem] hover:border-accent hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:scale-[1.01]",
                todo.is_completed && "opacity-60 grayscale-[0.3]"
            )}
            onClick={() => onClick?.(todo)}
        >
            {/* Minimal Status Indicator Dot */}
            <div className={cn(
                "absolute left-6 top-8 w-4 h-4 rounded-full border-2 border-white/10 shadow-lg",
                todo.status === "done" ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" :
                    todo.status === "in_progress" ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" : "bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]"
            )} />

            <CardContent className="p-7 pl-12">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className={cn(
                                "text-xl font-black leading-tight tracking-tight text-foreground transition-colors",
                                todo.is_completed ? "line-through opacity-40" : "group-hover:text-accent"
                            )}>
                                {todo.title}
                            </h3>

                            {/* Priority Selector */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Badge
                                        variant="outline"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-[10px] font-black px-3 py-1 rounded-xl cursor-pointer bg-accent/5 text-accent border-accent/20 hover:bg-accent/10 transition-all uppercase tracking-widest"
                                    >
                                        {priorityLabels[todo.priority]}
                                        <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                                    </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-[1.5rem] border-border/50 dark:border-white/5 bg-background dark:bg-zinc-950 backdrop-blur-3xl p-2 shadow-3xl text-foreground min-w-[140px]">
                                    {(Object.keys(priorityLabels) as Priority[]).map((p) => (
                                        <DropdownMenuItem
                                            key={p}
                                            onSelect={() => onPriorityChange?.(todo.id, p)}
                                            className="text-[10px] font-black py-3 px-4 focus:bg-accent/20 focus:text-accent rounded-xl transition-colors cursor-pointer uppercase tracking-widest mb-1 last:mb-0"
                                        >
                                            <div className={cn("w-2 h-2 rounded-full mr-3",
                                                p === 'urgent' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                    p === 'high' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
                                                        p === 'medium' ? 'bg-accent shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                            )} />
                                            {priorityLabels[p]}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {todo.description && (
                            <p className="text-sm text-muted-foreground/60 line-clamp-2 leading-relaxed font-medium">
                                {todo.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-5 pt-3">
                            <Checkbox
                                checked={todo.is_completed}
                                onCheckedChange={(checked) => onToggle?.(todo.id, !!checked)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-6 w-6 rounded-full border-2 border-border dark:border-white/10 data-[state=checked]:bg-accent data-[state=checked]:border-accent transition-all"
                            />

                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em]">
                                {todo.due_date && (
                                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border/50 text-foreground/80">
                                        <Calendar className="h-3.5 w-3.5 text-accent/60" />
                                        {format(new Date(todo.due_date), "MMM d", { locale: ko })}
                                        {todo.due_time && (
                                            <span className="ml-1 text-accent font-black">{todo.due_time}</span>
                                        )}
                                    </div>
                                )}
                                {todo.category && (
                                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-accent/5 border border-accent/10 text-accent/80">
                                        <Tag className="h-3.5 w-3.5" />
                                        {todo.category}
                                    </div>
                                )}
                                {todo.assignee && (
                                    <div className="flex items-center gap-2.5 ml-2">
                                        <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center border border-border/50 shadow-inner overflow-hidden">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <span className="text-muted-foreground">{todo.assignee}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground/30 hover:text-white hover:bg-accent/40 rounded-2xl transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.(todo);
                        }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground/30 hover:text-white hover:bg-red-500/40 rounded-2xl transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(todo.id);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
