'use client';

import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Skeleton,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material';
import { useColorScheme, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

import CustomAvatar from '@core/components/mui/Avatar';
import { dashboardEasing, dashboardFinanceTabs } from '@/data/dataSets';
import { RIYAL_SYMBOL } from '@/utils/currencyUtils';
import { formatCompactNumber, formatWholeNumber } from '@/utils/numberUtils';
import AppReactApexCharts from '@/libs/styles/AppReactApexCharts';

const fadeUp = {
	hidden: { opacity: 0, y: 18 },
	show: (delay = 0) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: dashboardEasing, delay },
	}),
};

export const RevenueTrend = ({
	financeTab = 'sales',
	financeTrendData = {},
	isLoading = false,
	aiInsightCards = [],
	onFinanceTabChange = () => { },
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

	// ApexCharts cannot read MUI CSS variables (var(--mui-palette-...)), so
	// we provide explicit colors keyed off the active color scheme. This also
	// avoids hydration/timing flicker where dark mode would render with light
	// axis/grid colors.
	const apexThemeColors = useMemo(() => {
		const isDark = currentMode === 'dark';

		return {
			primary: theme.palette.primary.main || '#7367F0',
			secondaryAccent: isDark ? '#00CFE8' : (theme.palette.info.main || '#00CFE8'),
			grid: isDark ? 'rgba(231, 227, 252, 0.12)' : 'rgba(47, 43, 61, 0.12)',
			axis: isDark ? 'rgba(231, 227, 252, 0.6)' : 'rgba(47, 43, 61, 0.6)',
			fore: isDark ? 'rgba(231, 227, 252, 0.9)' : 'rgba(47, 43, 61, 0.9)',
			divider: isDark ? 'rgba(231, 227, 252, 0.35)' : 'rgba(47, 43, 61, 0.35)',
			// paper: isDark ? '#312D4B' : '#FFFFFF',
		};
	}, [currentMode, theme.palette.primary.main, theme.palette.info.main]);

	const trendChartOptions = useMemo(() => {
		const todayLabel = financeLabels?.[firstFutureIndex - 1] || financeLabels?.[firstFutureIndex];

		return {
			chart: {
				toolbar: { show: false },
				parentHeightOffset: 0,
				background: 'transparent',
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
				strokeColors: apexThemeColors.paper,
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
	}, [financeLabels, firstFutureIndex, currentMode, apexThemeColors]);

	return (
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
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						Revenue Trend
					</Typography>
				}
				subheader={
					<Typography variant="caption" color="text.secondary">
						3-Month Actual vs. Forecast
					</Typography>
				}
				action={
					<ToggleButtonGroup
						color="primary"
						size="small"
						exclusive
						value={financeTab}
						onChange={onFinanceTabChange}
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
				<Stack spacing={5}>
					<Box>
						{isLoading && !hasTrendData ? (
							<Box sx={{ position: 'relative', height: 320 }}>
								<Skeleton
									variant="rounded"
									width="100%"
									height={320}
									sx={{ borderRadius: 2 }}
								/>
								<Stack
									direction="row"
									spacing={1}
									sx={{
										position: 'absolute',
										left: 18,
										bottom: 14,
										right: 14,
										justifyContent: 'space-between',
									}}
								>
									{[0, 1, 2, 3, 4, 5].map((index) => (
										<Skeleton
											key={index}
											variant="text"
											width={36}
											height={14}
										/>
									))}
								</Stack>
							</Box>
						) : hasTrendData ? (
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

					{isLoading && aiInsightCards.length === 0 ? (
						<Stack spacing={1.2}>
							<Skeleton variant="text" width={160} height={20} />
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
								{[0, 1, 2, 3].map((index) => (
									<Skeleton
										key={index}
										variant="rounded"
										height={70}
										sx={{ borderRadius: 1.5 }}
									/>
								))}
							</Box>
						</Stack>
					) : null}

					{aiInsightCards.length > 0 ? (
						<Stack spacing={2}>
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
									gap: 3.5,
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
												ease: dashboardEasing,
												delay: 0.4 + index * 0.06,
											}}
											// whileHover={{ y: -2 }}
											sx={{
												p: 2.5,
												borderRadius: 1.5,
												// border: `1px solid ${alpha(
												// 	theme.palette[categoryColor].main,
												// 	0.18
												// )}`,
												// backgroundColor: alpha(theme.palette[categoryColor].main, 0.04),
												// transition: 'border-color 0.25s ease, background-color 0.25s ease',
												// '&:hover': {
												// 	borderColor: alpha(theme.palette[categoryColor].main, 0.35),
												// 	backgroundColor: alpha(theme.palette[categoryColor].main, 0.07),
												// },
											}}
										>
											<Stack
												direction="row"
												spacing={2}
												alignItems="center"
												sx={{
													px: 2,
													py: 1,
													borderRadius: 0.8,
													display: 'inline-flex',
													width: 'fit-content',
													maxWidth: '100%',
													// border: `1px solid ${alpha(
													// 	theme.palette[categoryColor].main,
													// 	0.18
													// )}`,
													backgroundColor: theme.palette[categoryColor].lightestOpacity,
												}}
											>
												<Icon
													icon={card?.icon || 'ri-lightbulb-line'}
													color={theme.palette[categoryColor].main}
													width="1.3rem"
												/>
												<Typography
													variant="body2"
													color="text.primary"
													letterSpacing={0.2}
													sx={{ fontWeight: 600 }}
												>
													{card?.title || 'Signal'}
												</Typography>
											</Stack>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ display: 'block', mt: 0.8, lineHeight: 1.5, fontWeight: 500 }}
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
	);
};
