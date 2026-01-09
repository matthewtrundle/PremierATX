import type { Metadata, Viewport } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PremierATX - Austin Party Planning',
  description: 'Plan your perfect Austin bachelor and bachelorette party with curated vendors, activities, and experiences.',
  keywords: ['Austin', 'party planning', 'bachelor party', 'bachelorette party', 'events'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen bg-background text-foreground">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
