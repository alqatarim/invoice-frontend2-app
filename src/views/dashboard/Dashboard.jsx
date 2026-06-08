'use client';

import dynamic from 'next/dynamic';
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Grid,
	Skeleton,
	Stack,
} from '@mui/material';

import { dashboardInsightTabs } from '@/data/dataSets';

import { BusinessPulse } from './components/BusinessPulse';
import { CustomerHealthCard } from './components/CustomerHealthCard';
import { RevenueTrend } from './components/RevenueTrend';
import { SaudiDigitalMapCard } from './components/SaudiDigitalMapCard';
import { UnifiedTopList } from './components/UnifiedTopList';

const DASHBOARD_PANEL_MIN_HEIGHT = 295;

const SalesOverview = dynamic(() => import('@views/charts/SalesOverview'), {
	loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
});

const BusinessPulseSkeleton = () => (
	<Card sx={{ overflow: 'hidden' }}>
		<CardContent sx={{ p: { xs: 3, md: 4 } }}>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				justifyContent="space-between"
				alignItems={{ xs: 'flex-start', md: 'center' }}
				spacing={2}
			>
				<Box sx={{ flex: 1 }}>
					<Skeleton variant="text" width={140} height={20} />
					<Skeleton variant="text" width={260} height={48} sx={{ mt: 0.5 }} />
					<Skeleton variant="text" width={200} height={20} />
				</Box>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Skeleton variant="rounded" width={170} height={36} />
					<Skeleton variant="circular" width={36} height={36} />
				</Stack>
			</Stack>

			<Box
				sx={{
					mt: 3,
					display: 'grid',
					gridTemplateColumns: {
						xs: 'repeat(2, minmax(0, 1fr))',
						md: 'repeat(4, minmax(0, 1fr))',
					},
					gap: 2,
				}}
			>
				{[0, 1, 2, 3].map((index) => (
					<Skeleton key={index} variant="rounded" height={120} />
				))}
			</Box>
		</CardContent>
	</Card>
);

const SalesOverviewSkeleton = () => (
	<Card sx={{ width: '100%', height: '100%' }}>
		<CardHeader
			title={<Skeleton variant="text" width={140} height={28} />}
			subheader={<Skeleton variant="text" width={180} height={18} />}
		/>
		<CardContent>
			<Stack alignItems="center" spacing={2.5} sx={{ py: 2 }}>
				<Skeleton variant="circular" width={180} height={180} />
				<Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
					{[0, 1, 2, 3].map((index) => (
						<Skeleton key={index} variant="rounded" width={70} height={20} />
					))}
				</Stack>
			</Stack>
		</CardContent>
	</Card>
);

const SaudiDigitalMapSkeleton = () => (
	<Card sx={{ height: '100%', minHeight: { xs: 360, md: 510 }, overflow: 'hidden' }}>
		<CardContent sx={{ height: '100%', p: { xs: 2.5, md: 3 } }}>
			<Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
				<Box>
					<Skeleton variant="text" width={140} height={28} />
					<Skeleton variant="text" width={150} height={18} />
				</Box>
				<Skeleton variant="rounded" width={36} height={36} />
			</Stack>
			<Stack alignItems="center" justifyContent="center" sx={{ height: 'calc(100% - 76px)' }}>
				<Skeleton variant="rounded" width="86%" height={365} sx={{ borderRadius: 6 }} />
			</Stack>
		</CardContent>
	</Card>
);

const UnifiedTopListSkeleton = ({ panelMinHeight = DASHBOARD_PANEL_MIN_HEIGHT }) => (
	<Card sx={{ width: '100%', height: '100%', minHeight: panelMinHeight }}>
		<CardHeader
			title={<Skeleton variant="text" width={150} height={28} />}
			action={<Skeleton variant="rounded" width={160} height={32} />}
		/>
		<CardContent>
			<Stack spacing={1.5}>
				{[0, 1, 2, 3, 4].map((index) => (
					<Stack key={index} direction="row" spacing={2} alignItems="center">
						<Skeleton variant="circular" width={36} height={36} />
						<Box sx={{ flex: 1 }}>
							<Skeleton variant="text" width="55%" height={18} />
							<Skeleton variant="text" width="35%" height={14} />
						</Box>
						<Skeleton variant="text" width={70} height={18} />
					</Stack>
				))}
			</Stack>
		</CardContent>
	</Card>
);

const CustomerHealthSkeleton = ({ panelMinHeight = DASHBOARD_PANEL_MIN_HEIGHT }) => (
	<Card sx={{ width: '100%', height: '100%', minHeight: panelMinHeight }}>
		<CardHeader
			title={<Skeleton variant="text" width={170} height={28} />}
			subheader={<Skeleton variant="text" width={140} height={18} />}
		/>
		<CardContent>
			<Stack spacing={2}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="rounded" height={70} />
				))}
			</Stack>
		</CardContent>
	</Card>
);

