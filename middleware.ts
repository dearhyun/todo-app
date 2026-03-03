// Supabase 인증 세션을 관리하고 보호된 라우트 접근을 제어하는 미들웨어입니다.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 모든 요청에 대해 Supabase 세션을 갱신하고 접근 권한을 확인합니다.
 * @param request Next.js 요청 객체
 */
export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 로그인되지 않은 사용자가 메인 페이지(/dashboard 또는 보호된 하위 경로)에 접근하면 로그인 페이지(/)로 리다이렉트
    // 현재 메인 기능이 루트(/)에 있으므로, 추후 업무 리스트 페이지가 /dashboard 등으로 분리될 것을 대비한 로직입니다.
    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 로그인된 사용자가 로그인/가입 페이지(루트)에 접근하면 메인 대시보드로 이동시키고 싶지만,
    // 현재는 루트(/)에 로그인 폼과 대시보드 UI를 동시에 두었으므로 클라이언트 로직에서 처리하거나
    // 추후 경로 분리 시 여기에 리다이렉트 로직을 추가합니다.

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
