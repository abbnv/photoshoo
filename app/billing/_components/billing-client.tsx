'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Coins, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  clearBillingCheckoutPending,
  getBillingCheckoutPendingUntil,
  markBillingCheckoutPending,
  notifyBillingBalanceRefresh,
  subscribeToBillingRefresh,
} from '@/lib/billing-browser';

interface Tariff {
  key: string;
  label: string;
  description: string;
  priceLabel: string;
  offerId: string;
  currency: 'RUB' | 'USD' | 'EUR';
  tokens: number;
  enabled: boolean;
  displayOrder: number;
}

export default function BillingClient() {
  const [loading, setLoading] = useState(true);
  const [buyingKey, setBuyingKey] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [trialGenerations, setTrialGenerations] = useState(10);
  const [tokenCostPerGeneration, setTokenCostPerGeneration] = useState(1);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [pendingCheckoutUntil, setPendingCheckoutUntil] = useState<number | null>(null);
  const balanceRef = useRef(0);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [balanceResponse, tariffsResponse] = await Promise.all([
          fetch('/api/billing/balance', { cache: 'no-store' }),
          fetch('/api/billing/tariffs', { cache: 'no-store' }),
        ]);

        if (!balanceResponse.ok || !tariffsResponse.ok) {
          throw new Error('Не удалось загрузить данные биллинга');
        }

        const balancePayload = await balanceResponse.json();
        const tariffsPayload = await tariffsResponse.json();
        if (!active) return;

        const nextBalance = Number(balancePayload?.balance ?? 0);
        if (pendingCheckoutUntil && nextBalance > balanceRef.current) {
          clearBillingCheckoutPending();
          setPendingCheckoutUntil(null);
          notifyBillingBalanceRefresh();
          toast.success('Оплата получена, баланс обновлён');
        }

        setBalance(nextBalance);
        setTrialGenerations(Number(tariffsPayload?.trialGenerations ?? 10));
        setTokenCostPerGeneration(Number(tariffsPayload?.tokenCostPerGeneration ?? 1));
        setTariffs(Array.isArray(tariffsPayload?.tariffs) ? tariffsPayload.tariffs : []);
      } catch (error: any) {
        toast.error(error?.message ?? 'Не удалось загрузить биллинг');
      } finally {
        if (active) setLoading(false);
      }
    };

    setPendingCheckoutUntil(getBillingCheckoutPendingUntil());
    load();
    const intervalId = window.setInterval(load, pendingCheckoutUntil ? 3000 : 12000);
    const unsubscribe = subscribeToBillingRefresh(load);
    return () => {
      active = false;
      unsubscribe();
      window.clearInterval(intervalId);
    };
  }, [pendingCheckoutUntil]);

  const sortedTariffs = useMemo(
    () => [...tariffs].sort((a, b) => a.displayOrder - b.displayOrder),
    [tariffs]
  );

  const handleCheckout = async (tariffKey: string) => {
    setBuyingKey(tariffKey);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tariffKey }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Не удалось создать оплату');
      }
      if (!payload?.paymentUrl) {
        throw new Error('Lava не вернул ссылку на оплату');
      }

      const pendingUntil = markBillingCheckoutPending();
      setPendingCheckoutUntil(pendingUntil);
      notifyBillingBalanceRefresh();

      const popup = window.open(payload.paymentUrl as string, '_blank', 'noopener,noreferrer');
      if (!popup) {
        window.location.href = payload.paymentUrl as string;
        return;
      }

      toast.success('Ссылка на оплату открыта в новой вкладке. Баланс обновится автоматически после оплаты.');
    } catch (error: any) {
      toast.error(error?.message ?? 'Ошибка при создании оплаты');
    } finally {
      setBuyingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="flex items-center gap-3 py-16 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем монетизацию...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <h1 className="text-3xl font-bold text-zinc-100">Оплата и токены</h1>
      <p className="mt-2 text-zinc-400">Покупайте пакеты токенов. Каждый запуск генерации списывает {tokenCostPerGeneration} токен.</p>
      {pendingCheckoutUntil ? (
        <p className="mt-3 text-sm text-emerald-300">
          Ожидаем подтверждение оплаты. Баланс обновится автоматически после webhook от Lava.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Баланс</div>
          <div className="mt-3 flex items-center gap-2 text-3xl font-semibold text-zinc-100">
            <Coins className="h-7 w-7 text-amber-400" />
            {balance}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Триал</div>
          <div className="mt-3 flex items-center gap-2 text-xl font-semibold text-zinc-100">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            {trialGenerations} бесплатных генераций для новых пользователей
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {sortedTariffs.map((tariff) => (
          <div key={tariff.key} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="text-sm text-zinc-500">{tariff.description || tariff.label}</div>
            <div className="mt-2 text-2xl font-semibold text-zinc-100">{tariff.label || `${tariff.tokens} генераций`}</div>
            <div className="mt-3 text-3xl font-semibold text-emerald-300">{tariff.priceLabel || tariff.currency}</div>
            <div className="mt-1 text-sm text-zinc-400">{tariff.tokens} токенов</div>
            <Button
              className="mt-5 w-full"
              onClick={() => handleCheckout(tariff.key)}
              disabled={Boolean(buyingKey)}
            >
              {buyingKey === tariff.key ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Оплатить картой РФ'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
