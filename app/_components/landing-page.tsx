'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Image as ImageIcon, Zap, ArrowRight, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AppHeader from '@/app/_components/app-header';

function BeforeAfterCard({
  title,
  subtitle,
  beforeSrc,
  afterSrc,
}: {
  title: string;
  subtitle: string;
  beforeSrc: string;
  afterSrc: string;
}) {
  const [beforeFailed, setBeforeFailed] = useState(false);
  const [afterFailed, setAfterFailed] = useState(false);

  return (
    <div className="mx-auto max-w-4xl rounded-[24px] border border-white/10 bg-zinc-950/80 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-zinc-400">{subtitle}</div>
        </div>
        <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
          Реальный пример
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[
          { label: 'До', src: beforeSrc, failed: beforeFailed, setFailed: setBeforeFailed, tone: 'from-zinc-800 via-zinc-900 to-black' },
          { label: 'После', src: afterSrc, failed: afterFailed, setFailed: setAfterFailed, tone: 'from-emerald-950/70 via-zinc-950 to-black' },
        ].map((item) => (
          <div key={item.label} className="overflow-hidden rounded-[20px] border border-white/10 bg-black">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
              <div className="text-sm font-semibold text-white">{item.label}</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                {item.label === 'До' ? 'Исходник' : 'AI результат'}
              </div>
            </div>

            {item.failed ? (
              <div className={`flex aspect-[4/5] max-h-[420px] items-center justify-center bg-gradient-to-br ${item.tone} p-6 text-center`}>
                <div>
                  <div className="text-base font-medium text-white">Добавьте изображение</div>
                  <div className="mt-2 text-sm leading-6 text-zinc-400">{item.src}</div>
                </div>
              </div>
            ) : (
              <img
                src={item.src}
                alt={`${title} — ${item.label}`}
                className="aspect-[4/5] max-h-[420px] w-full object-cover"
                onError={() => item.setFailed(true)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { status } = useSession() || {};
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'login' | 'signup'>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (res?.error) {
        toast.error('Неверный email или пароль');
      } else {
        router.replace('/photoshoots');
      }
    } catch {
      toast.error('Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      toast.error('Введите email и пароль');
      return;
    }
    if (!acceptedLegal) {
      toast.error('Нужно принять пользовательское соглашение и политику конфиденциальности');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, acceptedLegal }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok) {
        toast.error(data?.error ?? 'Ошибка регистрации');
        return;
      }
      const loginRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (loginRes?.error) {
        toast.error('Аккаунт создан, но не удалось войти. Попробуйте войти вручную.');
        setMode('login');
      } else {
        router.replace('/photoshoots');
      }
    } catch {
      toast.error('Не удалось выполнить запрос. Проверьте сервер и отключите расширения, которые перехватывают запросы.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAuth = () => {
    if (mode === 'login') {
      void handleLogin().catch(() => {
        toast.error('Ошибка входа');
      });
      return;
    }
    void handleSignup().catch(() => {
      toast.error('Ошибка регистрации');
    });
  };

  const features = [
    { icon: Camera, title: 'Когда фото нужны для дела', desc: 'Для сайта, резюме, аватарки, Telegram и рабочих профилей' },
    { icon: Sparkles, title: 'Когда фото нужны для соцсетей', desc: 'Для личного бренда, постов и профиля без случайных селфи' },
    { icon: Zap, title: 'Когда не хочется на съёмку', desc: 'Без студии, фотографа, сборов, дороги и потери половины дня' },
    { icon: ImageIcon, title: 'Когда нужен быстрый результат', desc: 'Загружаете свои фото и получаете готовую AI-фотосессию за минуты' },
  ];

  const beforeAfterExamples = [
    {
      title: 'Обычное селфи в сильный портрет',
      subtitle: 'Из домашнего фото в собранный портрет для профиля, сайта и делового позиционирования.',
      beforeSrc: '/landing/before-example-1.jpg',
      afterSrc: '/landing/after-example-1.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {status === 'authenticated' ? (
        <AppHeader />
      ) : (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">AI Фотосессия</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setMode('login')}>Войти</Button>
              <Button onClick={() => setMode('signup')}>Регистрация</Button>
            </div>
          </div>
        </header>
      )}

      {/* Герой */}
      <section className="max-w-[1200px] mx-auto px-4 py-20 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Профессиональная фотосессия{' '}
            <span className="text-primary">без похода на съёмку</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Если нужны фото для дела или соцсетей, но совсем не хочется идти на фотосессию, просто загрузите несколько
            своих снимков и получите готовые кадры в профессиональной подаче.
          </p>
          <div className="mb-8 flex flex-wrap justify-center gap-3 text-sm text-zinc-400">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">5 фото бесплатно</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Для работы и соцсетей</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Без студии и фотографа</div>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {status === 'authenticated' ? (
              <Button size="lg" onClick={() => router.push('/photoshoots')} className="gap-2">
                Создать фотосессию <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => setMode('signup')} className="gap-2">
                  Получить 5 фото бесплатно <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setMode('login')}>
                  У меня уже есть аккаунт
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 pb-6 md:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_35%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,1))] p-5 md:p-6"
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              До / После
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
              Показываем не абстрактный AI-арт, а реальную трансформацию ваших фото
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400 md:text-base">
              Человек остаётся тем же. Меняются подача, свет, окружение и качество кадра, чтобы вы получили материал,
              который не стыдно ставить на сайт, в соцсети и в рабочий профиль.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {beforeAfterExamples.map((example) => (
              <BeforeAfterCard key={example.title} {...example} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Преимущества */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <f.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Модальное окно авторизации */}
      {status !== 'authenticated' && mode !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setMode('idle')}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-8 w-full max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              {mode === 'login' ? 'С возвращением!' : 'Создать аккаунт'}
            </h2>
            <div className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Полное имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email адрес"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && onSubmitAuth()}
                />
              </div>
              <Button
                className="w-full"
                onClick={onSubmitAuth}
                disabled={loading}
              >
                {loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </Button>
              {mode === 'signup' ? (
                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-950/60 p-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={acceptedLegal}
                    onChange={(e) => setAcceptedLegal(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-zinc-950 text-primary"
                  />
                  <span className="leading-6">
                    Принимаю{' '}
                    <Link href="/legal/privacy" target="_blank" className="text-primary hover:underline">
                      политику конфиденциальности
                    </Link>{' '}
                    и{' '}
                    <Link href="/legal/terms" target="_blank" className="text-primary hover:underline">
                      пользовательское соглашение
                    </Link>
                    .
                  </span>
                </label>
              ) : null}
              {mode === 'signup' ? (
                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-3 text-xs leading-5 text-zinc-400">
                  <div className="flex items-center gap-2 font-medium text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Регистрация доступна только после согласия с документами
                  </div>
                  <div className="mt-1">
                    Это нужно, чтобы законно создать аккаунт, хранить ваши фото и выполнять генерацию по вашему запросу.
                  </div>
                </div>
              ) : null}
              <p className="text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>Нет аккаунта?{' '}<button className="text-primary hover:underline" onClick={() => setMode('signup')}>Зарегистрироваться</button></>
                ) : (
                  <>Уже есть аккаунт?{' '}<button className="text-primary hover:underline" onClick={() => setMode('login')}>Войти</button></>
                )}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Подвал */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-[1200px] mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <div>AI Фотосессия &copy; {new Date().getFullYear()}</div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/legal/privacy" className="hover:text-white">
              Политика конфиденциальности
            </Link>
            <Link href="/legal/terms" className="hover:text-white">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
