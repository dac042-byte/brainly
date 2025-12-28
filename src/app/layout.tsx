import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: {
    default: "BrainGauge - Track Your Cognitive Health",
    template: "%s | BrainGauge"
  },
  description: "Free brain tracking tools to monitor cognitive health. Track reaction time, speech patterns, and memory recall with science-based assessments. Private and secure cognitive health monitoring.",
  keywords: [
    "brain tracking tools",
    "cognitive tracking",
    "brain health monitoring",
    "cognitive health tools",
    "memory tracking",
    "brain assessment tools",
    "cognitive testing software",
    "brain performance tracking",
    "mental fitness tools",
    "cognitive decline tracking",
    "brain health app",
    "reaction time test",
    "memory test",
    "cognitive assessment"
  ],
  authors: [{ name: "BrainGauge" }],
  creator: "BrainGauge",
  publisher: "BrainGauge",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://braingauge.com",
    title: "BrainGauge - Track Your Cognitive Health",
    description: "Monitor your cognitive health with quick, science-based assessments. Track reaction time, speech patterns, and memory recall.",
    siteName: "BrainGauge",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrainGauge - Track Your Cognitive Health",
    description: "Monitor your cognitive health with quick, science-based assessments.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://braingauge.com"),
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
