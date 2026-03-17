'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Camera, Calendar, LogOut, Loader2, Trash2, Shield } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Photoshoot {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  thumbnail?: string;
  previewImages?: string[];
  imageCount?: number;
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  processing: 'Генерация',
  completed: 'Готово',
  failed: 'Ошибка',
};

export default function DashboardClient() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const isAdmin = (session?.user as any)?.isAdmin === true;
  const [photoshoots, setPhotoshoots] = useState<Photoshoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadPhotoshoots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/photoshoots');
      const data = await response.json();
      setPhotoshoots(data ?? []);
    } catch {
      setPhotoshoots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotoshoots();
  }, []);

  const filtered = photoshoots ?? [];

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-400/12 text-yellow-200',
    processing: 'bg-blue-400/12 text-blue-200',
    completed: 'bg-emerald-400/12 text-emerald-200',
    failed: 'bg-red-400/12 text-red-200',
  };

  const handleDelete = async (photoshoot: Photoshoot) => {
    if (deletingId !== null) return;

    const confirmed = window.confirm(`Удалить фотосессию "${photoshoot.title ?? 'Без названия'}"? Это действие нельзя отменить.`);
    if (!confirmed) return;

    setDeletingId(photoshoot.id);
    try {
      const response = await fetch(`/api/photoshoots/${photoshoot.id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete photoshoot');
      }
      setPhotoshoots((prev) => prev.filter((item) => item.id !== photoshoot.id));
      toast.success('Фотосессия удалена');
    } catch {
      toast.error('Не удалось удалить фотосессию');
    } finally {
      setDeletingId(null);
    }
  };

  const getPhotoshootHref = (photoshoot: Photoshoot) => {
    if (photoshoot.status === 'completed') {
      return `/photoshoots/${photoshoot.id}`;
    }

    return `/photoshoots/${photoshoot.id}/edit`;
  };

  return (
    <div className="min-h-screen bg-background px-4 md:px-6 py-4 md:py-5">
      <div className="max-w-[1380px] mx-auto">
        <header className="flex items-center justify-between px-1 py-2 md:py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/photoshoots')}
              className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Camera className="w-5 h-5 text-primary" />
              <span className="font-semibold text-zinc-100">AI Фотосессия</span>
            </button>
            <span className="hidden md:inline text-sm text-zinc-600">/</span>
            <span className="hidden md:inline text-sm text-zinc-500">Фотосессии</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={() => router.push('/admin')} className="gap-1.5">
                <Shield className="w-4 h-4" />
                Админка
              </Button>
            )}
            <Button size="sm" onClick={() => router.push('/photoshoots/new')} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Новая съёмка
            </Button>
            <span className="hidden lg:inline text-xs text-zinc-400">
              {session?.user?.name ?? session?.user?.email ?? ''}
            </span>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <section className="pt-10 pb-8 md:pt-14 md:pb-10">
          <div className="flex flex-col gap-6">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500 mb-3">Library</p>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-50">
                Мои фотосессии
              </h1>
              <p className="text-zinc-400 mt-3 text-sm md:text-base">
                Открывайте готовые съёмки, отслеживайте генерацию и держите весь архив в одном аккуратном пространстве.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-1">
                <Skeleton className="aspect-[5/6] rounded-[28px] bg-zinc-900/80" />
                <Skeleton className="h-6 w-2/3 mt-4 rounded-md bg-zinc-900" />
                <Skeleton className="h-4 w-1/2 mt-2 rounded-md bg-zinc-900" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] bg-zinc-950/28 py-24 text-center"
          >
            <Camera className="w-14 h-14 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-zinc-100 mb-2">Пока нет фотосессий</h2>
            <p className="text-zinc-500 mb-6">Создайте первую съёмку, и она появится здесь.</p>
            <Button onClick={() => router.push('/photoshoots/new')} className="gap-2">
              <Plus className="w-4 h-4" />
              Создать фотосессию
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
            {filtered.map((ps, i) => {
              return (
                <motion.div
                  key={ps.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => router.push(getPhotoshootHref(ps))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(getPhotoshootHref(ps));
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group text-left pb-3"
                >
                  <div className="w-full max-w-[220px] mb-7">
                    <div className="relative overflow-hidden rounded-[24px] bg-zinc-900/90">
                      <div className="aspect-[5/6]">
                        {ps.thumbnail ? (
                          <img
                            src={ps.thumbnail}
                            alt={ps.title ?? 'Фотосессия'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-11 h-11 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/72 to-transparent opacity-80" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-medium text-zinc-100 leading-tight pr-2">
                        {ps.title ?? 'Без названия'}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium whitespace-nowrap ${statusColors[ps.status] ?? statusColors.draft}`}>
                          {statusLabels[ps.status] ?? ps.status}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-400 hover:text-red-400"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(ps);
                          }}
                          disabled={deletingId === ps.id}
                          aria-label={`Удалить фотосессию ${ps.title ?? ''}`}
                        >
                          {deletingId === ps.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {ps.createdAt ? new Date(ps.createdAt).toLocaleDateString('ru-RU') : ''}
                      </span>
                      <span>{ps.imageCount ?? 0} фото</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
