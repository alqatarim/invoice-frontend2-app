'use client';

import React, { useEffect, useMemo, useState } from 'react';

import AppSnackbar from '@/components/shared/AppSnackbar';

import Dashboard from './Dashboard';
import { useDashboardDerivedData } from './useDashboardDerivedData';
import { useDashboardForecast } from './useDashboardForecast';
import { useDashboardHandler } from './handler';

const EMPTY_DASHBOARD = Object.freeze({});

const DashboardIndex = ({
	initialDashboardData = null,
	initialStores = [],
	initialProvincesCities = [],
	initialBranchId = '',
	initialFromDate = '',
	initialToDate = '',
}) => {
	const handler = useDashboardHandler({
		initialBranchId,
		initialFromDate,
		initialToDate,
	});
	const { handleRefresh } = handler;
	const [hasRequestedInitialData, setHasRequestedInitialData] = useState(
		Boolean(initialDashboardData)
	);

	const activeDashboardData = useMemo(
		() => handler.filteredDashboardData || initialDashboardData || EMPTY_DASHBOARD,
		[handler.filteredDashboardData, initialDashboardData]
	);
	const hasDashboardData = activeDashboardData !== EMPTY_DASHBOARD;
	const isLoadingDashboardData =
		!hasDashboardData && (!hasRequestedInitialData || handler.isRefreshing);

	useEffect(() => {
		if (initialDashboardData || hasRequestedInitialData) return;

		setHasRequestedInitialData(true);
		handleRefresh();
	}, [handleRefresh, hasRequestedInitialData, initialDashboardData]);

	const {
		aiForecastData,
		aiInsightCards,
		isGeneratingAIForecast,
	} = useDashboardForecast({
		dashboardData: activeDashboardData,
		onError: handler.showSnackbar,
	});

	const {
		metricCards,
		netIncome,
		customerHealth,
		topProducts,
		topCustomers,
		inventoryAlerts,
		financeTrendData,
	} = useDashboardDerivedData({
		dashboardData: activeDashboardData,
		aiForecastData,
		productsTab: handler.productsTab,
		customersTab: handler.customersTab,
		comparisonLabel: handler.comparisonLabel,
	});

	const isFinanceTrendLoading =
		isLoadingDashboardData || (hasDashboardData && isGeneratingAIForecast);

	return (
		<>
			<Dashboard
				dashboardData={activeDashboardData}
				productsTab={handler.productsTab}
				customersTab={handler.customersTab}
				financeTab={handler.financeTab}
				draftFromDate={handler.draftFromDate}
				draftToDate={handler.draftToDate}
				dateRangeLabel={handler.dateRangeLabel}
				hasActiveDateRange={handler.hasActiveDateRange}
				isRefreshing={handler.isRefreshing}
				isGeneratingAIForecast={isGeneratingAIForecast}
				isLoading={isLoadingDashboardData}
				isFinanceTrendLoading={isFinanceTrendLoading}
				aiInsightCards={aiInsightCards}
				metricCards={metricCards}
				netIncome={netIncome}
				customerHealth={customerHealth}
				topProducts={topProducts}
				topCustomers={topCustomers}
				inventoryAlerts={inventoryAlerts}
				stores={initialStores}
				provincesCities={initialProvincesCities}
				financeTrendData={financeTrendData}
				handleProductsTabChange={handler.handleProductsTabChange}
				handleCustomersTabChange={handler.handleCustomersTabChange}
				handleFinanceTabChange={handler.handleFinanceTabChange}
				handleDateRangeSelection={handler.handleDateRangeSelection}
				handleResetDateRange={handler.handleResetDateRange}
				handleRefresh={handler.handleRefresh}
			/>

			<AppSnackbar
				open={handler.snackbar.open}
				message={handler.snackbar.message}
				severity={handler.snackbar.severity}
				onClose={handler.closeSnackbar}
				autoHideDuration={6000}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			/>
		</>
	);
};

export default DashboardIndex;
