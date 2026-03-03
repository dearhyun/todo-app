// 브라우저 환경에서 사용할 Supabase 클라이언트를 생성하는 설정 파일입니다.
import { createBrowserClient } from '@supabase/ssr';

/**
 * 클라이언트 컴포넌트에서 사용할 Supabase 클라이언트를 생성합니다.
 * @returns Supabase 클라이언트 인스턴스
 */
export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
