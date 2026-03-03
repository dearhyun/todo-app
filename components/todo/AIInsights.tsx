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
    Clock
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Todo } from "@/lib/types/todo";

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
    trendData?: any[];
}

/**
 * AI가 할 일 목록을 분석하여 요약과 인사이트를 제공하는 섹션입니다.
 * 탭 전환을 통해 오늘과 주간 분석을 각각 수행할 수 있습니다.
 */
export const AIInsights = ({ todos, todoCount, completedCount, urgentCount }: AIInsightsProps) => {
    const [period, setPeriod] = useState<"today" | "week">("today");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

    // 기본 시각화 데이터 (AI 분석 전/후 활용)
    const defaultChartData = [
        { name: "Mon", completed: 30 },
        { name: "Tue", completed: 45 },
        { name: "Wed", completed: 35 },
        { name: "Thu", completed: 60 },
        { name: "Fri", completed: 50 },
        { name: "Sat", completed: 80 },
        { name: "Sun", completed: 65 },
    ];

    /**
     * AI 분석 API를 호출하여 현재 목록을 요약합니다.
     */
    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            // 기간에 맞는 할 일 필터링
            const filteredTodos = period === "today"
                ? todos.filter(t => {
                    if (!t.due_date) return false;
                    const today = new Date().toISOString().split("T")[0];
                    return t.due_date === today;
                })
                : todos;

            const response = await fetch("/api/todo/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ period, todos: filteredTodos }),
            });

            if (!response.ok) throw new Error("분석 중 오류가 발생했습니다.");

            const data = await response.json();
            setSummaryData(data);
            toast.success("AI 분석이 완료되었습니다.");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const completionRate = todoCount > 0 ? Math.round((completedCount / todoCount) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                        <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">AI SUMMARY & ANALYTICS</h2>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Data-driven performance insights</p>
                    </div>
                </div>

                <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="bg-secondary/50 p-1 rounded-2xl border border-border/50">
                    <TabsList className="bg-transparent gap-1">
                        <TabsTrigger value="today" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-accent font-black text-[10px] uppercase">Today</TabsTrigger>
                        <TabsTrigger value="week" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-accent font-black text-[10px] uppercase">This Week</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Insight Engine Card */}
                <Card className="lg:col-span-2 border-2 border-accent/10 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-accent/5 to-transparent border-b border-white/5">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground">
                                <Sparkles className="h-4 w-4 text-accent" />
                                {period === "today" ? "TODAY'S BRIEFING" : "WEEKLY RETROSPECTIVE"}
                            </CardTitle>
                            <div className="flex gap-4 text-[10px] font-black text-muted-foreground/60 tracking-wider uppercase">
                                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {todoCount} Tasks</span>
                                <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3 text-red-400" /> {urgentCount} Urgent</span>
                                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-400" /> {completionRate}% Rate</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl h-10 px-4 border-accent/30 hover:bg-accent/10 hover:text-accent font-black text-[10px] uppercase tracking-widest transition-all"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <TrendingUp className="h-3 w-3 mr-2" />}
                            Run AI Analysis
                        </Button>
                    </CardHeader>

                    <CardContent className="pt-8">
                        {summaryData ? (
                            <div className="flex flex-col md:flex-row gap-10 items-stretch">
                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="p-5 rounded-3xl bg-accent/10 border border-accent/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10"><Sparkles className="h-10 w-10 text-accent" /></div>
                                        <h4 className="text-[10px] font-black text-accent uppercase mb-2">Executive Summary</h4>
                                        <p className="text-sm font-bold text-foreground leading-relaxed">{summaryData.summary}</p>
                                    </div>

                                    {summaryData.urgentTasks.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                                                <AlertCircle className="h-3 w-3" /> Focus Items
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {summaryData.urgentTasks.map((task, i) => (
                                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-[10px] font-bold border border-red-400/20">{task}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 p-5 rounded-3xl bg-accent/10 border border-accent/20 flex-1">
                                        <h4 className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 mb-2">
                                            <Lightbulb className="h-3 w-3" /> Key Insights
                                        </h4>
                                        <ul className="space-y-2">
                                            {summaryData.insights.map((insight, i) => (
                                                <li key={i} className="text-xs font-medium text-muted-foreground flex items-start gap-2">
                                                    <div className="mt-1.5 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                                                    {insight}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="p-5 rounded-3xl bg-accent/10 border border-accent/20 relative overflow-hidden group">
                                        <h4 className="text-[10px] font-black text-accent uppercase mb-4 tracking-widest flex items-center gap-2">
                                            <TrendingUp className="h-3 w-3" /> Productivity Curve
                                        </h4>
                                        <div className="h-[200px] w-full pr-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={summaryData.trendData || defaultChartData}>
                                                    <XAxis
                                                        dataKey="name"
                                                        fontSize={10}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        stroke="var(--accent)"
                                                        label={{ value: '기간', position: 'insideBottom', offset: -5, fontSize: 8, fontBold: 'black', fill: 'var(--accent)', opacity: 0.5 }}
                                                    />
                                                    <YAxis
                                                        fontSize={10}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        stroke="var(--accent)"
                                                        label={{ value: '완료수', angle: -90, position: 'insideLeft', fontSize: 8, fontBold: 'black', fill: 'var(--accent)', opacity: 0.5 }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                                                        cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                                                    />
                                                    <Bar dataKey="completed" fill="var(--accent)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-3xl bg-accent/10 border border-accent/20 flex-1">
                                        <h4 className="text-[10px] font-black text-accent uppercase mb-4 tracking-widest flex items-center gap-2">
                                            <TrendingUp className="h-3 w-3" /> Recommended Actions
                                        </h4>
                                        <div className="space-y-3">
                                            {summaryData.recommandation.map((rec, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-background/40 border border-accent/10 group hover:border-accent/40 transition-all cursor-default">
                                                    <div className="h-6 w-6 rounded-lg bg-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all"><CheckCircle2 className="h-3 w-3" /></div>
                                                    <p className="text-[11px] font-bold text-foreground/80 leading-tight">{rec}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 opacity-40">
                                <div className="h-20 w-20 rounded-[2.5rem] bg-accent/10 flex items-center justify-center text-accent animate-pulse">
                                    <Sparkles className="h-10 w-10" />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-tighter">AI Analysis Ready</p>
                                    <p className="text-xs font-medium max-w-[200px] mt-1 italic">Click the button above to generate your smart briefing</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Vertical Stat Trackers */}
                <div className="flex flex-col gap-6 h-full min-h-[400px]">
                    <Card className="min-h-[120px] p-5 rounded-[2.5rem] bg-accent text-white shadow-[0_25px_50px_-12px_rgba(168,85,247,0.4)] border-none relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Execution Power</p>
                                <h4 className="text-4xl font-black mt-2 tracking-tighter italic">{completionRate}<span className="text-xl not-italic ml-1 opacity-60">%</span></h4>
                            </div>
                            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${completionRate}%` }} />
                            </div>
                            <p className="text-[10px] font-bold tracking-tight opacity-80">
                                {completionRate > 70 ? "탁월한 업무 흐름" : "꾸준한 성장 중"} • {completedCount}/{todoCount}개 완료
                            </p>
                        </div>
                    </Card>

                    <Card className="flex-1 p-7 rounded-[2.5rem] bg-accent/10 border-2 border-accent/20 backdrop-blur-3xl overflow-hidden group flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Time Density</p>
                            <div className="h-8 w-8 rounded-xl bg-accent/20 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-accent" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between gap-2 h-20 flex-1 mb-6">
                            {[40, 70, 45, 90, 65, 30].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                    <div className="w-full bg-accent/10 rounded-t-lg relative group/bar flex items-end justify-center h-full">
                                        <div
                                            className="w-full bg-accent/40 rounded-t-lg hover:bg-accent transition-all duration-500"
                                            style={{ height: `${h}%` }}
                                        />
                                    </div>
                                    <span className="text-[8px] font-black text-muted-foreground uppercase">{i * 4}h</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground/80 leading-relaxed tracking-tight">
                            주요 업무가 <span className="text-accent font-black">오후 12시 - 4시</span> 사이에 집중되어 있습니다. 오전 시간을 활용해 여유를 가져보세요.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const ChevronUp = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
);
