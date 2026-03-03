// 서비스의 로그인 기능을 담당하는 전용 페이지입니다.
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

/**
 * 로그인 폼 유효성 검사 스키마
 */
const loginSchema = z.object({
    email: z.string().email({ message: "올바른 이메일 형식이 아닙니다." }),
    password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
});

type LoginValues = z.infer<typeof loginSchema>;

/**
 * 로그인 화면 컴포넌트입니다.
 * 브랜드 로고와 소개, 로그인 폼을 제공합니다.
 */
const LoginPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    /**
     * 로그인 요청을 처리합니다.
     */
    const onSubmit = async (values: LoginValues) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error("로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다.");
            } else {
                toast.success("로그인 성공!");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            toast.error("알 수 없는 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans text-white relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full -z-10" />
            <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-accent/10 blur-[150px] rounded-full -z-10" />

            <main className="flex w-full max-w-lg flex-col items-center px-8 relative">
                <div className="mb-10 flex flex-col items-center gap-6 text-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white uppercase italic">AI TODO</span>
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-accent/60">
                        Intelligent workspace for leaders
                    </h2>
                </div>

                <Card className="w-full border border-white/5 bg-zinc-900/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] p-4">
                    <CardHeader className="space-y-2 pb-8">
                        <CardTitle className="text-3xl font-black tracking-tight text-white uppercase">SIGN IN</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">
                            Access your intelligent workspace to review today's insights.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Source</FormLabel>
                                            <FormControl>
                                                <Input placeholder="example@email.com" type="email" {...field} disabled={isLoading} className="h-14 bg-white/5 border-white/5 rounded-2xl focus:border-accent/40 transition-all font-medium" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your password" type="password" {...field} disabled={isLoading} className="h-14 bg-white/5 border-white/5 rounded-2xl focus:border-accent/40 transition-all font-medium" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-16 text-lg font-black bg-gradient-to-r from-accent to-accent/80 text-white shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] rounded-2xl border-none transition-all hover:scale-[1.02] active:scale-95 mt-4" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "LOG IN NOW"}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-8 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            New to the workspace?{" "}
                            <Link href="/signup" className="text-accent hover:text-accent/80 transition-colors ml-2 underline underline-offset-4">
                                Join Now
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <p className="mt-16 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                    © 2026 AI TODO. PRO LEVEL PRODUCTIVITY.
                </p>
            </main>
        </div>
    );
};

export default LoginPage;
