import { getDashboardData } from '@/app/(dashboard)/dashboard/actions';
import DashboardIndex from '@/views/dashboard';

export default async function DashboardPage({ searchParams }) {
  const branchId = searchParams?.branchId || '';
  const fromDate = searchParams?.fromDate || '';
  const toDate = searchParams?.toDate || '';

  let initialDashboardData = null;

  try {
    const response = await getDashboardData({ branchId, fromDate, toDate });

    if (response?.code === 200 && response?.data) {
      initialDashboardData = response.data;
    }
  } catch (error) {
    console.error('Dashboard server prefetch failed:', error);
  }

  return (
    <DashboardIndex
      initialDashboardData={initialDashboardData}
      initialBranchId={branchId}
      initialFromDate={fromDate}
      initialToDate={toDate}
    />
  );
}
