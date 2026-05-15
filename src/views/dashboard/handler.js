'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { getDashboardData } from '@/app/(dashboard)/dashboard/actions';
import {
	formatDateRangeLabel,
	normalizeDateValue,
} from '@/utils/dashboardDateUtils';

const DEFAULT_SNACKBAR = {
	open: false,
	message: '',
	severity: 'success',
};

export function useDashboardHandler({
	initialBranchId = '',
	initialFromDate = '',
	initialToDate = '',
}) {
	const initialRange = useMemo(
		() => ({
			fromDate: normalizeDateValue(initialFromDate),
			toDate: normalizeDateValue(initialToDate),
		}),
		[initialFromDate, initialToDate]
	);

	const [filteredDashboardData, setFilteredDashboardData] = useState(null);
	const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId || '');
	const [appliedDateRange, setAppliedDateRange] = useState(initialRange);
	const [draftDateRange, setDraftDateRange] = useState(initialRange);
	const [productsTab, setProductsTab] = useState('all');
	const [customersTab, setCustomersTab] = useState('all');
	const [financeTab, setFinanceTab] = useState('sales');
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [snackbar, setSnackbar] = useState(DEFAULT_SNACKBAR);

	const showSnackbar = useCallback((message, severity = 'error') => {
		setSnackbar({
			open: true,
			message,
			severity,
		});
	}, []);

	useEffect(() => {
		setFilteredDashboardData(null);
		setSelectedBranchId(initialBranchId || '');
		setAppliedDateRange(initialRange);
		setDraftDateRange(initialRange);
		setProductsTab('all');
		setCustomersTab('all');
		setFinanceTab('sales');
	}, [initialBranchId, initialRange]);

	const hasActiveDateRange = Boolean(appliedDateRange.fromDate && appliedDateRange.toDate);
	const dateRangeLabel = hasActiveDateRange
		? formatDateRangeLabel(appliedDateRange.fromDate, appliedDateRange.toDate)
		: 'All Time';
	const comparisonLabel = hasActiveDateRange ? 'vs prev range' : 'vs prev. week';

	const loadDashboardData = useCallback(
		async ({
			nextBranchId = selectedBranchId,
			nextFromDate = appliedDateRange.fromDate,
			nextToDate = appliedDateRange.toDate,
		} = {}) => {
			setIsRefreshing(true);

			try {
				const response = await getDashboardData({
					branchId: nextBranchId,
					fromDate: nextFromDate,
					toDate: nextToDate,
				});

				if (response?.code === 200) {
					setFilteredDashboardData(response?.data || {});
					return true;
				}

				showSnackbar(response?.message || 'Failed to fetch dashboard data.', 'error');
				return false;
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Error fetching dashboard data:', error);
				}

				showSnackbar(error?.message || 'Failed to fetch dashboard data.', 'error');
				return false;
			} finally {
				setIsRefreshing(false);
			}
		},
		[
			appliedDateRange.fromDate,
			appliedDateRange.toDate,
			selectedBranchId,
			showSnackbar,
		]
	);

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

	const handleDateRangeSelection = async ({ fromDate = '', toDate = '' } = {}) => {
		const nextRange = {
			fromDate: normalizeDateValue(fromDate),
			toDate: normalizeDateValue(toDate),
		};

		setDraftDateRange(nextRange);

		if (!nextRange.fromDate || !nextRange.toDate) return false;

		if (
			nextRange.fromDate === appliedDateRange.fromDate &&
			nextRange.toDate === appliedDateRange.toDate
		) {
			return true;
		}

		const isSuccessful = await loadDashboardData({
			nextBranchId: selectedBranchId,
			nextFromDate: nextRange.fromDate,
			nextToDate: nextRange.toDate,
		});

		if (isSuccessful) {
			setAppliedDateRange(nextRange);
			return true;
		}

		setDraftDateRange(appliedDateRange);
		return false;
	};

	const handleResetDateRange = async () => {
		const clearedRange = {
			fromDate: '',
			toDate: '',
		};

		setDraftDateRange(clearedRange);

		const isSuccessful = await loadDashboardData({
			nextBranchId: selectedBranchId,
			nextFromDate: '',
			nextToDate: '',
		});

		if (isSuccessful) {
			setAppliedDateRange(clearedRange);
			return;
		}

		setDraftDateRange(appliedDateRange);
	};

	const handleRefresh = async () => {
		await loadDashboardData({
			nextBranchId: selectedBranchId,
			nextFromDate: appliedDateRange.fromDate,
			nextToDate: appliedDateRange.toDate,
		});
	};

	const closeSnackbar = () => {
		setSnackbar(DEFAULT_SNACKBAR);
	};

	return {
		filteredDashboardData,
		productsTab,
		customersTab,
		financeTab,
		isRefreshing,
		draftFromDate: draftDateRange.fromDate,
		draftToDate: draftDateRange.toDate,
		dateRangeLabel,
		hasActiveDateRange,
		comparisonLabel,
		snackbar,
		showSnackbar,
		handleProductsTabChange,
		handleCustomersTabChange,
		handleFinanceTabChange,
		handleDateRangeSelection,
		handleResetDateRange,
		handleRefresh,
		closeSnackbar,
	};
}
