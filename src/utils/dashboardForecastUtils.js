'use client';

import { RIYAL_SYMBOL } from '@/utils/currencyUtils';

export const DASHBOARD_CURRENCY_LABEL = `Saudi Riyal (${RIYAL_SYMBOL})`;

export const getTrendDirection = (value = '') => {
	if (value === 'Increased') return 'positive';
	if (value === 'Decreased') return 'negative';
	return 'neutral';
};

export const buildForecastPayload = (sourceData = {}) => ({
	currency: DASHBOARD_CURRENCY_LABEL,
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
