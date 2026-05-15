'use client';

import { useMemo } from 'react';

import { getTrendDirection } from '@/utils/dashboardForecastUtils';
import { formatWholeNumber } from '@/utils/numberUtils';

const getArray = value => (Array.isArray(value) ? value : []);

const buildSparkSeries = (source = {}, key) => {
	const actual = Array.isArray(source?.[key]?.actual) ? source[key].actual : [];

	return actual
		.filter(value => value !== null && value !== undefined)
		.map(value => Number(value) || 0);
};

const buildComparisonSpark = (previousValue = 0, currentValue = 0) => [
	Number(previousValue) || 0,
	Number(currentValue) || 0,
];

const buildCustomerSpark = dashboardData => {
	const base = Number(dashboardData?.customerInsights?.activeCustomers || 0);

	if (!base) return [0, 0, 0, 0, 0, 0];

	const newThisWeek = Number(dashboardData?.customerInsights?.newCustomersThisWeek || 0);
	const start = Math.max(base - newThisWeek, 0);
	const step = (base - start) / 5;

	return Array.from({ length: 6 }, (_, index) => Math.round(start + step * index));
};

const getDashboardList = (dashboardData, primaryKey, fallbackKey) => {
	if (Array.isArray(dashboardData?.[primaryKey])) return dashboardData[primaryKey];
	if (fallbackKey && Array.isArray(dashboardData?.[fallbackKey])) return dashboardData[fallbackKey];
	return [];
};

