export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import AppHeader from '@/app/_components/app-header';
import BillingClient from '@/app/billing/_components/billing-client';

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <BillingClient />
    </div>
  );
}