const Dashboard = ({
	dashboardData = {},
	productsTab = 'all',
	customersTab = 'all',
	financeTab = 'sales',
	draftFromDate = '',
	draftToDate = '',
	dateRangeLabel = 'All Time',
	hasActiveDateRange = false,
	isRefreshing = false,
	isGeneratingAIForecast = false,
	isLoading = false,
	isFinanceTrendLoading = false,
	aiInsightCards = [],
	metricCards = [],
	netIncome = { value: 0, margin: 0, direction: 'neutral', salesAmount: 0 },
	customerHealth = {},
	topProducts = [],
	topCustomers = [],
	inventoryAlerts = [],
	stores = [],
	provincesCities = [],
	financeTrendData = {},
	businessPulseBackgroundShapes,
	handleProductsTabChange = () => { },
	handleCustomersTabChange = () => { },
	handleFinanceTabChange = () => { },
	handleDateRangeSelection = () => { },
	handleResetDateRange = () => { },
	handleRefresh = () => { },
}) => {
	return (
		<Grid container spacing={{ xs: 3, md: 6 }}>
			{/* ── HERO: BUSINESS PULSE ───────────────────────────────────── */}
			<Grid size={{ xs: 12 }}>
				{isLoading ? (
					<BusinessPulseSkeleton />
				) : (
					<BusinessPulse
						netIncome={netIncome.value}
						netMargin={netIncome.margin}
						netDirection={netIncome.direction}
						salesAmount={netIncome.salesAmount}
						periodLabel={dateRangeLabel}
						hasActivePeriod={hasActiveDateRange}
						isRefreshing={isRefreshing}
						isAiActive={isGeneratingAIForecast}
						metricCards={metricCards}
						draftFromDate={draftFromDate}
						draftToDate={draftToDate}
						onApplyDateRange={handleDateRangeSelection}
						onResetDateRange={handleResetDateRange}
						onRefresh={handleRefresh}
						// backgroundShapes={businessPulseBackgroundShapes}
						backgroundShapes={['circle']}
					/>
				)}
			</Grid>

			{/* ── REVENUE TREND + SAUDI NETWORK MAP ──────────────────────── */}
			<Grid size={{ xs: 12, lg: 7.25 }}>
				<RevenueTrend
					financeTab={financeTab}
					financeTrendData={financeTrendData}
					isGeneratingAIForecast={isGeneratingAIForecast}
					isLoading={isFinanceTrendLoading}
					aiInsightCards={aiInsightCards}
					onFinanceTabChange={handleFinanceTabChange}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 6, lg: 4.75 }}>
				{isLoading ? (
					<SaudiDigitalMapSkeleton />
				) : (
					<SaudiDigitalMapCard stores={stores} provincesCities={provincesCities} />
				)}
			</Grid>

			{/* ── TOP LIST + INVOICE INSIGHTS + CUSTOMER HEALTH ──────────── */}
			<Grid size={{ xs: 12, md: 6, lg: 6 }} sx={{ display: 'flex' }}>
				{isLoading ? (
					<UnifiedTopListSkeleton panelMinHeight={DASHBOARD_PANEL_MIN_HEIGHT} />
				) : (
					<UnifiedTopList
						products={topProducts}
						customers={topCustomers}
						stockAlerts={inventoryAlerts}
						productsTab={productsTab}
						customersTab={customersTab}
						tabs={dashboardInsightTabs}
						onProductsTabChange={handleProductsTabChange}
						onCustomersTabChange={handleCustomersTabChange}
						panelMinHeight={DASHBOARD_PANEL_MIN_HEIGHT}
						delay={0.4}
					/>
				)}
			</Grid>

			<Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ display: 'flex' }}>
				{isLoading ? (
					<SalesOverviewSkeleton />
				) : (
					<SalesOverview
						labels={dashboardData?.labels || []}
						statusCounts={dashboardData?.series || []}
						amounts={[
							dashboardData?.paidAmt || 0,
							dashboardData?.draftedAmt || 0,
							dashboardData?.overdueAmt || 0,
							dashboardData?.partiallyPaidAmt || 0,
						]}
						activeFilterLabel={dateRangeLabel}
					/>
				)}
			</Grid>

			<Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ display: 'flex' }}>
				{isLoading ? (
					<CustomerHealthSkeleton panelMinHeight={DASHBOARD_PANEL_MIN_HEIGHT} />
				) : (
					<CustomerHealthCard
						data={customerHealth}
						panelMinHeight={DASHBOARD_PANEL_MIN_HEIGHT}
						delay={0.5}
					/>
				)}
			</Grid>
		</Grid>
	);
};

export default Dashboard;
