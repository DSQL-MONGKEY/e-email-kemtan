import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./theme.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";


const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: 'E-email Kementan',
  description: 'E-email Kementerian Pertanian Republik Indonesia',
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isScaled = activeThemeValue?.endsWith('-scaled');

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
        </head>
        <body
          className={cn(
            'bg-background overflow-hidden overscroll-none font-sans antialiased',
            activeThemeValue ? `theme-${activeThemeValue}` : '',
            isScaled ? 'theme-scaled' : '',
          )}
        >
          <Providers>
            <Toaster />
            {children}
          </Providers>
        </body>
      </html>
      </ClerkProvider>
  );
}