export function useDashboardDerivedData({
	dashboardData = {},
	aiForecastData = null,
	productsTab = 'all',
	customersTab = 'all',
	comparisonLabel = 'vs prev. week',
}) {
	const sparkSource = aiForecastData?.series || dashboardData?.financeTrend?.series || {};
	const operationsData = dashboardData?.operations || {};

	const salesSpark = useMemo(() => buildSparkSeries(sparkSource, 'sales'), [sparkSource]);
	const purchasesSpark = useMemo(() => {
		const trendSeries = buildSparkSeries(sparkSource, 'purchases');
		const comparisonSeries = buildComparisonSpark(
			operationsData?.previousPurchasesAmount,
			operationsData?.purchasesAmount
		);

		return trendSeries.length > 1 ? trendSeries : comparisonSeries;
	}, [
		operationsData?.previousPurchasesAmount,
		operationsData?.purchasesAmount,
		sparkSource,
	]);
	const expensesSpark = useMemo(() => buildSparkSeries(sparkSource, 'expenses'), [sparkSource]);

	const customerSpark = useMemo(
		() => buildCustomerSpark(dashboardData),
		[
			dashboardData?.customerInsights?.activeCustomers,
			dashboardData?.customerInsights?.newCustomersThisWeek,
		]
	);

	const metricCards = useMemo(() => {
		const operations = dashboardData?.operations || {};
		const purchasesAmount = Number(operations?.purchasesAmount || 0);
		const expensesAmount = Number(operations?.expensesAmount || 0);
		const salesAmount = Number(dashboardData?.received || 0);

		return [
			{
				key: 'sales',
				title: 'Sales',
				value: formatWholeNumber(salesAmount),
				rawValue: salesAmount,
				showRiyalIcon: true,
				icon: 'ri-funds-line',
				color: 'success',
				direction: getTrendDirection(dashboardData?.invoicedPercentage?.percentage),
				changeNumber: dashboardData?.invoicedPercentage?.value || '0%',
				subTitle: comparisonLabel,
				spark: salesSpark,
			},
			{
				key: 'purchases',
				title: 'Purchases',
				value: formatWholeNumber(purchasesAmount),
				rawValue: purchasesAmount,
				showRiyalIcon: true,
				icon: 'ri-shopping-cart-line',
				color: 'warning',
				direction: getTrendDirection(operations?.purchasesPercentage?.percentage),
				changeNumber: operations?.purchasesPercentage?.value || '0%',
				subTitle: comparisonLabel,
				spark: purchasesSpark,
			},
			{
				key: 'expenses',
				title: 'Expenses',
				value: formatWholeNumber(expensesAmount),
				rawValue: expensesAmount,
				showRiyalIcon: true,
				icon: 'ri-money-dollar-circle-line',
				color: 'secondary',
				direction: getTrendDirection(operations?.expensesPercentage?.percentage),
				changeNumber: operations?.expensesPercentage?.value || '0%',
				subTitle: comparisonLabel,
				spark: expensesSpark,
			},
			{
				key: 'customers',
				title: 'Customers',
				value: formatWholeNumber(dashboardData?.customers || 0),
				rawValue: Number(dashboardData?.customers || 0),
				icon: 'ri-user-add-line',
				color: 'primary',
				direction: getTrendDirection(dashboardData?.customerPercentage?.percentage),
				changeNumber: dashboardData?.customerPercentage?.value || '0%',
				subTitle: comparisonLabel,
				spark: customerSpark,
			},
		];
	}, [
		comparisonLabel,
		customerSpark,
		dashboardData?.customerPercentage?.percentage,
		dashboardData?.customerPercentage?.value,
		dashboardData?.customers,
		dashboardData?.invoicedPercentage?.percentage,
		dashboardData?.invoicedPercentage?.value,
		dashboardData?.operations,
		dashboardData?.received,
		expensesSpark,
		purchasesSpark,
		salesSpark,
	]);

	const netIncome = useMemo(() => {
		const operations = dashboardData?.operations || {};
		const value = Number(operations?.netBusinessFlow || 0);

		return {
			value,
			margin: Number(operations?.netMargin || 0),
			direction: value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral',
			salesAmount: Number(dashboardData?.received || 0),
		};
	}, [dashboardData?.operations, dashboardData?.received]);

	const customerHealth = useMemo(() => {
		const insights = dashboardData?.customerInsights || {};
		const total =
			Number(insights?.activeCustomers || 0) + Number(insights?.inactiveCustomers || 0);
		const repeatRate =
			total > 0
				? Math.round((Number(insights?.repeatCustomers || 0) / total) * 100)
				: 0;
		const activeRate =
			total > 0
				? Math.round((Number(insights?.activeCustomers || 0) / total) * 100)
				: 0;

		return {
			total,
			activeCustomers: Number(insights?.activeCustomers || 0),
			inactiveCustomers: Number(insights?.inactiveCustomers || 0),
			repeatCustomers: Number(insights?.repeatCustomers || 0),
			newCustomersThisWeek: Number(insights?.newCustomersThisWeek || 0),
			averageInvoiceValue: Number(insights?.averageInvoiceValue || 0),
			repeatRate,
			activeRate,
		};
	}, [dashboardData?.customerInsights]);

	const topProductsAll = useMemo(
		() => getDashboardList(dashboardData, 'topProductsAll', 'topProducts'),
		[dashboardData]
	);
	const topProductsTrending = useMemo(
		() => getArray(dashboardData?.topProductsTrending),
		[dashboardData?.topProductsTrending]
	);
	const topProducts = productsTab === 'trending' ? topProductsTrending : topProductsAll;

	const topCustomersAll = useMemo(
		() => getDashboardList(dashboardData, 'topCustomersAll', 'topCustomers'),
		[dashboardData]
	);
	const topCustomersTrending = useMemo(
		() => getArray(dashboardData?.topCustomersTrending),
		[dashboardData?.topCustomersTrending]
	);
	const topCustomers = customersTab === 'trending' ? topCustomersTrending : topCustomersAll;

	const inventoryAlerts = useMemo(
		() => getArray(dashboardData?.inventoryAlerts),
		[dashboardData?.inventoryAlerts]
	);

	return {
		metricCards,
		netIncome,
		customerHealth,
		topProducts,
		topCustomers,
		inventoryAlerts,
		financeTrendData: aiForecastData || dashboardData?.financeTrend || {},
		hasDashboardData: Boolean(dashboardData && Object.keys(dashboardData).length > 0),
	};
}
