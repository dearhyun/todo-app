// 서버 환경(Server Components, Actions, Routes)에서 사용할 Supabase 클라이언트를 생성하는 설정 파일입니다.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 서버 환경에서 쿠키를 관리하며 동작하는 Supabase 클라이언트를 생성합니다.
 * Next.js 15 이상의 async cookies()를 지원합니다.
 * @returns Supabase 서버 클라이언트 인스턴스
 */
export const createClient = async () => {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // 이 오류는 서버 컴포넌트에서 쿠키를 설정하려고 할 때 발생할 수 있습니다.
                        // 미들웨어에서 세션을 갱신하도록 처리되어 있다면 무시할 수 있습니다.
                    }
                },
            },
        }
    );
};
