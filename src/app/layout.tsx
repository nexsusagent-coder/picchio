import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PICCHIO COCKTAIL - Bakım Çalışması",
  description: "Menümüz sizler için yenileniyor",
  appleWebApp: {
    title: "Picchio Menu",
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4E0000',
};

// DIRECT MAINTENANCE LOCK
const IS_MAINTENANCE_MODE = true;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (IS_MAINTENANCE_MODE) {
    return (
      <html lang="tr" className={`${inter.variable} dark`} suppressHydrationWarning>
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Expires" content="0" />
        </head>
        <body className="flex flex-col min-h-[100dvh] bg-black text-white w-full overflow-x-hidden font-sans antialiased" suppressHydrationWarning>
          <MaintenanceScreen />
        </body>
      </html>
    );
  }

  return (
    <html lang="tr" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="flex flex-col min-h-[100dvh] red-inferno-bg text-white w-full overflow-x-hidden text-sm md:text-base font-sans antialiased" suppressHydrationWarning>
        <main className="flex-1 w-full relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
