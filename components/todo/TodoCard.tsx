// 개별 할 일을 고품질 디자인의 카드 형태로 표시하며, 우선순위 조절 및 상태 토글 기능을 상호작용 가능한 형태로 제공합니다.
"use client";

import { Todo, Priority } from "@/lib/types/todo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, User, Tag, Trash2, ChevronDown, Edit2, Zap, Clock, CheckCircle2 } from "lucide-react";
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
 * TodoCard: Luxury Task Object Design
 * Features: Gradient Borders, Glassmorphism, Micro-interactions, Dynamic Priority Scaling
 */
export const TodoCard = ({ todo, onToggle, onClick, onDelete, onPriorityChange }: TodoCardProps) => {
    const priorityLabels: Record<Priority, string> = {
        low: "LOW",
        medium: "MEDIUM",
        high: "HIGH",
        urgent: "URGENT",
    };

    const getPriorityColor = (p: Priority) => {
        switch (p) {
            case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/20';
            case 'medium': return 'text-accent bg-accent/10 border-accent/20 shadow-accent/20';
            case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/20';
            default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const getStatusGlow = (status?: string) => {
        if (todo.is_completed) return "bg-zinc-800 shadow-none opacity-20";
        switch (status) {
            case "done": return "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]";
            case "in_progress": return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]";
            default: return "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]";
        }
    };

    return (
        <Card
            className={cn(
                "group relative cursor-pointer transition-all duration-700 overflow-hidden border border-white/25 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-[2.5rem] hover:scale-[1.02] hover:bg-zinc-900/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:border-accent hover:shadow-[0_30px_60px_-12px_rgba(168,85,247,0.3)] ring-1 ring-inset ring-white/[0.05] hover:ring-accent/60 animate-in fade-in slide-in-from-bottom-3 duration-500",
                todo.is_completed && "opacity-60 grayscale-[0.2] hover:grayscale-0 transition-all"
            )}
            onClick={() => onClick?.(todo)}
        >
            {/* Status Glow Indicator */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 group-hover:w-2",
                getStatusGlow(todo.status)
            )} />

            <CardContent className="p-8 pl-10">
                <div className="flex flex-col gap-6">
                    {/* Top Row: Title & Priority */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                {todo.is_completed && <div className="p-1 rounded-full bg-accent/20 text-accent"><CheckCircle2 className="h-3 w-3" /></div>}
                                <h3 className={cn(
                                    "text-2xl font-black leading-tight tracking-tight text-foreground dark:text-zinc-100 transition-all duration-500 italic",
                                    todo.is_completed ? "line-through opacity-40" : "group-hover:text-accent group-hover:translate-x-1"
                                )}>
                                    {todo.title}
                                </h3>
                            </div>
                            {todo.description && (
                                <p className="text-[13px] text-muted-foreground/60 line-clamp-2 leading-relaxed font-bold italic tracking-tight group-hover:text-muted-foreground transition-colors">
                                    {todo.description}
                                </p>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Badge
                                    variant="outline"
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                        "text-[10px] font-black px-4 py-1.5 rounded-xl cursor-pointer transition-all uppercase tracking-widest border-2 shadow-lg",
                                        getPriorityColor(todo.priority)
                                    )}
                                >
                                    {priorityLabels[todo.priority]}
                                    <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-[2rem] border-white/5 bg-zinc-950/90 backdrop-blur-3xl p-3 shadow-3xl min-w-[160px] animate-in slide-in-from-top-2 duration-300">
                                {(Object.keys(priorityLabels) as Priority[]).map((p) => (
                                    <DropdownMenuItem
                                        key={p}
                                        onSelect={() => onPriorityChange?.(todo.id, p)}
                                        className="text-[10px] font-black py-4 px-5 focus:bg-accent/20 focus:text-accent rounded-2xl transition-all cursor-pointer uppercase tracking-[0.2em] mb-1 last:mb-0 group/item"
                                    >
                                        <div className={cn("w-2.5 h-2.5 rounded-full mr-4 group-hover/item:scale-150 transition-transform",
                                            p === 'urgent' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                                                p === 'high' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' :
                                                    p === 'medium' ? 'bg-accent shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                                        )} />
                                        {priorityLabels[p]}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Meta Row: Checkbox, Date, Category */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative group/check">
                                <div className="absolute inset-0 bg-accent/20 rounded-full blur opacity-0 group-hover/check:opacity-100 transition-opacity" />
                                <Checkbox
                                    checked={todo.is_completed}
                                    onCheckedChange={(checked) => onToggle?.(todo.id, !!checked)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 rounded-full border-2 border-zinc-700/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent transition-all relative z-10 shadow-inner group-hover/check:scale-110"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {todo.due_date && (
                                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-300 hover:bg-white/[0.08] transition-all">
                                        <Calendar className="h-4 w-4 text-accent" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">{format(new Date(todo.due_date), "MMM d", { locale: ko })}</span>
                                        {todo.due_time && (
                                            <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-white/10">
                                                <Clock className="h-3 w-3 text-accent/60" />
                                                <span className="text-[11px] font-black text-accent italic">{todo.due_time}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {todo.category && (
                                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-accent/5 border border-accent/10 text-accent group-hover:bg-accent/10 transition-all">
                                        <Tag className="h-4 w-4" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">{todo.category}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons (Visible on Hover) */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-[1.25rem] bg-zinc-900/50 border border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all hover:scale-110 active:scale-90"
                                onClick={(e) => { e.stopPropagation(); onClick?.(todo); }}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-[1.25rem] bg-zinc-900/50 border border-white/5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all hover:scale-110 active:scale-90"
                                onClick={(e) => { e.stopPropagation(); onDelete?.(todo.id); }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* Glossy Overlay Highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
        </Card>
    );
};
