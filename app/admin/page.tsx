export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { isAdminEmail } from '@/lib/admin';
import AppHeader from '@/app/_components/app-header';
import AdminUsersDashboard from '@/app/admin/_components/admin-users-dashboard';
import AdminConfigClient from '@/app/admin/_components/admin-config-client';
import { getAdminUserDashboardData } from '@/lib/admin-user-dashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }

  if (!isAdminEmail(session.user.email)) {
    redirect('/photoshoots');
  }

  const dashboardData = await getAdminUserDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-[1220px] px-4 pt-10">
        <AdminUsersDashboard data={dashboardData} />
      </div>
      <AdminConfigClient />
    </div>
  );
}
