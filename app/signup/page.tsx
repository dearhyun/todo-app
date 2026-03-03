// 회원가입 기능을 담당하는 전용 페이지입니다.
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
 * 회원가입 폼 유효성 검사 스키마
 */
const signupSchema = z.object({
    fullName: z.string().min(2, { message: "이름은 최소 2글자 이상이어야 합니다." }),
    email: z.string().email({ message: "올바른 이메일 형식이 아닙니다." }),
    password: z.string().min(6, { message: "비밀번호는 최소 6글자 이상이어야 합니다." }),
});

type SignupValues = z.infer<typeof signupSchema>;

/**
 * 회원가입 화면 컴포넌트입니다.
 */
const SignupPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { fullName: "", email: "", password: "" },
    });

    /**
     * 가입 요청을 처리합니다.
     */
    const onSubmit = async (values: SignupValues) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: { data: { full_name: values.fullName } },
            });

            if (error) throw error;
            if (data.user) {
                toast.success("회원가입 성공! 메일함을 확인하여 인증을 완료해주세요.");
                form.reset();
            }
        } catch (err: any) {
            toast.error("회원가입 실패: " + (err.message || "알 수 없는 오류"));
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
                </div>

                <Card className="w-full border border-white/5 bg-zinc-900/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] p-4">
                    <CardHeader className="space-y-2 pb-8">
                        <CardTitle className="text-3xl font-black tracking-tight text-white uppercase">CREATE ACCOUNT</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">
                            Join the next-generation workspace and start leading with intelligence.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your Name" {...field} disabled={isLoading} className="h-14 bg-white/5 border-white/5 rounded-2xl focus:border-accent/40 transition-all font-medium" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</FormLabel>
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
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Secure Password</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Min. 6 characters" type="password" {...field} disabled={isLoading} className="h-14 bg-white/5 border-white/5 rounded-2xl focus:border-accent/40 transition-all font-medium" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-16 text-lg font-black bg-gradient-to-r from-accent to-accent/80 text-white shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] rounded-2xl border-none transition-all hover:scale-[1.02] active:scale-95 mt-4" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "JOIN WORKSPACE"}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-8 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            Already have an account?{" "}
                            <Link href="/login" className="text-accent hover:text-accent/80 transition-colors ml-2 underline underline-offset-4">
                                Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default SignupPage;
