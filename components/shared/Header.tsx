// 모든 페이지에서 공통으로 사용되는 헤더 컴포넌트입니다. 인증 상태에 따라 사용자 정보와 로그아웃 버튼을 표시합니다.
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * 전역 헤더 컴포넌트입니다.
 * 로그인된 사용자의 정보 표시 및 로그아웃 기능을 제공합니다.
 */
export const Header = () => {
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        // 초기 세션 확인
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        // 인증 상태 변경 구독
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    /**
     * 로그아웃을 처리하는 함수입니다.
     */
    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success("로그아웃 되었습니다.");
        } catch (error: any) {
            toast.error("로그아웃 실패: " + error.message);
        }
    };

    if (!user) return null;

    return (
        <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/60 dark:bg-zinc-950/40 backdrop-blur-3xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: User Info */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
                        <UserIcon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground uppercase tracking-tighter">
                            {user.user_metadata.full_name || user.email?.split('@')[0]}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                            Pro Member
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-xl font-bold text-xs uppercase tracking-widest"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        LOGOUT
                    </Button>
                </div>
            </div>
        </header>
    );
};
