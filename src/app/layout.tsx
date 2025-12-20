import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Cerebro",
  description: "Privacy-first cognitive self-tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <ErrorBoundary>
            <main className="pb-8">
              {children}
            </main>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
