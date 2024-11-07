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
import NavigationContextProvider from "@/context/NavigationContext";
import MiniProfilesContextProvider from "@/context/MiniProfilesContext";
import ArticlesContextProvider from "@/context/ArticlesContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devflow",
  description: "A cool blog site for developers",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-400 scroll-smooth">
      <body
        className={`${inter.className} bg-neutral-100 dark:bg-[#111] md:bg-white md:dark:bg-neutral-950 w-[calc(100vw-1px)]`}>
        <NextTopLoader height={1.2} showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <ArticlesContextProvider>
            <NavigationContextProvider>
              <AuthDialogsProvider>
                <MiniProfilesContextProvider>
                  <Navbar />
                  {children}
                  <Toaster />
                  <Suspense fallback={null}>
                    <NavigationEvents />
                  </Suspense>
                </MiniProfilesContextProvider>
              </AuthDialogsProvider>
            </NavigationContextProvider>
          </ArticlesContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
