'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Grid,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material';
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

import CustomAvatar from '@core/components/mui/Avatar';
import {
	dashboardFinanceTabs,
	dashboardInsightTabs,
} from '@/data/dataSets';
import { formatCompactNumber, formatWholeNumber } from '@/utils/numberUtils';
import { resolveApexColor } from '@/utils/apexColorUtils';
import { RIYAL_SYMBOL, RiyalIcon } from '@/utils/currencyUtils';

import { BusinessPulse } from './BusinessPulse';
import { CountUp } from './CountUp';
import { CustomerHealthCard } from './CustomerHealthCard';
import { UnifiedTopList } from './UnifiedTopList';
import AppReactApexCharts from '@/libs/styles/AppReactApexCharts';

const DASHBOARD_PANEL_HEIGHT = 295;

const SalesOverview = dynamic(() => import('@views/charts/SalesOverview'), {
	loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
});

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];

const fadeUp = {
	hidden: { opacity: 0, y: 18 },
	show: (delay = 0) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: EASE_OUT_EXPO, delay },
	}),
};

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
	aiInsightCards = [],
	metricCards = [],
	netIncome = { value: 0, margin: 0, direction: 'neutral', salesAmount: 0 },
	customerHealth = {},
	topProducts = [],
	topCustomers = [],
	inventoryAlerts = [],
	financeTrendData = {},
	businessPulseBackgroundShapes,
	handleProductsTabChange = () => { },
	handleCustomersTabChange = () => { },
	handleFinanceTabChange = () => { },
	handleDateRangeSelection = () => { },
	handleResetDateRange = () => { },
	handleRefresh = () => { },
}) => {
	const theme = useTheme();
	const { mode, systemMode } = useColorScheme();
	const currentMode = (mode === 'system' ? systemMode : mode) || 'light';

	const financeTrend = financeTrendData || {};
	const financeLabels = Array.isArray(financeTrend?.labels) ? financeTrend.labels : [];
	const financeSeries = financeTrend?.series || {};
	const activeFinanceSeries = financeSeries?.[financeTab] || {
		actual: [],
		forecast: [],
		growthPercentage: 0,
		forecastNext: 0,
	};

	// Where does the forecast begin? Used for the "today" annotation line.
	const firstFutureIndex = useMemo(() => {
		const explicit = Number(activeFinanceSeries?.firstFutureIndex);
		if (Number.isFinite(explicit) && explicit >= 0) return explicit;
		const actual = Array.isArray(activeFinanceSeries?.actual) ? activeFinanceSeries.actual : [];
		const idx = actual.findIndex(v => v === null || v === undefined);
		return idx >= 0 ? idx : Math.max(actual.length - 1, 0);
	}, [activeFinanceSeries]);

	const trendChartSeries = useMemo(() => {
		const actualData = Array.isArray(activeFinanceSeries?.actual)
			? activeFinanceSeries.actual.map(value =>
				value === null || value === undefined
					? null
					: Number.isFinite(Number(value))
						? Number(value)
						: 0
			)
			: [];

		let forecastData = Array.isArray(activeFinanceSeries?.forecast)
			? activeFinanceSeries.forecast.map(value => {
				const parsed = Number(value);
				return Number.isFinite(parsed) ? parsed : 0;
			})
			: [];

		if (forecastData.length > 0 && firstFutureIndex > 0) {
			const bridgeIndex = firstFutureIndex - 1;
			const bridgeValue = actualData?.[bridgeIndex];
			forecastData = forecastData.map((value, index) => {
				if (index === bridgeIndex && (value === null || value === undefined)) {
					return bridgeValue === null || bridgeValue === undefined
						? value
						: Number(bridgeValue);
				}
				return value;
			});
		}

		return [
			{ name: 'Actual', data: actualData },
			{ name: 'Forecast', data: forecastData },
		];
	}, [activeFinanceSeries, firstFutureIndex]);

	const hasTrendData = trendChartSeries.some(
		series =>
			Array.isArray(series?.data) &&
			series.data.some(value => value !== null && value !== undefined)
	);

	const apexThemeColors = useMemo(
		() => ({
			primary: resolveApexColor(theme.palette.primary.main, '#7367F0'),
			secondaryAccent: resolveApexColor(theme.palette.info.main, '#00CFE8'),
			grid: resolveApexColor(
				alpha(theme.palette.divider, 0.5),
				'rgba(168, 170, 174, 0.4)'
			),
			axis: resolveApexColor(
				theme.palette.text.secondary,
				currentMode === 'dark' ? 'rgba(231, 227, 252, 0.6)' : 'rgba(47, 43, 61, 0.6)'
			),
			fore: resolveApexColor(
				theme.palette.text.primary,
				currentMode === 'dark' ? 'rgba(231, 227, 252, 0.9)' : 'rgba(47, 43, 61, 0.9)'
			),
			divider: resolveApexColor(
				alpha(theme.palette.text.primary, 0.35),
				'rgba(47, 43, 61, 0.35)'
			),
		}),
		[
			currentMode,
			theme.palette.divider,
			theme.palette.info.main,
			theme.palette.primary.main,
			theme.palette.text.primary,
			theme.palette.text.secondary,
		]
	);

	const trendChartOptions = useMemo(() => {
		const todayLabel = financeLabels?.[firstFutureIndex - 1] || financeLabels?.[firstFutureIndex];

		return {
			chart: {
				toolbar: { show: false },
				parentHeightOffset: 0,
				foreColor: apexThemeColors.fore,
				dropShadow: {
					enabled: true,
					top: 6,
					left: 0,
					blur: 10,
					color: apexThemeColors.primary,
					opacity: 0.15,
				},
				animations: { enabled: true, easing: 'easeOutQuart', speed: 800 },
			},
			theme: { mode: currentMode },
			colors: [apexThemeColors.primary, apexThemeColors.secondaryAccent],
			stroke: {
				curve: 'smooth',
				width: [3, 2.4],
				dashArray: [0, 5],
			},
			fill: {
				type: 'gradient',
				gradient: {
					shade: currentMode,
					type: 'vertical',
					shadeIntensity: 0.6,
					opacityFrom: currentMode === 'dark' ? 0.5 : 0.32,
					opacityTo: 0.02,
					stops: [0, 100],
				},
			},
			grid: {
				borderColor: apexThemeColors.grid,
				strokeDashArray: 6,
				xaxis: { lines: { show: false } },
				padding: { left: 18, right: 12, top: 8, bottom: 0 },
			},
			xaxis: {
				categories: financeLabels,
				tickPlacement: 'on',
				labels: {
					style: {
						colors: financeLabels.map(() => apexThemeColors.axis),
						fontSize: '11px',
						fontWeight: 500,
					},
				},
				axisBorder: { show: false },
				axisTicks: { show: false },
			},
			yaxis: {
				labels: {
					minWidth: 42,
					offsetX: -6,
					style: {
						colors: [apexThemeColors.axis],
						fontSize: '11px',
						fontWeight: 500,
					},
					formatter: value => formatCompactNumber(value),
				},
			},
			markers: {
				size: [0, 0],
				strokeWidth: 2,
				strokeColors: theme.palette.background.paper,
				hover: { size: 6 },
			},
			tooltip: {
				theme: currentMode,
				shared: true,
				intersect: false,
				y: {
					formatter: value =>
						value === null || value === undefined
							? '—'
							: `${RIYAL_SYMBOL} ${formatWholeNumber(value)}`,
				},
			},
			dataLabels: { enabled: false },
			legend: {
				show: true,
				position: 'top',
				horizontalAlign: 'right',
				fontSize: '12px',
				labels: { colors: apexThemeColors.fore },
				itemMargin: { horizontal: 10, vertical: 0 },
				markers: { width: 10, height: 10, radius: 5 },
			},
			annotations: {
				xaxis:
					todayLabel && firstFutureIndex > 0
						? [
							{
								x: todayLabel,
								strokeDashArray: 4,
								borderColor: apexThemeColors.divider,
								label: {
									borderColor: 'transparent',
									style: {
										color: apexThemeColors.fore,
										background: 'transparent',
										fontSize: '10px',
										fontWeight: 600,
									},
									text: 'NOW',
									offsetY: -2,
								},
							},
						]
						: [],
			},
		};
	}, [
		financeLabels,
		firstFutureIndex,
		currentMode,
		apexThemeColors,
		theme.palette.background.paper,
	]);

	const forecastNextValue = Number(activeFinanceSeries?.forecastNext || 0);
	const forecastGrowth = Number(activeFinanceSeries?.growthPercentage || 0);
	const forecastLabel = financeLabels?.[firstFutureIndex] || 'Next period';

	return (
		<Grid container spacing={6}>
			{/* ── HERO: BUSINESS PULSE ───────────────────────────────────── */}
			<Grid size={{ xs: 12 }}>
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
			</Grid>

			{/* ── REVENUE TREND + SALES OVERVIEW ─────────────────────────── */}
			<Grid size={{ xs: 12, lg: 8 }}>
				<Card
					component={motion.div}
					variants={fadeUp}
					initial="hidden"
					animate="show"
					custom={0.2}
					sx={{ height: '100%' }}
				>
					<CardHeader
						title={
							<Stack direction="row" alignItems="center" spacing={1.2}>
								<Typography variant="h6" sx={{ fontWeight: 600 }}>
									Revenue Trend
								</Typography>
								{isGeneratingAIForecast ? (
									<Box
										component={motion.span}
										animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
										transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
										sx={{
											width: 7,
											height: 7,
											borderRadius: '50%',
											background: theme.palette.primary.main,
											display: 'inline-block',
										}}
									/>
								) : null}
							</Stack>
						}
						subheader={
							<Typography variant="caption" color="text.secondary">
								Actuals · 3-month AI forecast horizon
							</Typography>
						}
						action={
							<ToggleButtonGroup
								color="primary"
								size="small"
								exclusive
								value={financeTab}
								onChange={handleFinanceTabChange}
							>
								{dashboardFinanceTabs.map(tab => (
									<ToggleButton key={tab.value} value={tab.value} sx={{ px: 1.5 }}>
										{tab.label}
									</ToggleButton>
								))}
							</ToggleButtonGroup>
						}
					/>
					<CardContent sx={{ pt: 0 }}>
						<Stack spacing={3}>
							{/* Forecast highlight line */}
							<Stack
								direction={{ xs: 'column', sm: 'row' }}
								spacing={1.5}
								alignItems={{ xs: 'flex-start', sm: 'center' }}
								justifyContent="space-between"
								sx={{
									p: 1.5,
									borderRadius: 2,
									backgroundColor: alpha(theme.palette.primary.main, 0.04),
									border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
								}}
							>
								<Stack direction="row" spacing={1.5} alignItems="center">
									<CustomAvatar color="primary" skin="light" variant="rounded" size={32}>
										<Icon icon="ri-sparkling-2-line" width="1rem" />
									</CustomAvatar>
									<Box>
										<Typography
											variant="caption"
											sx={{
												color: 'text.secondary',
												letterSpacing: 0.5,
												textTransform: 'uppercase',
												fontSize: '0.65rem',
												fontWeight: 600,
											}}
										>
											AI forecast · {forecastLabel}
										</Typography>
										<Stack direction="row" spacing={0.4} alignItems="center">
											<RiyalIcon width="0.85rem" color={theme.palette.text.primary} />
											<Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
												<CountUp value={forecastNextValue} formatter={formatCompactNumber} />
											</Typography>
										</Stack>
									</Box>
								</Stack>

								<Box
									sx={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 0.5,
										px: 1.2,
										py: 0.5,
										borderRadius: 1,
										backgroundColor: alpha(
											forecastGrowth >= 0
												? theme.palette.success.main
												: theme.palette.error.main,
											0.12
										),
										color:
											forecastGrowth >= 0
												? theme.palette.success.main
												: theme.palette.error.main,
									}}
								>
									<Icon
										icon={forecastGrowth >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}
										width="0.9rem"
									/>
									<Typography variant="caption" sx={{ fontWeight: 700 }}>
										{Math.abs(forecastGrowth).toFixed(1)}% vs latest
									</Typography>
								</Box>
							</Stack>

							{/* Chart */}
							<Box>
								{hasTrendData ? (
									<AppReactApexCharts
										type="area"
										height={320}
										width="100%"
										options={trendChartOptions}
										series={trendChartSeries}
									/>
								) : (
									<Box
										sx={{
											height: 320,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Typography variant="body2" color="text.secondary">
											No trend data available.
										</Typography>
									</Box>
								)}
							</Box>

							{/* AI signals */}
							{aiInsightCards.length > 0 ? (
								<Stack spacing={1.2}>
									<Stack direction="row" alignItems="center" spacing={1}>
										<Icon
											icon="ri-sparkling-line"
											width="1rem"
											style={{ color: theme.palette.primary.main }}
										/>
										<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
											AI Forecast Signals
										</Typography>
									</Stack>
									<Box
										sx={{
											display: 'grid',
											gridTemplateColumns: {
												xs: '1fr',
												md: 'repeat(2, minmax(0, 1fr))',
											},
											gap: 1.2,
										}}
									>
										{aiInsightCards.slice(0, 6).map((card, index) => {
											const categoryColor =
												card?.type === 'sales'
													? 'primary'
													: card?.type === 'purchases'
														? 'warning'
														: card?.type === 'profitability'
															? 'success'
															: 'info';

											return (
												<Box
													component={motion.div}
													key={`ai-card-${index}`}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														duration: 0.4,
														ease: EASE_OUT_EXPO,
														delay: 0.4 + index * 0.06,
													}}
													whileHover={{ y: -2 }}
													sx={{
														p: 1.5,
														borderRadius: 1.5,
														border: `1px solid ${alpha(
															theme.palette[categoryColor].main,
															0.18
														)}`,
														backgroundColor: alpha(theme.palette[categoryColor].main, 0.04),
														transition: 'border-color 0.25s ease, background-color 0.25s ease',
														'&:hover': {
															borderColor: alpha(theme.palette[categoryColor].main, 0.35),
															backgroundColor: alpha(theme.palette[categoryColor].main, 0.07),
														},
													}}
												>
													<Stack direction="row" spacing={1} alignItems="center">
														<CustomAvatar
															size={22}
															skin="light"
															color={categoryColor}
															variant="rounded"
														>
															<Icon icon={card?.icon || 'ri-lightbulb-line'} width="0.8rem" />
														</CustomAvatar>
														<Typography variant="caption" sx={{ fontWeight: 700 }}>
															{card?.title || 'Signal'}
														</Typography>
													</Stack>
													<Typography
														variant="caption"
														color="text.primary"
														sx={{ display: 'block', mt: 0.8, lineHeight: 1.5 }}
													>
														{card?.text || ''}
													</Typography>
												</Box>
											);
										})}
									</Box>
								</Stack>
							) : null}
						</Stack>
					</CardContent>
				</Card>
			</Grid>

			<Grid size={{ xs: 12, lg: 4 }}>
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
			</Grid>

			{/* ── UNIFIED TOP LIST + CUSTOMER HEALTH ─────────────────────── */}
			<Grid size={{ xs: 12, lg: 8 }}>
				<UnifiedTopList
					products={topProducts}
					customers={topCustomers}
					stockAlerts={inventoryAlerts}
					productsTab={productsTab}
					customersTab={customersTab}
					tabs={dashboardInsightTabs}
					onProductsTabChange={handleProductsTabChange}
					onCustomersTabChange={handleCustomersTabChange}
					panelHeight={DASHBOARD_PANEL_HEIGHT}
					delay={0.4}
				/>
			</Grid>

			<Grid size={{ xs: 12, lg: 4 }}>
				<CustomerHealthCard
					data={customerHealth}
					panelHeight={DASHBOARD_PANEL_HEIGHT}
					delay={0.5}
				/>
			</Grid>
		</Grid>
	);
};

export default Dashboard;
