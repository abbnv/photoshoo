'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Image as ImageIcon, Zap, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AppHeader from '@/app/_components/app-header';

export default function LandingPage() {
  const { status } = useSession() || {};
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'login' | 'signup'>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
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
    { icon: Camera, title: 'Загрузите фото', desc: 'Начните с 1–3 ваших фотографий' },
    { icon: Sparkles, title: 'Выберите стиль', desc: 'Настройте желаемый образ' },
    { icon: Zap, title: 'ИИ-генерация', desc: 'Получите 10–20 профессиональных вариантов' },
    { icon: ImageIcon, title: 'Скачайте результат', desc: 'Качественные портреты готовы к использованию' },
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
            Профессиональные портреты,{' '}
            <span className="text-primary">созданные ИИ</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Загрузите несколько фотографий, выберите стиль и получите 10–20 потрясающих профессиональных портретов за считанные минуты.
          </p>
          <div className="flex gap-4 justify-center">
            {status === 'authenticated' ? (
              <Button size="lg" onClick={() => router.push('/photoshoots')} className="gap-2">
                К фотосессиям <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => setMode('signup')} className="gap-2">
                  Начать <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setMode('login')}>
                  Войти
                </Button>
              </>
            )}
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
          AI Фотосессия &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
