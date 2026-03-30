'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  dashboardDefaultHeroSummary,
  dashboardFilters,
} from '@/data/dataSets';
import useAccessibleStoreScope from '@/hooks/useAccessibleStoreScope';
import { findBranchByIdentifier } from '@/utils/branchAccess';
import { formatWholeNumber } from '@/utils/numberUtils';
import {
  getAIForecastInsights,
  getDashboardData,
  getFilteredDashboardData,
} from '@/app/(dashboard)/dashboard/actions';

const DASHBOARD_CURRENCY = 'SAR';

const getFilterApiValue = (value = 'all') =>
  dashboardFilters.find((item) => item.value === value)?.apiValue || '';

const getTrendDirection = (value = '') => {
  if (value === 'Increased') return 'positive';
  if (value === 'Decreased') return 'negative';
  return 'neutral';
};

const buildForecastPayload = (sourceData = {}) => ({
  currency: DASHBOARD_CURRENCY,
  locale: 'en-SA',
  region: 'Saudi Arabia',
  financeTrend: sourceData?.financeTrend || {},
  topProducts:
    sourceData?.topProductsTrending?.length > 0
      ? sourceData.topProductsTrending
      : sourceData?.topProductsAll || sourceData?.topProducts || [],
  topCustomers:
    sourceData?.topCustomersTrending?.length > 0
      ? sourceData.topCustomersTrending
      : sourceData?.topCustomersAll || sourceData?.topCustomers || [],
  inventoryAlerts: sourceData?.inventoryAlerts || [],
  operations: sourceData?.operations || {},
});

