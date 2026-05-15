import DashboardIndex from '@/views/dashboard';
import { getDashboardData } from './actions';

export default async function DashboardPage({ searchParams }) {
  let initialDashboardData = null;
  const branchId = searchParams?.branchId || '';
  const fromDate = searchParams?.fromDate || '';
  const toDate = searchParams?.toDate || '';

  try {
    const response = await getDashboardData({ branchId, fromDate, toDate });

    if (response?.code === 200 && response?.data) {
      initialDashboardData = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch initial dashboard data:', error);
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
