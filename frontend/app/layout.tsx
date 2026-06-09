"use client";

import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en" className={`${geist.variable} font-sans`}>
      <body className={inter.className}>
        <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10 pt-2 pb-2">
          <div className="container mx-auto px-4">
            <div className="flex gap-2">
              <Link
                href="/property-valuation"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  pathname === "/property-valuation"
                    ? "bg-black text-white font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Property Valuation
              </Link>
              <Link
                href="/market-analysis"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  pathname === "/market-analysis"
                    ? "bg-black text-white font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Market Analysis
              </Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}