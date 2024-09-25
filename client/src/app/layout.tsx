import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar/Navbar";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import AuthDialogsProvider from "@/components/auth/AuthDialogsProvider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { NavigationEvents } from "./NavigationEvents";
import PostsContextProvider from "@/context/PostsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Devdaily",
  description: "A cool blog site for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-400 scroll-smooth">
      <body className={`${inter.className} primary-color`}>
        <NextTopLoader height={1} showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <AuthDialogsProvider>
            <PostsContextProvider>
              <Navbar />
              {children}
              <Toaster />
              <Suspense fallback={null}>
                <NavigationEvents />
              </Suspense>
            </PostsContextProvider>
          </AuthDialogsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
