import type { ReactNode } from 'react';
import Link from 'next/link';

export default function LegalLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-16">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          На главную
        </Link>

        <div className="mt-6 rounded-[32px] border border-white/10 bg-zinc-950/80 p-6 md:p-10">
          <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">{description}</p>

          <div className="prose prose-invert mt-10 max-w-none prose-headings:scroll-mt-24 prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-white prose-a:text-primary">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
