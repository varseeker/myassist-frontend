import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { APP_NAME } from '@/lib/constants';
import { QueryProvider } from '@/providers/query-provider';
import { RouteRefreshProvider } from '@/providers/route-refresh-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Internal service desk management system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <RouteRefreshProvider>
              {children}
              <Toaster richColors position="top-right" />
            </RouteRefreshProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
