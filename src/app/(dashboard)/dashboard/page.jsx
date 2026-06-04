import { getDashboardData } from '@/app/(dashboard)/dashboard/actions';
import {
  getBranchesForDropdown,
  getProvincesCities,
} from '@/app/(dashboard)/branches/actions';
import DashboardIndex from '@/views/dashboard';

export default async function DashboardPage({ searchParams }) {
  const branchId = searchParams?.branchId || '';
  const fromDate = searchParams?.fromDate || '';
  const toDate = searchParams?.toDate || '';

  let initialDashboardData = null;
  let initialStores = [];
  let initialProvincesCities = [];

  try {
    const [dashboardResponse, storesResponse, provincesCitiesResponse] = await Promise.allSettled([
      getDashboardData({ branchId, fromDate, toDate }),
      getBranchesForDropdown(),
      getProvincesCities(),
    ]);

    if (
      dashboardResponse.status === 'fulfilled' &&
      dashboardResponse.value?.code === 200 &&
      dashboardResponse.value?.data
    ) {
      initialDashboardData = dashboardResponse.value.data;
    }

    if (storesResponse.status === 'fulfilled' && Array.isArray(storesResponse.value)) {
      initialStores = storesResponse.value;
    }

    if (
      provincesCitiesResponse.status === 'fulfilled' &&
      Array.isArray(provincesCitiesResponse.value)
    ) {
      initialProvincesCities = provincesCitiesResponse.value;
    }
  } catch (error) {
    console.error('Dashboard server prefetch failed:', error);
  }

  return (
    <DashboardIndex
      initialDashboardData={initialDashboardData}
      initialStores={initialStores}
      initialProvincesCities={initialProvincesCities}
      initialBranchId={branchId}
      initialFromDate={fromDate}
      initialToDate={toDate}
    />
  );
}
