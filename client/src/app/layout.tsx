import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BLOG-PROJECT",
  description: "A cool blog project",
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
      className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-500">
      <body className={`${inter.className} primary-color`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <Navbar />
          <main className="container py-4">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
