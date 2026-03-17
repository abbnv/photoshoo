export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { isAdminEmail } from '@/lib/admin';
import AppHeader from '@/app/_components/app-header';
import AdminConfigClient from '@/app/admin/_components/admin-config-client';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }

  if (!isAdminEmail(session.user.email)) {
    redirect('/photoshoots');
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <AdminConfigClient />
    </div>
  );
}
