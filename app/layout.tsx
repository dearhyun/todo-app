import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI 할일 관리 서비스",
    template: "%s | AI TODO",
  },
  description: "AI가 도와주는 똑똑한 할 일 관리 서비스",
  keywords: ["AI", "TODO", "할일 관리", "생산성", "인공지능"],
  authors: [{ name: "AI TODO Team" }],
  creator: "AI TODO Team",
  publisher: "AI TODO Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "AI 할일 관리 서비스",
    description: "AI가 도와주는 똑똑한 할 일 관리 서비스",
    url: "https://ai-todo-service.vercel.app",
    siteName: "AI TODO",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 할일 관리 서비스",
    description: "AI가 도와주는 똑똑한 할 일 관리 서비스",
    creator: "@aitodo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { Header } from "@/components/shared/Header";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

