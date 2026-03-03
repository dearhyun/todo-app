"use client";

// AI TODO 서비스의 메인 엔트리 포인트입니다.
// 로그인 여부에 따라 사용자 맞춤형 대시보드 또는 서비스 소개 랜딩 페이지를 제공합니다.

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Dashboard } from "@/components/features/Dashboard";

/**
 * 메인 페이지 컴포넌트
 */
const MainPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const supabase = createClient();

  // AUTH 상태 및 세션 감지
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setIsLoadingAuth(false);
      } catch (err) {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  // --- RENDERING: LOGGED IN (DASHBOARD) ---
  if (user) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-500 relative overflow-hidden">
        {/* Aesthetic Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full -z-10" />

        <Dashboard />
      </div>
    );
  }

  // --- RENDERING: LOGGED OUT (LANDING PAGE) ---
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-white overflow-hidden relative">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-accent/10 blur-[150px] rounded-full -z-10" />

      <main className="flex-1">
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="mb-12 flex justify-center">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-white uppercase italic">AI TODO</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2 text-xs font-black uppercase tracking-widest text-accent mb-10 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              INTELLIGENT TASK MANAGEMENT
            </div>

            <h1 className="text-6xl lg:text-9xl font-black tracking-tighter text-white mb-10 leading-[0.85] uppercase">
              REDEFINE YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/40 italic">PRODUCTIVITY</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-zinc-400/80 mb-14 font-medium leading-relaxed">
              Not just another todo list. AI TODO is the next-generation workspace for executives and planners.
              Let AI handle the prioritization while you focus on execution.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" className="h-16 px-12 text-xl font-black bg-gradient-to-r from-accent to-accent/80 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-all hover:scale-105 active:scale-95 rounded-2xl border-none" asChild>
                <Link href="/signup">GET STARTED FREE</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-black border-2 border-white/10 hover:bg-white/5 text-white rounded-2xl transition-all" asChild>
                <Link href="/login">SIGN IN</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-32 border-t border-white/5 relative bg-black/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-16">
              <div className="flex flex-col items-center text-center space-y-6 group">
                <div className="h-16 w-16 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">ULTRA SPEED</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">Capture thoughts in milliseconds. AI categorizes everything instantly so you never lose an insight.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-6 group">
                <div className="h-16 w-16 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">AI ANALYTICS</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">Focus on what matters. Our AI identifies high-impact tasks and tracks your productivity score daily.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-6 group">
                <div className="h-16 w-16 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <ShieldCheck className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">ENTERPRISE SECURITY</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">Your business data is precious. We use bank-grade encryption to ensure your task details stay private.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-16 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 opacity-50 mb-6">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="font-black tracking-tighter uppercase italic">AI TODO</span>
          </div>
          <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase mb-2">© 2026 AI TODO Inc. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] mt-8">
            <Link href="#" className="hover:text-accent transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-accent transition-colors">Terms</Link>
            <Link href="#" className="hover:text-accent transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
