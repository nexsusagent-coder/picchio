import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PICCHIO COCKTAIL",
  description: "Özel Kokteyller ve Seçkin Menü",
  appleWebApp: {
    title: "Picchio Menu",
    capable: true,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4E0000',
}

import { getSiteSettings } from "@/lib/api";
import { Footer } from "@/components/Footer";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  // Create a dynamic style block to override CSS variables
  const dynamicStyles = `
    :root {
      ${settings.primary_color ? `--color-primary: ${settings.primary_color};` : ''}
      ${settings.secondary_color ? `--color-secondary: ${settings.secondary_color};` : ''}
      ${settings.accent_gold ? `--color-accent: ${settings.accent_gold};` : ''}
      ${settings.bg_gradient_start ? `--bg-gradient-start: ${settings.bg_gradient_start};` : ''}
      ${settings.bg_gradient_end ? `--bg-gradient-end: ${settings.bg_gradient_end};` : ''}
      ${settings.button_color ? `--btn-color: ${settings.button_color};` : ''}
      ${settings.border_radius !== undefined ? `--base-radius: ${settings.border_radius}px;` : ''}
      ${settings.glass_blur !== undefined ? `--glass-blur: ${settings.glass_blur}px;` : ''}
      ${settings.noise_opacity !== undefined ? `--noise-opacity: ${settings.noise_opacity};` : ''}
      ${settings.font_family ? `--font-main: ${settings.font_family === 'Serif' ? 'Georgia, serif' : settings.font_family === 'Classic' ? 'Times New Roman, serif' : 'var(--font-inter)'};` : ''}
    }
  `;

  return (
    <html lang="tr" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let registration of registrations) {
                    registration.unregister().then(function(success) {
                      if (success) {
                        console.log('Old Service Worker unregistered successfully.');
                      }
                    });
                  }
                });
              }
            `
          }}
        />
      </head>
      <body className="flex flex-col min-h-[100dvh] red-inferno-bg text-white w-full overflow-x-hidden text-sm md:text-base font-sans antialiased" suppressHydrationWarning>
        <div className="noise-texture" />
        <main className="flex-1 w-full relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
