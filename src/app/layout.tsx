import type { Metadata } from "next";
import "./globals.css";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export const metadata: Metadata = {
  title: "Braingauge v1",
  description: "Privacy-first cognitive self-tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DisclaimerBanner />
        <main className="min-h-screen pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
