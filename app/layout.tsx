import { Manrope } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const manrope = Manrope({ subsets: ['latin', 'cyrillic'] });

function getMetadataBase(): URL {
  const fallbackUrl = 'https://photo.aishny.ru';
  const rawUrl = process.env.NEXTAUTH_URL?.trim();

  if (!rawUrl) {
    return new URL(fallbackUrl);
  }

  try {
    return new URL(rawUrl);
  } catch {
    return new URL(fallbackUrl);
  }
}

export const metadata: Metadata = {
  title: 'AI Фотосессия — Профессиональные фото с ИИ',
  description: 'Создайте потрясающие профессиональные портреты с помощью ИИ за несколько минут.',
  metadataBase: getMetadataBase(),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'AI Фотосессия',
    description: 'Создайте потрясающие профессиональные портреты с помощью ИИ за несколько минут.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: '[data-hydration-error] { display: none !important; }' }} />
      </head>
      <body className={manrope.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