export function useDashboardHandler({
  initialDashboardData = null,
  initialBranchId = '',
}) {
  const {
    storeBranches,
    primaryStore,
    hasStoreScope,
    isRestrictedToAssignedStores,
  } = useAccessibleStoreScope();
  const accessibleBranches = Array.isArray(storeBranches) ? storeBranches : [];

  const [dashboardData, setDashboardData] = useState(initialDashboardData || {});
  const [filterValue, setFilterValue] = useState('all');
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId || '');
  const [productsTab, setProductsTab] = useState('all');
  const [customersTab, setCustomersTab] = useState('all');
  const [financeTab, setFinanceTab] = useState('sales');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isGeneratingAIForecast, setIsGeneratingAIForecast] = useState(false);
  const [aiForecastData, setAiForecastData] = useState(null);
  const [aiInsightCards, setAiInsightCards] = useState([]);
  const aiForecastRequestRef = useRef(0);

  useEffect(() => {
    setDashboardData(initialDashboardData || {});
    setSelectedBranchId(initialBranchId || '');
    setFilterValue('all');
    setProductsTab('all');
    setCustomersTab('all');
    setFinanceTab('sales');
    setAiForecastData(null);
    setAiInsightCards([]);
  }, [initialBranchId, initialDashboardData]);

  const selectedStore = useMemo(
    () => findBranchByIdentifier(accessibleBranches, selectedBranchId),
    [accessibleBranches, selectedBranchId]
  );

  useEffect(() => {
    const labels = Array.isArray(dashboardData?.financeTrend?.labels)
      ? dashboardData.financeTrend.labels
      : [];

    if (!labels.length) {
      setAiForecastData(null);
      setAiInsightCards([]);
      setIsGeneratingAIForecast(false);
      return;
    }

    const requestId = aiForecastRequestRef.current + 1;
    aiForecastRequestRef.current = requestId;

    const generateForecast = async () => {
      setIsGeneratingAIForecast(true);

      try {
        const response = await getAIForecastInsights(buildForecastPayload(dashboardData));

        if (requestId !== aiForecastRequestRef.current) return;

        if (response?.code === 200 && response?.data?.series) {
          setAiForecastData(response.data);
          setAiInsightCards(
            Array.isArray(response?.data?.insightCards) ? response.data.insightCards : []
          );
          return;
        }

        setAiForecastData(null);
        setAiInsightCards([]);
        setSnackbar({
          open: true,
          message:
            response?.message || 'Failed to generate AI forecast. Showing baseline trend.',
          severity: 'error',
        });
      } catch (error) {
        if (requestId !== aiForecastRequestRef.current) return;

        setAiForecastData(null);
        setAiInsightCards([]);
        setSnackbar({
          open: true,
          message: error?.message || 'Failed to generate AI forecast. Showing baseline trend.',
          severity: 'error',
        });
      } finally {
        if (requestId === aiForecastRequestRef.current) {
          setIsGeneratingAIForecast(false);
        }
      }
    };

    generateForecast();
  }, [dashboardData]);

  const activeFilterLabel =
    dashboardFilters.find((item) => item.value === filterValue)?.label || 'All Time';

  const storeScopeLabel = useMemo(() => {
    if (selectedStore?.name) {
      return `Store: ${selectedStore.name}`;
    }

    if (isRestrictedToAssignedStores) {
      return hasStoreScope
        ? `Assigned stores: ${accessibleBranches.length}`
        : 'Assigned store access required';
    }

    if (hasStoreScope) {
      return 'All stores';
    }

    return 'Company-wide scope';
  }, [
    accessibleBranches.length,
    hasStoreScope,
    isRestrictedToAssignedStores,
    selectedStore?.name,
  ]);

  const storeScopeHelperText = useMemo(() => {
    if (selectedStore?.name) {
      return `Dashboard totals are filtered to ${selectedStore.name}.`;
    }

    if (isRestrictedToAssignedStores) {
      if (!hasStoreScope) {
        return 'This account does not have an assigned store, so store-scoped widgets will stay empty.';
      }

      if (primaryStore?.name) {
        return `Only your assigned stores are included here. Primary store: ${primaryStore.name}.`;
      }

      return 'Only your assigned stores are included in dashboard totals.';
    }

    return 'Switch store scope to review a single location without leaving the dashboard.';
  }, [
    hasStoreScope,
    isRestrictedToAssignedStores,
    primaryStore?.name,
    selectedStore?.name,
  ]);

  const heroSummary = useMemo(() => {
    const invoiced = Number(dashboardData?.invoiced || 0);
    const received = Number(dashboardData?.received || 0);
    const pending = Number(dashboardData?.pending || 0);
    const collectionRate = invoiced > 0 ? (received / invoiced) * 100 : 0;
    const pendingExposure = invoiced > 0 ? (pending / invoiced) * 100 : 0;
    const netBusinessFlow = Number(dashboardData?.operations?.netBusinessFlow || 0);

    return {
      invoiced,
      received,
      pending,
      netBusinessFlow,
      collectionRate,
      pendingExposure,
    };
  }, [
    dashboardData?.invoiced,
    dashboardData?.operations?.netBusinessFlow,
    dashboardData?.pending,
    dashboardData?.received,
  ]);

  const metricCards = useMemo(() => {
    const purchasesAmount = Number(dashboardData?.operations?.purchasesAmount || 0);
    const expensesAmount = Number(dashboardData?.operations?.expensesAmount || 0);
    const salesAmount = Number(dashboardData?.received || 0);

    return [
      {
        key: 'purchases',
        title: 'Purchases',
        value: formatWholeNumber(purchasesAmount),
        suffix: DASHBOARD_CURRENCY,
        icon: 'ri-shopping-cart-line',
        color: 'warning',
        direction: 'neutral',
        changeNumber: '0 %',
        subTitle: 'current period',
      },
      {
        key: 'customers',
        title: 'Customers',
        value: formatWholeNumber(dashboardData?.customers || 0),
        icon: 'ri-user-add-line',
        color: 'primary',
        direction: getTrendDirection(dashboardData?.customerPercentage?.percentage),
        changeNumber: dashboardData?.customerPercentage?.value || '0 %',
        subTitle: 'vs previous week',
      },
      {
        key: 'sales',
        title: 'Sales',
        value: formatWholeNumber(salesAmount),
        suffix: DASHBOARD_CURRENCY,
        icon: 'ri-funds-line',
        color: 'success',
        direction: getTrendDirection(dashboardData?.invoicedPercentage?.percentage),
        changeNumber: dashboardData?.invoicedPercentage?.value || '0 %',
        subTitle: 'vs previous week',
      },
      {
        key: 'expenses',
        title: 'Expenses',
        value: formatWholeNumber(expensesAmount),
        suffix: DASHBOARD_CURRENCY,
        icon: 'ri-money-dollar-circle-line',
        color: 'secondary',
        direction: 'neutral',
        changeNumber: '0 %',
        subTitle: 'current period',
      },
    ];
  }, [
    dashboardData?.customerPercentage?.percentage,
    dashboardData?.customerPercentage?.value,
    dashboardData?.customers,
    dashboardData?.invoicedPercentage?.percentage,
    dashboardData?.invoicedPercentage?.value,
    dashboardData?.operations?.expensesAmount,
    dashboardData?.operations?.purchasesAmount,
    dashboardData?.received,
  ]);

  const topProductsAll = Array.isArray(dashboardData?.topProductsAll)
    ? dashboardData.topProductsAll
    : Array.isArray(dashboardData?.topProducts)
      ? dashboardData.topProducts
      : [];
  const topProductsTrending = Array.isArray(dashboardData?.topProductsTrending)
    ? dashboardData.topProductsTrending
    : [];
  const topProducts = productsTab === 'trending' ? topProductsTrending : topProductsAll;

  const topCustomersAll = Array.isArray(dashboardData?.topCustomersAll)
    ? dashboardData.topCustomersAll
    : Array.isArray(dashboardData?.topCustomers)
      ? dashboardData.topCustomers
      : [];
  const topCustomersTrending = Array.isArray(dashboardData?.topCustomersTrending)
    ? dashboardData.topCustomersTrending
    : [];
  const topCustomers = customersTab === 'trending' ? topCustomersTrending : topCustomersAll;

  const inventoryAlerts = Array.isArray(dashboardData?.inventoryAlerts)
    ? dashboardData.inventoryAlerts
    : [];
  const financeTrendData = aiForecastData || dashboardData?.financeTrend || {};
  const hasDashboardData = Boolean(dashboardData && Object.keys(dashboardData).length > 0);

  const loadDashboardData = async ({
    nextFilterValue = filterValue,
    nextBranchId = selectedBranchId,
  } = {}) => {
    setIsRefreshing(true);

    try {
      const apiValue = getFilterApiValue(nextFilterValue);
      const response = apiValue
        ? await getFilteredDashboardData(apiValue, nextBranchId)
        : await getDashboardData(nextBranchId);

      if (response?.code === 200) {
        setDashboardData(response?.data || {});
        setAiForecastData(null);
        setAiInsightCards([]);
        return true;
      }

      setSnackbar({
        open: true,
        message: response?.message || 'Failed to fetch dashboard data.',
        severity: 'error',
      });
      return false;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching dashboard data:', error);
      }

      setSnackbar({
        open: true,
        message: error?.message || 'Failed to fetch dashboard data.',
        severity: 'error',
      });
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = async (_event, nextValue) => {
    if (!nextValue || nextValue === filterValue) return;

    setFilterValue(nextValue);
    await loadDashboardData({
      nextFilterValue: nextValue,
      nextBranchId: selectedBranchId,
    });
  };

  const handleStoreScopeChange = async (nextBranchId) => {
    if (nextBranchId === selectedBranchId) return;

    setSelectedBranchId(nextBranchId);
    await loadDashboardData({
      nextFilterValue: filterValue,
      nextBranchId,
    });
  };

  const handleProductsTabChange = (_event, nextValue) => {
    if (!nextValue || nextValue === productsTab) return;
    setProductsTab(nextValue);
  };

  const handleCustomersTabChange = (_event, nextValue) => {
    if (!nextValue || nextValue === customersTab) return;
    setCustomersTab(nextValue);
  };

  const handleFinanceTabChange = (_event, nextValue) => {
    if (!nextValue || nextValue === financeTab) return;
    setFinanceTab(nextValue);
  };

  const handleRefresh = async () => {
    await loadDashboardData({
      nextFilterValue: filterValue,
      nextBranchId: selectedBranchId,
    });
  };

  const closeSnackbar = () => {
    setSnackbar({
      open: false,
      message: '',
      severity: 'success',
    });
  };

  return {
    dashboardData,
    dashboardFilters,
    filterValue,
    selectedBranchId,
    productsTab,
    customersTab,
    financeTab,
    isRefreshing,
    isGeneratingAIForecast,
    snackbar,
    currencyData: DASHBOARD_CURRENCY,
    storeBranches: accessibleBranches,
    hasStoreScope,
    isRestrictedToAssignedStores,
    selectedStore,
    activeFilterLabel,
    storeScopeLabel,
    storeScopeHelperText,
    heroSummary: {
      ...dashboardDefaultHeroSummary,
      ...heroSummary,
    },
    metricCards,
    topProducts,
    topCustomers,
    inventoryAlerts,
    financeTrendData,
    aiInsightCards,
    hasDashboardData,
    handleFilterChange,
    handleStoreScopeChange,
    handleProductsTabChange,
    handleCustomersTabChange,
    handleFinanceTabChange,
    handleRefresh,
    closeSnackbar,
  };
}
