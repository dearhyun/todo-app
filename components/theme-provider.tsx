// 애플리케이션의 다크 모드 및 라이트 모드 상태를 관리하는 테마 프로바이더 컴포넌트입니다.
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
