import type { AdminUserDashboardData } from '@/lib/admin-user-dashboard';

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-zinc-100">{value}</div>
      <div className="mt-2 text-xs text-zinc-500">{hint}</div>
    </div>
  );
}

export default function AdminUsersDashboard({
  data,
}: {
  data: AdminUserDashboardData;
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Пользователи и деньги</h2>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500">
            Быстрый срез по росту, генерациям, покупкам и активности пользователей.
          </p>
        </div>
        <div className="text-xs text-zinc-500">
          Пользователей в таблице: {data.users.length}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Всего пользователей" value={data.summary.totalUsers} hint="Все зарегистрированные аккаунты" />
        <MetricCard label="Новых за 7 дней" value={data.summary.newUsersLast7Days} hint="Регистрации за последнюю неделю" />
        <MetricCard label="Сгенерировано кадров" value={data.summary.totalGeneratedImages} hint="Фактически созданные изображения" />
        <MetricCard label="Успешных оплат" value={data.summary.successfulPayments} hint="Завершённые платежи из billing" />
        <MetricCard label="Куплено токенов" value={data.summary.purchasedTokens} hint="Токены из успешных оплат" />
        <MetricCard label="Потрачено токенов" value={data.summary.spentTokens} hint="Списания на generation и variation" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Пользователь</th>
                <th className="px-4 py-3 font-medium">Регистрация</th>
                <th className="px-4 py-3 font-medium">Баланс</th>
                <th className="px-4 py-3 font-medium">Кадры</th>
                <th className="px-4 py-3 font-medium">Потрачено</th>
                <th className="px-4 py-3 font-medium">Оплаты</th>
                <th className="px-4 py-3 font-medium">Сумма оплат</th>
                <th className="px-4 py-3 font-medium">Последняя активность</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-zinc-950/40">
              {data.users.map((user) => (
                <tr key={user.userId} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-medium text-zinc-100">{user.name || 'Без имени'}</div>
                    <div className="mt-1 text-xs text-zinc-500">{user.email}</div>
                    <div className="mt-2 text-xs text-zinc-600">ID {user.userId}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-zinc-100">{user.tokenBalance}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Куплено: {user.purchasedTokens}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-100">{user.generatedImagesCount}</td>
                  <td className="px-4 py-4 text-zinc-100">{user.spentTokens}</td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-zinc-100">{user.successfulPaymentsCount}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {user.paymentTotals.length > 0 ? user.paymentTotals.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{formatDate(user.lastActivityAt)}</td>
                </tr>
              ))}
              {data.users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-500">
                    Пользователей пока нет.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
