import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { Providers } from "@/lib/query-client";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SHOP.CO",
  description: "Find clothes that match your style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <Providers>
          <AnnouncementBar />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
