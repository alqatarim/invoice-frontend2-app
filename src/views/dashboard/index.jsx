'use client';

import React from 'react';

import { Button, Paper, Stack, Typography } from '@mui/material';

import AppSnackbar from '@/components/shared/AppSnackbar';

import Dashboard from './Dashboard';
import { useDashboardDerivedData } from './useDashboardDerivedData';
import { useDashboardForecast } from './useDashboardForecast';
import { useDashboardHandler } from './handler';

const DashboardIndex = ({
	initialDashboardData = null,
	initialBranchId = '',
	initialFromDate = '',
	initialToDate = '',
}) => {
	const handler = useDashboardHandler({
		initialBranchId,
		initialFromDate,
		initialToDate,
	});

	const activeDashboardData = handler.filteredDashboardData || initialDashboardData || {};
	const hasDashboardData = Boolean(
		activeDashboardData && Object.keys(activeDashboardData).length > 0
	);

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

	if (!hasDashboardData) {
		return (
			<>
				<Paper className="flex flex-col items-center gap-4 p-8 text-center">
					<Stack spacing={1}>
						<Typography variant="h6">Unable to load dashboard data.</Typography>
						<Typography variant="body2" color="text.secondary">
							Refresh to retry the initial dashboard request.
						</Typography>
					</Stack>

					<Button
						variant="contained"
						onClick={handler.handleRefresh}
						disabled={handler.isRefreshing}
					>
						{handler.isRefreshing ? 'Retrying...' : 'Retry'}
					</Button>
				</Paper>

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
	}

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
				aiInsightCards={aiInsightCards}
				metricCards={metricCards}
				netIncome={netIncome}
				customerHealth={customerHealth}
				topProducts={topProducts}
				topCustomers={topCustomers}
				inventoryAlerts={inventoryAlerts}
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
