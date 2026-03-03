import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Sparkles,
    BrainCircuit,
    TrendingUp,
    AlertCircle,
    Lightbulb,
    CheckCircle2,
    Loader2,
    CalendarDays,
    Clock,
    Zap,
    Target,
    ArrowRight,
    Search,
    RefreshCw,
    Rocket,
    Trophy,
    PartyPopper,
    Flame,
    Crown,
    Star
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Todo } from "@/lib/types/todo";
import { cn } from "@/lib/utils";

interface AIInsightsProps {
    todos: Todo[];
    todoCount: number;
    completedCount: number;
    urgentCount: number;
}

interface SummaryData {
    summary: string;
    urgentTasks: string[];
    insights: string[];
    recommandation: string[];
    remainingTasks?: { title: string; priority: string }[];
    nextWeekPlans?: string[];
    trendData?: any[];
}

/**
 * AIInsights Component: Ultra-Premium AI Dashboard
 */
export const AIInsights = ({ todos, todoCount, completedCount, urgentCount }: AIInsightsProps) => {
    const [period, setPeriod] = useState<"today" | "week">("today");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

    const defaultChartData = [
        { name: "Mon", completed: 4 },
        { name: "Tue", completed: 7 },
        { name: "Wed", completed: 5 },
        { name: "Thu", completed: 9 },
        { name: "Fri", completed: 8 },
        { name: "Sat", completed: 12 },
        { name: "Sun", completed: 10 },
    ];

    const handleAnalyze = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const dateStr = new Date().toISOString().split("T")[0];
            const filteredTodos = period === "today"
                ? todos.filter(t => t.due_date === dateStr)
                : todos;

            const response = await fetch("/api/todo/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ period, todos: filteredTodos }),
            });

            if (!response.ok) throw new Error("AI 엔진 연결 실패");

            const data = await response.json();
            setSummaryData(data);
            toast.success("AI 브리핑이 업데이트되었습니다.");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        handleAnalyze();
    }, [period]);

    const completionRate = todoCount > 0 ? Math.round((completedCount / todoCount) * 100) : 0;

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-4">
                <div className="flex items-center gap-6 group">
                    <div className="relative h-16 w-16 flex items-center justify-center">
                        <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-hover:bg-accent/40 transition-all duration-700" />
                        <div className="relative h-14 w-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <BrainCircuit className="h-8 w-8 text-accent animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-foreground dark:text-white uppercase italic">
                            AI <span className="text-accent">SYNERGY</span> DASHBOARD
                        </h2>
                        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.6em] opacity-40">Next-Gen Intelligence Layer v3.1</p>
                    </div>
                </div>

                <div className="p-1.5 rounded-2xl bg-zinc-900/50 dark:bg-zinc-800/10 backdrop-blur-3xl border border-white/20 shadow-2xl hover:border-accent/50 transition-colors">
                    <Tabs value={period} onValueChange={(v) => { setPeriod(v as any); setSummaryData(null); }} className="w-full">
                        <TabsList className="bg-transparent h-12 gap-2">
                            <TabsTrigger value="today" className="rounded-xl px-8 h-full data-[state=active]:bg-accent data-[state=active]:text-white font-black text-[11px] uppercase tracking-widest shadow-xl transition-all">Today</TabsTrigger>
                            <TabsTrigger value="week" className="rounded-xl px-8 h-full data-[state=active]:bg-accent data-[state=active]:text-white font-black text-[11px] uppercase tracking-widest shadow-xl transition-all">This Week</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-stretch">

                {/* 1. Main Insight Engine (3 Grid Columns) */}
                <Card className="lg:col-span-3 min-h-[650px] border-none bg-zinc-900/10 dark:bg-zinc-950/20 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] rounded-[4rem] overflow-hidden flex flex-col group/main ring-1 ring-white/20 hover:ring-accent/60 hover:shadow-[0_40px_100px_-20px_rgba(168,85,247,0.2)] transition-all duration-700 relative">
                    <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none group-hover/main:bg-accent/10 transition-all duration-1000" />

                    <CardHeader className="p-12 border-b border-white/20 bg-gradient-to-r from-accent/5 via-transparent to-transparent relative z-10">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <CardTitle className="text-3xl font-black flex items-center gap-4 text-white uppercase italic">
                                    <Sparkles className="h-7 w-7 text-accent" />
                                    {period === "today" ? "Strategic Morning Brief" : "Evolutionary Weekly Audit"}
                                </CardTitle>
                                <div className="flex flex-wrap gap-5">
                                    {[
                                        { icon: CalendarDays, label: `${todoCount} Units`, color: "bg-white/5 text-zinc-400" },
                                        { icon: AlertCircle, label: `${urgentCount} Urgent`, color: "bg-red-500/10 text-red-400" },
                                        { icon: Target, label: `${completionRate}% Velocity`, color: "bg-emerald-500/10 text-emerald-400" }
                                    ].map((stat, idx) => (
                                        <div key={idx} className={cn("flex items-center gap-3 px-5 py-2.5 rounded-full ring-1 ring-white/20 shadow-inner hover:ring-accent transition-all", stat.color)}>
                                            <stat.icon className="h-4 w-4" />
                                            <span className="text-[11px] font-black uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                size="lg"
                                className="h-16 px-10 rounded-2xl bg-accent hover:bg-accent/80 text-white font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(168,85,247,0.5)] transition-all hover:translate-y-[-2px] hover:shadow-accent/60 active:translate-y-0 border-none group/btn"
                            >
                                {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <RefreshCw className="h-5 w-5 mr-3 group-hover/btn:rotate-180 transition-transform duration-500" />}
                                ANALYZE DATA
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-12 flex-1 flex flex-col relative z-10">
                        {isAnalyzing ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-10 animate-in zoom-in-95 duration-500">
                                <Search className="h-24 w-24 text-accent/10 animate-bounce" />
                                <div className="text-center space-y-4">
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Initializing Intelligence Vector...</h3>
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] opacity-60">Synthesizing personalized productivity metrics</p>
                                </div>
                            </div>
                        ) : summaryData ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 flex-1 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                                {/* Left Section: AI Analysis & Insights */}
                                <div className="space-y-10 flex flex-col h-full">
                                    <div className="relative group/exec">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/30 to-transparent rounded-[2.5rem] opacity-20 group-hover/exec:opacity-100 transition duration-700" />
                                        <div className="relative p-10 rounded-[2.5rem] bg-zinc-950/60 border border-white/20 shadow-2xl flex flex-col gap-5 hover:bg-zinc-900/60 hover:border-accent transition-all h-full">
                                            <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.4em] flex items-center gap-3">
                                                <Zap className="h-4 w-4 fill-accent" /> EXECUTIVE COMMAND
                                            </h4>
                                            <p className="text-xl font-bold text-white leading-relaxed tracking-tight italic">
                                                "{summaryData.summary}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-10 rounded-[2.5rem] bg-white/[0.04] dark:bg-black/20 border border-white/20 flex flex-col h-full hover:bg-black/40 hover:border-accent transition-all">
                                        <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.4em] mb-8">💡 REVELATORY INSIGHTS</h4>
                                        <div className="space-y-6">
                                            {summaryData.insights.map((insight, i) => (
                                                <div key={i} className="flex gap-6 group/item cursor-default">
                                                    <div className="h-7 w-7 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-accent group-hover/item:rotate-12 transition-all duration-300 shadow-lg">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-accent group-hover/item:bg-white" />
                                                    </div>
                                                    <p className="text-[15px] font-bold text-zinc-400 group-hover/item:text-zinc-100 transition-colors leading-relaxed">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Stats & Focus Items (ALIGNED HEIGHT) */}
                                <div className="space-y-10 flex flex-col h-full">
                                    <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-accent/15 via-accent/5 to-transparent border border-accent/20 hover:border-accent/50 transition-all duration-700 shadow-2xl group/stat relative overflow-hidden h-full min-h-[220px]">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stat:opacity-20 transition-all duration-700"><Target className="h-20 w-20 text-accent" /></div>
                                        <div className="flex justify-between items-start mb-8 relative z-10">
                                            <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.4em]">{period === "today" ? "VELOCITY PERFORMANCE" : "ACCUMULATED REVENUE"}</h4>
                                            <div className="h-10 w-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent group-hover/stat:scale-110 group-hover/stat:rotate-12 transition-all"><TrendingUp className="h-5 w-5" /></div>
                                        </div>
                                        <div className="flex items-end gap-5 mb-6 relative z-10">
                                            <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{completionRate}<span className="text-2xl not-italic ml-2 opacity-30">%</span></span>
                                            <div className="flex flex-col mb-1">
                                                <span className="text-[11px] font-black text-white uppercase tracking-widest">{completedCount} Completed</span>
                                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Out of {todoCount} Tasks</span>
                                            </div>
                                        </div>
                                        <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 shadow-inner p-0.5 relative z-10">
                                            <div className="h-full bg-accent rounded-full relative transition-all duration-1500 ease-in-out shadow-[0_0_20px_rgba(168,85,247,0.8)]" style={{ width: `${completionRate}%` }}>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 rounded-[2.5rem] bg-white/[0.04] dark:bg-black/20 border border-white/20 flex flex-col h-full hover:bg-black/40 hover:border-accent transition-all h-full">
                                        <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.4em] mb-8">
                                            {period === "today" ? "MISSION CRITICAL FOCUS" : "FUTURE PHASE PLANNING"}
                                        </h4>
                                        <div className="space-y-4">
                                            {(period === "today" ? summaryData.remainingTasks : summaryData.nextWeekPlans)?.map((item: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-950/40 border border-white/20 group hover:bg-accent/10 hover:border-accent hover:translate-x-2 transition-all cursor-default">
                                                    <div className="flex items-center gap-5">
                                                        <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_12px]", typeof item === 'string' ? "bg-accent shadow-accent/60" : (item.priority === 'urgent' ? 'bg-red-500 shadow-red-500/60' : 'bg-accent shadow-accent/60'))} />
                                                        <span className="text-[14px] font-black text-zinc-100 group-hover:text-white transition-colors">
                                                            {typeof item === 'string' ? item : item.title}
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-zinc-800 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Global Row: Recommended Actions (Perfectly Aligned Bottom) */}
                                <div className="xl:col-span-2 pt-10 border-t border-white/5 mt-auto">
                                    <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.5em] text-center mb-10 italic">STRATEGIC REALIGNMENT PROTOCOLS</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {summaryData.recommandation.map((rec, i) => {
                                            const Icons = [Rocket, Target, Flame, Crown, Star, PartyPopper];
                                            const Icon = Icons[i % Icons.length];
                                            return (
                                                <div key={i} className="p-8 rounded-[3rem] bg-zinc-950/40 border border-white/20 hover:border-accent hover:bg-zinc-900/40 hover:translate-y-[-8px] hover:shadow-[0_30px_60px_-15px_rgba(168,85,247,0.3)] transition-all duration-700 h-full flex flex-col gap-6 group/rec cursor-default">
                                                    <div className="h-14 w-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg group-hover/rec:bg-white group-hover/rec:text-accent group-hover/rec:scale-110 group-hover/rec:rotate-12 transition-all">
                                                        <Icon className="h-7 w-7" />
                                                    </div>
                                                    <p className="text-[16px] font-black text-white leading-tight tracking-tight italic">"{rec}"</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[480px] flex flex-col items-center justify-center py-20 text-center space-y-12 opacity-30 group cursor-pointer" onClick={handleAnalyze}>
                                <div className="relative h-40 w-40">
                                    <div className="absolute inset-0 bg-accent rounded-full blur-[80px] opacity-10 group-hover:opacity-40 transition-opacity duration-1000" />
                                    <div className="relative h-full w-full rounded-[4rem] bg-black border border-white/10 flex items-center justify-center text-accent/40 group-hover:scale-110 group-hover:border-accent group-hover:text-accent group-hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] transition-all duration-700">
                                        <Sparkles className="h-20 w-20" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="font-black text-3xl text-white uppercase tracking-[0.5em] italic mb-2 group-hover:text-accent transition-colors">Awaiting Analysis</p>
                                    <p className="text-[11px] font-black max-w-sm mx-auto opacity-60 uppercase tracking-[0.2em] leading-relaxed italic">
                                        Tap to synchronize your performance metrics <br /> with the AI-Driven Strategy Layer.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Side Panel Stat Trackers (Vertical Stack - Aligned Heights) */}
                <div className="flex flex-col gap-10 h-full">
                    {/* Execution Velocity Power Widget */}
                    <Card className="p-12 rounded-[4rem] bg-accent text-white shadow-[0_40px_100px_-20px_rgba(168,85,247,0.6)] border-none relative overflow-hidden group/exec min-h-[280px] flex flex-col justify-center transition-all duration-1000 hover:scale-[1.05] hover:shadow-accent/80">
                        <div className="absolute -right-16 -bottom-16 h-72 w-72 bg-white/20 rounded-full blur-[100px] group-hover/exec:scale-150 transition-transform duration-1000" />
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div>
                                <p className="text-[12px] font-black uppercase tracking-[0.5em] opacity-80 mb-3">EX-VELOCITY</p>
                                <h4 className="text-8xl font-black italic leading-none tracking-tighter">{completionRate}<span className="text-3xl not-italic ml-2 opacity-50">%</span></h4>
                            </div>
                            <div className="h-20 w-20 rounded-[2.5rem] bg-white/20 backdrop-blur-3xl flex items-center justify-center border border-white/40 shadow-3xl transition-all group-hover/exec:rotate-12 group-hover/exec:scale-110">
                                <TrendingUp className="h-10 w-10 text-white" />
                            </div>
                        </div>
                        <div className="space-y-6 relative z-10 mt-auto">
                            <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden border border-white/10 p-1 shadow-inner">
                                <div className="h-full bg-white rounded-full transition-all duration-2000 ease-out shadow-[0_0_25px_rgba(255,255,255,1)]" style={{ width: `${completionRate}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-[0.3em] italic">
                                <span className="opacity-80 font-black">{completionRate > 80 ? "巅峰状态 / APEX" : "势不可挡 / SURGING"}</span>
                                <span className="text-white/60">{completedCount} / {todoCount} Units</span>
                            </div>
                        </div>
                    </Card>

                    {/* Chronometry Intelligence / Time Density Analytics */}
                    <Card className="flex-1 p-12 rounded-[4rem] bg-zinc-900/20 dark:bg-black/40 border border-white/20 backdrop-blur-3xl overflow-hidden group/density flex flex-col transition-all duration-700 hover:bg-black/60 hover:border-accent hover:shadow-[0_40px_100px_-20px_rgba(168,85,247,0.1)] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between mb-16 relative z-10">
                            <div>
                                <p className="text-[12px] font-black text-accent uppercase tracking-[0.5em] mb-2 font-black">CHRONOMETRY</p>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] opacity-40 italic">시간별 생산성 패턴</p>
                            </div>
                            <div className="h-16 w-16 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-center shadow-inner group-hover/density:scale-110 group-hover/density:rotate-[-12deg] transition-all duration-700">
                                <Clock className="h-8 w-8 text-accent animate-spin-slow" />
                            </div>
                        </div>

                        {/* High-Fidelity Histogram */}
                        <div className="flex items-end justify-between gap-2 h-64 mb-16 relative px-2 z-10">
                            {/* Background Grid Lines */}
                            <div className="absolute inset-0 px-2 flex flex-col justify-between py-2 opacity-[0.05] pointer-events-none">
                                {[1, 2, 3, 4, 5].map(l => <div key={l} className="w-full border-t border-accent" />)}
                            </div>
                            {[65, 45, 80, 55, 95, 70, 40].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group/bar relative">
                                    <div className="w-full max-w-[32px] xl:max-w-[40px] bg-zinc-800/40 rounded-full relative flex items-end justify-center h-full overflow-hidden border border-white/20 transition-all group-hover/bar:bg-accent/30 shadow-inner">
                                        <div
                                            className="w-full bg-accent/40 rounded-full group-hover/bar:bg-accent group-hover/bar:h-full transition-all duration-1000 cursor-none relative"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-white/30 to-transparent group-hover/bar:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-black text-zinc-600 group-hover/bar:text-accent group-hover/bar:scale-125 transition-all duration-500 font-sans tracking-tighter">
                                        {["월", "화", "수", "목", "금", "토", "일"][i]}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="p-10 rounded-[3rem] bg-accent/5 border border-accent/20 mt-auto transition-all group-hover/density:bg-accent/10 group-hover/density:shadow-[0_0_40px_rgba(168,85,247,0.2)] group-hover/density:border-accent flex items-center justify-center relative z-10">
                            <p className="text-[14px] font-bold text-zinc-400 leading-relaxed italic text-center tracking-tight">
                                "집중력이 가장 높은 골든 타임은 <span className="text-accent font-black">오후 12시 - 4시</span>입니다. 이 시간대에는 가장 복잡한 업무를 우선 처리하세요."
                            </p>
                        </div>
                    </Card>
                </div>

            </div>

            {/* Embedded Luxury Styling */}
            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2.5s infinite linear;
                }
                .animate-spin-slow {
                    animation: spin 12s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
