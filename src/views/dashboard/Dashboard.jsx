"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	CircularProgress,
	Grid,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { alpha, useColorScheme, useTheme } from "@mui/material/styles";
import CustomAvatar from "@core/components/mui/Avatar";
import { rgbaToHex } from "@/utils/rgbaToHex";

import {
	getDashboardData,
	getFilteredDashboardData,
	getAIForecastInsights,
} from "@/app/(dashboard)/actions";
import AppSnackbar from "@/components/shared/AppSnackbar";

const SalesOverview = dynamic(() => import("@views/charts/SalesOverview"), {
	loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
});

const AppReactApexCharts = dynamic(
	() => import("@/libs/styles/AppReactApexCharts"),
	{
		ssr: false,
		loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
	}
);

const DASHBOARD_FILTERS = [
	{ value: "all", label: "All Time", apiValue: "" },
	{ value: "week", label: "This Week", apiValue: "week" },
	{ value: "month", label: "This Month", apiValue: "month" },
	{ value: "year", label: "This Year", apiValue: "year" },
];

const getTrendPresentation = (trend = "neutral") => {
	if (trend === "positive") {
		return { color: "success", icon: "ri-arrow-up-line" };
	}
	if (trend === "negative") {
		return { color: "error", icon: "ri-arrow-down-line" };
	}
	return { color: "secondary", icon: "ri-subtract-line" };
};

const formatMoney = (value) =>
	Number(value || 0).toLocaleString("en-US", {
		maximumFractionDigits: 0,
	});

const getInitials = (value = "") =>
	String(value)
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() || "")
		.join("") || "NA";

const Dashboard = ({ initialDashboardData = null }) => {
	const theme = useTheme();
	const { mode, systemMode } = useColorScheme();
	const currentMode = (mode === "system" ? systemMode : mode) || "light";

	const [dashboardData, setDashboardData] = useState(initialDashboardData || {});
	const [filterValue, setFilterValue] = useState("all");
	const [productsTab, setProductsTab] = useState("all");
	const [customersTab, setCustomersTab] = useState("all");
	const [financeTab, setFinanceTab] = useState("sales");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [openSnackbar, setOpenSnackbar] = useState({
		open: false,
		message: "",
		type: "",
	});
	const [isGeneratingAIForecast, setIsGeneratingAIForecast] = useState(false);
	const [aiForecastData, setAiForecastData] = useState(null);
	const [aiInsightCards, setAiInsightCards] = useState([]);
	const aiForecastRequestRef = useRef(0);

	const currencyData = "SAR";

	const fetchDashboardData = useCallback(async (filter = "") => {
		setIsRefreshing(true);
		try {
			const response = filter
				? await getFilteredDashboardData(filter)
				: await getDashboardData();

			if (response?.code === 200) {
				const nextData = response?.data || {};
				setDashboardData(nextData);
				setAiForecastData(null);
				setAiInsightCards([]);
			} else {
				setOpenSnackbar({
					open: true,
					message: `Failed to fetch ${filter ? "filtered " : ""}dashboard data`,
					type: "error",
				});
			}
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Error fetching dashboard data:", error);
			}
			setOpenSnackbar({
				open: true,
				message: `Failed to fetch ${filter ? "filtered " : ""}dashboard data`,
				type: "error",
			});
		} finally {
			setIsRefreshing(false);
		}
	}, []);

	const handleFilterChange = async (_event, nextValue) => {
		if (!nextValue || nextValue === filterValue) return;

		setFilterValue(nextValue);
		const selectedFilter = DASHBOARD_FILTERS.find(
			(filter) => filter.value === nextValue
		);
		await fetchDashboardData(selectedFilter?.apiValue || "");
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

	const handleRefresh = useCallback(async () => {
		const selectedFilter = DASHBOARD_FILTERS.find(
			(filter) => filter.value === filterValue
		);
		await fetchDashboardData(selectedFilter?.apiValue || "");
	}, [fetchDashboardData, filterValue]);

	const generateAIForecast = useCallback(async (sourceData) => {
		const requestId = aiForecastRequestRef.current + 1;
		aiForecastRequestRef.current = requestId;

		setIsGeneratingAIForecast(true);
		try {
			const labels = sourceData?.financeTrend?.labels || [];
			if (!Array.isArray(labels) || labels.length === 0) {
				setAiForecastData(null);
				setAiInsightCards([]);
				return;
			}

			const response = await getAIForecastInsights({
				currency: currencyData,
				locale: "en-SA",
				region: "Saudi Arabia",
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

			if (requestId !== aiForecastRequestRef.current) return;

			if (response?.code === 200 && response?.data?.series) {
				setAiForecastData(response.data);
				setAiInsightCards(
					Array.isArray(response?.data?.insightCards)
						? response.data.insightCards
						: []
				);
			} else {
				setAiForecastData(null);
				setAiInsightCards([]);
				setOpenSnackbar({
					open: true,
					message: response?.message || "Failed to generate AI forecast. Showing baseline trend.",
					type: "error",
				});
			}
		} catch (error) {
			if (requestId !== aiForecastRequestRef.current) return;
			setAiForecastData(null);
			setAiInsightCards([]);
			setOpenSnackbar({
				open: true,
				message: error?.message || "Failed to generate AI forecast. Showing baseline trend.",
				type: "error",
			});
		} finally {
			if (requestId !== aiForecastRequestRef.current) return;
			setIsGeneratingAIForecast(false);
		}
	}, [currencyData]);

	useEffect(() => {
		generateAIForecast(dashboardData);
	}, [dashboardData, generateAIForecast]);

	const handleSnackbarClose = () => {
		setOpenSnackbar({ open: false, message: "", type: "" });
	};

	const activeFilterLabel = useMemo(() => {
		return (
			DASHBOARD_FILTERS.find((item) => item.value === filterValue)?.label ||
			"All Time"
		);
	}, [filterValue]);

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
		dashboardData?.received,
		dashboardData?.pending,
		dashboardData?.operations?.netBusinessFlow,
	]);

	const metricCards = useMemo(() => {
		const purchasesAmount = Number(dashboardData?.operations?.purchasesAmount || 0);
		const expensesAmount = Number(dashboardData?.operations?.expensesAmount || 0);
		const salesAmount = Number(dashboardData?.received || 0);

		return [
			{
				key: "purchases",
				title: "Purchases",
				value: formatMoney(purchasesAmount),
				suffix: currencyData,
				icon: "ri-shopping-cart-line",
				color: "warning",
				direction: "neutral",
				changeNumber: "0 %",
				subTitle: "current period",
			},
			{
				key: "customers",
				title: "Customers",
				value: Number(dashboardData?.customers || 0).toLocaleString("en-US"),
				icon: "ri-user-add-line",
				color: "primary",
				direction:
					dashboardData?.customerPercentage?.percentage === "Increased"
						? "positive"
						: dashboardData?.customerPercentage?.percentage === "Decreased"
							? "negative"
							: "neutral",
				changeNumber: dashboardData?.customerPercentage?.value || "0 %",
				subTitle: "vs previous week",
			},
			{
				key: "sales",
				title: "Sales",
				value: formatMoney(salesAmount),
				suffix: currencyData,
				icon: "ri-funds-line",
				color: "success",
				direction:
					dashboardData?.invoicedPercentage?.percentage === "Increased"
						? "positive"
						: dashboardData?.invoicedPercentage?.percentage === "Decreased"
							? "negative"
							: "neutral",
				changeNumber: dashboardData?.invoicedPercentage?.value || "0 %",
				subTitle: "vs previous week",
			},
			{
				key: "expenses",
				title: "Expenses",
				value: formatMoney(expensesAmount),
				suffix: currencyData,
				icon: "ri-money-dollar-circle-line",
				color: "secondary",
				direction: "neutral",
				changeNumber: "0 %",
				subTitle: "current period",
			},
		];
	}, [dashboardData, currencyData]);

	const financeTrend = aiForecastData || dashboardData?.financeTrend || {};
	const financeLabels = Array.isArray(financeTrend?.labels)
		? financeTrend.labels
		: [];
	const financeSeries = financeTrend?.series || {};
	const activeFinanceSeries = financeSeries?.[financeTab] || {
		actual: [],
		forecast: [],
		growthPercentage: 0,
		forecastNext: 0,
	};
	const forecastNextIndex = Number.isFinite(
		Number(activeFinanceSeries?.firstFutureIndex)
	)
		? Number(activeFinanceSeries.firstFutureIndex)
		: 3;
	const forecastNextLabel = financeLabels?.[forecastNextIndex] || "Next";

	const topProductsAll = Array.isArray(dashboardData?.topProductsAll)
		? dashboardData.topProductsAll
		: Array.isArray(dashboardData?.topProducts)
			? dashboardData.topProducts
			: [];
	const topProductsTrending = Array.isArray(dashboardData?.topProductsTrending)
		? dashboardData.topProductsTrending
		: [];
	const topProducts = productsTab === "trending" ? topProductsTrending : topProductsAll;

	const topCustomersAll = Array.isArray(dashboardData?.topCustomersAll)
		? dashboardData.topCustomersAll
		: Array.isArray(dashboardData?.topCustomers)
			? dashboardData.topCustomers
			: [];
	const topCustomersTrending = Array.isArray(dashboardData?.topCustomersTrending)
		? dashboardData.topCustomersTrending
		: [];
	const topCustomers =
		customersTab === "trending" ? topCustomersTrending : topCustomersAll;

	const inventoryAlerts = Array.isArray(dashboardData?.inventoryAlerts)
		? dashboardData.inventoryAlerts
		: [];

	const trendChartSeries = useMemo(
		() => {
			const actualData = Array.isArray(activeFinanceSeries?.actual)
				? activeFinanceSeries.actual.map((value) =>
					value === null || value === undefined
						? null
						: Number.isFinite(Number(value))
							? Number(value)
							: 0
				)
				: [];

			let forecastData = Array.isArray(activeFinanceSeries?.forecast)
				? activeFinanceSeries.forecast.map((value) => {
					const parsed = Number(value);
					return Number.isFinite(parsed) ? parsed : 0;
				})
				: [];

			if (forecastData.length > 0) {
				const firstFutureIndexRaw = Number.isFinite(
					Number(activeFinanceSeries?.firstFutureIndex)
				)
					? Number(activeFinanceSeries.firstFutureIndex)
					: actualData.findIndex((value) => value === null || value === undefined);
				const firstFutureIndex =
					firstFutureIndexRaw >= 0
						? firstFutureIndexRaw
						: Math.max(forecastData.length - 3, 0);
				const bridgeIndex = Math.max(firstFutureIndex - 1, 0);
				const bridgeValue = actualData?.[bridgeIndex];

				forecastData = forecastData.map((value, index) => {
					// Keep historical backtest points visible so users can compare
					// forecast vs actual for the current and prior 2 months.
					if (index === bridgeIndex && (value === null || value === undefined)) {
						return bridgeValue === null || bridgeValue === undefined
							? value
							: Number(bridgeValue);
					}
					return value;
				});
			}

			return [
				{
					name: "Actual",
					data: actualData,
				},
				{
					name: "Forecast",
					data: forecastData,
				},
			];
		},
		[activeFinanceSeries]
	);

	const hasTrendData = trendChartSeries.some(
		(series) =>
			Array.isArray(series?.data) &&
			series.data.some((value) => value !== null && value !== undefined)
	);

	const apexThemeColors = useMemo(
		() => {


			return {
				primary: theme.palette.primary.main,
				warning: theme.palette.warning.main,
				grid: alpha(theme.palette.secondary.main, 0.40),
				axis:
					currentMode === "dark" ? "#ffffff" : "#000000",
				// fore: ,
			};
		},
		[
			currentMode,
			theme.mainColorChannels,
			theme.palette.primary.main,
			theme.palette.secondary.main,
			theme.palette.warning.main,
		]
	);



	const trendChartOptions = useMemo(
		() => ({
			chart: {
				toolbar: { show: false },
				parentHeightOffset: 0,
				foreColor: apexThemeColors.fore,
			},
			theme: {
				mode: currentMode,
			},
			colors: [apexThemeColors.primary, apexThemeColors.warning],
			stroke: {
				curve: "smooth",
				width: [3, 2],
				dashArray: [0, 6],
			},
			fill: {
				type: ["solid", "solid"],
				opacity:
					currentMode === "dark" ? [0.22, 0.14] : [0.12, 0.07],
			},
			grid: {
				borderColor: apexThemeColors.grid,
				strokeDashArray: 5,
				xaxis: { lines: { show: true } },
				padding: { left: 18, right: 12, top: 8, bottom: 0 },
			},
			xaxis: {
				categories: financeLabels,
				tickPlacement: "on",
				labels: {
					style: {
						colors: financeLabels.map(() => apexThemeColors.axis),
						fontSize: "12px",
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
						fontSize: "12px",
						fontWeight: 500,
					},
					formatter: (value) =>
						Number(value || 0).toLocaleString("en-US", {
							maximumFractionDigits: 0,
						}),
				},
			},
			markers: {
				size: [4, 3],
				hover: { size: 6 },
			},
			tooltip: {
				theme: currentMode,
				y: {
					formatter: (value) =>
						`${Number(value || 0).toLocaleString("en-US", {
							maximumFractionDigits: 0,
						})} ${currencyData}`,
				},
			},
			dataLabels: { enabled: false },
			legend: {
				show: true,
				position: "top",
				horizontalAlign: "left",
				fontSize: "12px",
				labels: { colors: apexThemeColors.fore },
				itemMargin: { horizontal: 12, vertical: 0 },
				markers: { width: 10, height: 10, radius: 5 },
			},
		}),
		[currencyData, financeLabels, currentMode, apexThemeColors]
	);

	return (
		<Grid container spacing={6}>
			<Grid size={{ xs: 12 }}>
				<Card
					sx={{
						position: "relative",
						overflow: "hidden",
						border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
						backgroundColor: "var(--mui-palette-background-paper)",
						backgroundImage:
							"radial-gradient(130% 95% at -12% -35%, rgb(var(--mui-palette-primary-mainChannel) / 0.24) 0%, rgb(var(--mui-palette-primary-mainChannel) / 0.14) 42%, transparent 68%), radial-gradient(95% 78% at 112% -8%, rgb(var(--mui-palette-info-mainChannel) / 0.18) 0%, rgb(var(--mui-palette-info-mainChannel) / 0.09) 46%, transparent 64%)",
					}}
				>
					<Box
						sx={{
							position: "absolute",
							width: 260,
							height: 260,
							borderRadius: "50%",
							background: `radial-gradient(circle,
							${theme.palette.primary.lightOpacity
								} 0%, transparent 65%)`,
							right: -90,
							top: -110,
						}}
					/>
					<CardContent sx={{ position: "relative", p: { xs: 5, md: 6 } }}>
						<Grid container spacing={5} alignItems="center">
							<Grid size={{ xs: 12, md: 7 }}>
								<Stack spacing={3}>
									<Box>
										<Typography variant="h4" sx={{ mb: 1 }}>
											Revenue Intelligence Dashboard
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Track revenue momentum, profitability signals, product
											performance, customer quality, and inventory risk from one
											place.
										</Typography>
									</Box>

									<Stack
										direction={{ xs: "column", sm: "row" }}
										spacing={2}
										alignItems={{ xs: "stretch", sm: "center" }}
									>
										<ToggleButtonGroup
											color='primary'
											size="small"
											value={filterValue}
											exclusive
											onChange={handleFilterChange}
											disabled={isRefreshing}
										>
											{DASHBOARD_FILTERS.map((item) => (
												<ToggleButton
													key={item.value}
													value={item.value}
												>
													{item.label}
												</ToggleButton>
											))}
										</ToggleButtonGroup>

										<Button
											size="small"
											variant="outlined"
											onClick={handleRefresh}
											disabled={isRefreshing}
											startIcon={
												isRefreshing ? (
													<CircularProgress size={16} />
												) : (
													<Icon icon="ri-refresh-line" />
												)
											}
										>
											{isRefreshing ? "Refreshing" : "Refresh Data"}
										</Button>
									</Stack>

									<Stack
										direction={{ xs: "column", sm: "row" }}
										spacing={1.5}
										flexWrap="wrap"
										useFlexGap
									>
										<Chip
											size="small"
											variant="tonal"
											color={
												heroSummary.collectionRate >= 70
													? "success"
													: heroSummary.collectionRate >= 45
														? "warning"
														: "error"
											}
											label={`Collection Rate ${heroSummary.collectionRate.toFixed(1)}%`}
										/>
										<Chip
											size="small"
											variant="tonal"
											color={heroSummary.pendingExposure <= 30 ? "success" : "warning"}
											label={`Outstanding Exposure ${heroSummary.pendingExposure.toFixed(1)}%`}
										/>
										<Chip
											size="small"
											variant="tonal"
											color="info"
											label={`Scope: ${activeFilterLabel}`}
										/>
									</Stack>
								</Stack>
							</Grid>

							<Grid size={{ xs: 12, md: 5 }}>
								<Stack spacing={2}>
									{[
										{
											key: "invoiced",
											label: "Invoiced",
											value: heroSummary.invoiced,
											icon: "ri-file-chart-line",
											color: "primary",
										},
										{
											key: "received",
											label: "Received",
											value: heroSummary.received,
											icon: "ri-wallet-3-line",
											color: "success",
										},
										{
											key: "pending",
											label: "Pending",
											value: heroSummary.pending,
											icon: "ri-time-line",
											color: "warning",
										},
										{
											key: "net",
											label: "Net Flow",
											value: heroSummary.netBusinessFlow,
											icon: "ri-line-chart-line",
											color:
												heroSummary.netBusinessFlow >= 0 ? "success" : "error",
										},
									].map((item) => (
										<Box
											key={item.key}
											sx={{
												p: 3,
												borderRadius: 3,
												border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
												backgroundColor: "transparent",
											}}
										>
											<Stack direction="row" alignItems="center" spacing={3}>
												<CustomAvatar
													size={38}
													skin="light"
													color={item.color}
													variant="rounded"
												>
													<i className={`${item.icon} text-[20px]`} />
												</CustomAvatar>
												<Box>
													<Typography variant="body2" color="text.secondary">
														{item.label}
													</Typography>
													<Stack direction="row" alignItems="center" spacing={0.6}>
														<Icon
															icon="lucide:saudi-riyal"
															width="0.9rem"
															color={theme.palette.secondary.light}
														/>
														<Typography variant="h6">
															{formatMoney(item.value)}
														</Typography>
														{/* <Typography variant="caption" color="text.secondary">
															{currencyData}
														</Typography> */}
													</Stack>
												</Box>
											</Stack>
										</Box>
									))}
								</Stack>
							</Grid>
						</Grid>
					</CardContent>
				</Card>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Grid container spacing={4}>
					{metricCards.map((metric) => {
						const trendMeta = getTrendPresentation(metric.direction);

						return (
							<Grid key={metric.key} size={{ xs: 12, sm: 6, lg: 3 }}>
								<Card
									sx={{
										height: "100%",
										border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
										transition: "transform 0.2s ease, box-shadow 0.2s ease",
										"&:hover": {
											transform: "translateY(-2px)",
											boxShadow: theme.shadows[4],
										},
									}}
								>
									<CardContent sx={{ p: 4 }}>
										<Stack direction="row" justifyContent="space-between" mb={2.5}>
											<Box>
												<Typography variant="body2" color="text.secondary">
													{metric.title}
												</Typography>
												<Typography variant="h5" sx={{ mt: 1 }}>
													{metric.value}
													{metric.suffix ? ` ${metric.suffix}` : ""}
												</Typography>
											</Box>
											<CustomAvatar
												size={42}
												skin="light"
												color={metric.color}
												variant="rounded"
											>
												<i className={`${metric.icon} text-[22px]`} />
											</CustomAvatar>
										</Stack>

										<Stack
											direction="row"
											alignItems="center"
											justifyContent="space-between"
										// mb={1.5}
										>
											<Chip
												size="small"
												variant="tonal"
												color={trendMeta.color}
												label={
													<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
														<Icon icon={trendMeta.icon} width="0.9rem" />
														<span>{metric.changeNumber}</span>
													</Box>
												}
											/>
											<Typography variant="caption" color="text.secondary">
												{metric.subTitle}
											</Typography>
										</Stack>

									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			</Grid>

			<Grid size={{ xs: 12, lg: 8 }}>
				<Card sx={{ height: "100%" }}>
					<CardHeader
						title="Revenue Trend & AI Forecast"
						action={
							<ToggleButtonGroup
								color='primary'
								size='medium'
								exclusive
								value={financeTab}
								onChange={handleFinanceTabChange}
							>
								<ToggleButton value="sales">Sales</ToggleButton>
								<ToggleButton value="expenses">Expenses</ToggleButton>
								<ToggleButton value="profits">Profits</ToggleButton>
							</ToggleButtonGroup>
						}
					/>
					<CardContent sx={{ pt: 0 }}>
						<Stack spacing={3}>
							<Stack
								direction={{ xs: "column", md: "row" }}
								justifyContent="space-between"
								alignItems={{ xs: "flex-start", md: "center" }}
								spacing={2}
							>
								<Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
									{/* <Chip
										size="small"
										variant="tonal"
										color="primary"
										label={`Forecast ${forecastNextLabel}: ${formatMoney(
											activeFinanceSeries?.forecastNext || 0
										)} ${currencyData}`}
									/>
									<Chip
										size="small"
										variant="tonal"
										color={
											Number(activeFinanceSeries?.growthPercentage || 0) >= 0
												? "success"
												: "error"
										}
										label={`${Number(
											activeFinanceSeries?.growthPercentage || 0
										)}% vs previous month`}
									/> */}
									{isGeneratingAIForecast ? (
										<Chip
											size="small"
											variant="outlined"
											color="secondary"
											label="Updating AI forecast..."
										/>
									) : null}
								</Stack>

							</Stack>

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
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Typography variant="body2" color="text.secondary">
											No trend data available.
										</Typography>
									</Box>
								)}
							</Box>

							{aiInsightCards.length > 0 ? (
								<Stack spacing={1.2}>
									<Typography variant="subtitle2">AI Forecast Signals</Typography>
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: {
												xs: "1fr",
												md: "repeat(2, minmax(0, 1fr))",
											},
											gap: 1.2,
										}}
									>
										{aiInsightCards.slice(0, 6).map((card, index) => {
											const categoryColor =
												card?.type === "sales"
													? "primary"
													: card?.type === "purchases"
														? "warning"
														: card?.type === "profitability"
															? "success"
															: "info";

											return (
												<Box
													key={`ai-card-${index}`}
													sx={{
														p: 1.5,
														// borderRadius: 1.5,
														// border: `1px solid ${alpha(theme.palette[categoryColor].main, 0.28)}`,
														// backgroundColor: alpha(
														// 	theme.palette[categoryColor].main,
														// 	0.06
														// ),
													}}
												>
													<Stack direction="row" spacing={1} alignItems="center">
														<CustomAvatar
															size={24}
															skin="light"
															color={categoryColor}
															variant="rounded"
														>
															<Icon
																icon={card?.icon || "ri-lightbulb-line"}
																width="0.85rem"
															/>
														</CustomAvatar>
														<Typography variant="caption" sx={{ fontWeight: 500 }}>
															{card?.title || "Signal"}
														</Typography>
													</Stack>
													<Typography
														variant="caption"
														color="text.primary"
														sx={{ display: "block", mt: 0.8, lineHeight: 1.45 }}
													>
														{card?.text || ""}
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
					currencyData={currencyData}
					activeFilterLabel={activeFilterLabel}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Grid container spacing={4}>
					<Grid size={{ xs: 12, md: 4 }}>
						<Card sx={{ height: "100%" }}>
							<CardHeader
								title={
									<Stack direction="row" alignItems="center" spacing={3}>
										<CustomAvatar size={28} skin="light" color="primary" variant="rounded">
											<Icon icon="ri-shopping-bag-3-line" fontSize={16} />
										</CustomAvatar>
										<Typography variant="h6">Top Products</Typography>
									</Stack>
								}
								action={
									<ToggleButtonGroup
										color='primary'
										size='small'
										exclusive
										value={productsTab}
										onChange={handleProductsTabChange}
									>
										<ToggleButton value="all">All</ToggleButton>
										<ToggleButton value="trending">Trending</ToggleButton>
									</ToggleButtonGroup>
								}
							/>
							<CardContent sx={{ pt: 0 }}>
								<Stack spacing={0}>
									{topProducts.length === 0 ? (
										<Box
											sx={{
												py: 6,
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												gap: 1,
											}}
										>
											<CustomAvatar size={40} skin="light" color="secondary" variant="rounded">
												<Icon icon="ri-box-3-line" width={20} />
											</CustomAvatar>
											<Typography variant="body2" color="text.secondary">
												No product data available.
											</Typography>
										</Box>
									) : (
										topProducts.slice(0, 5).map((product, index) => (
											<Box
												key={`${product?.productId || product?.name}-${index}`}
												sx={{
													py: 2,
													px: 1,
													borderBottom:
														index < Math.min(topProducts.length, 5) - 1
															? `1px solid ${alpha(theme.palette.divider, 0.6)}`
															: "none",
													transition: "background-color 0.15s ease",
													"&:hover": {
														backgroundColor: alpha(theme.palette.action.hover, 0.04),
													},
												}}
											>
												<Stack
													direction="row"
													justifyContent="space-between"
													alignItems="center"
													spacing={1.5}
												>
													<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
														<Avatar
															src={product?.image || ""}
															variant="rounded"
															sx={{
																width: 38,
																height: 38,
																fontSize: "0.8rem",
																fontWeight: 600,
																bgcolor: alpha(theme.palette.primary.main, 0.1),
																color: theme.palette.primary.main,
															}}
														>
															{getInitials(product?.name)}
														</Avatar>
														<Box sx={{ minWidth: 0 }}>
															<Typography
																variant="body2"
																sx={{
																	fontWeight: 500,
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	whiteSpace: "nowrap",
																}}
															>
																{product?.name || "Unknown Product"}
															</Typography>
															<Typography variant="caption" color="text.disabled">
																{Number(product?.quantitySold || 0).toLocaleString("en-US")} sold
															</Typography>
														</Box>
													</Stack>
													<Stack alignItems="center" direction='row' spacing={1} sx={{ flexShrink: 0 }}>
														<Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
															{formatMoney(product?.revenue || 0)}

														</Typography>
														<Typography
															component="span"
															variant="overline"
															color="text.secondary"
															sx={{ ml: 0.5 }}
														>
															{currencyData}
														</Typography>
														{productsTab === "trending" && (
															<Chip
																size="small"
																variant="tonal"
																color={
																	Number(product?.growthPercentage || 0) >= 0
																		? "success"
																		: "error"
																}
																label={`${Number(product?.growthPercentage || 0) >= 0 ? "+" : ""}${Number(product?.growthPercentage || 0)}%`}
																sx={{ height: 20, fontSize: "0.7rem" }}
															/>
														)}
													</Stack>
												</Stack>
											</Box>
										))
									)}
								</Stack>
							</CardContent>
						</Card>
					</Grid>

					<Grid size={{ xs: 12, md: 4 }}>
						<Card sx={{ height: "100%" }}>
							<CardHeader
								title={
									<Stack direction="row" alignItems="center" spacing={3}>
										<CustomAvatar size={28} skin="light" color="info" variant="rounded">
											<Icon icon="ri-group-line" fontSize={16} />
										</CustomAvatar>
										<Typography variant="h6">Customer Insights</Typography>
									</Stack>
								}
								action={
									<ToggleButtonGroup
										color='info'
										size='small'
										exclusive
										value={customersTab}
										onChange={handleCustomersTabChange}
									>
										<ToggleButton value="all">All</ToggleButton>
										<ToggleButton value="trending">Trending</ToggleButton>
									</ToggleButtonGroup>
								}
							/>
							<CardContent sx={{ pt: 0 }}>
								<Stack spacing={0}>
									{topCustomers.length === 0 ? (
										<Box
											sx={{
												py: 6,
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												gap: 1,
											}}
										>
											<CustomAvatar size={40} skin="light" color="secondary" variant="rounded">
												<Icon icon="ri-user-3-line" width={20} />
											</CustomAvatar>
											<Typography variant="body2" color="text.secondary">
												No customer data available.
											</Typography>
										</Box>
									) : (
										topCustomers.slice(0, 5).map((customer, index) => (
											<Stack
												key={`${customer?.customerId || customer?.name}-${index}`}
												direction="row"
												justifyContent="space-between"
												alignItems="center"
												spacing={1.5}
												sx={{
													py: 2,
													px: 1,
													borderBottom:
														index < Math.min(topCustomers.length, 5) - 1
															? `1px solid ${alpha(theme.palette.divider, 0.6)}`
															: "none",
													transition: "background-color 0.15s ease",
													"&:hover": {
														backgroundColor: alpha(theme.palette.action.hover, 0.04),
													},
												}}
											>
												<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
													<Avatar
														src={customer?.image || ""}
														sx={{
															width: 38,
															height: 38,
															fontSize: "0.8rem",
															fontWeight: 600,
															bgcolor: alpha(theme.palette.info.main, 0.1),
															color: theme.palette.info.main,
														}}
													>
														{getInitials(customer?.name)}
													</Avatar>
													<Typography
														variant="body2"
														sx={{
															fontWeight: 500,
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
														}}
													>
														{customer?.name || "Customer"}
													</Typography>
												</Stack>
												<Stack alignItems="center" direction='row' spacing={1} sx={{ flexShrink: 0 }}>
													<Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
														{formatMoney(customer?.revenue || 0)}

													</Typography>

													<Typography
														component="span"
														variant="overline"
														color="text.secondary"
														sx={{ ml: 0.5 }}
													>
														{currencyData}
													</Typography>
													{customersTab === "trending" && (
														<Chip
															size="small"
															variant="tonal"
															color={
																Number(customer?.growthPercentage || 0) >= 0
																	? "success"
																	: "error"
															}
															label={`${Number(customer?.growthPercentage || 0) >= 0 ? "+" : ""}${Number(customer?.growthPercentage || 0)}%`}
															sx={{ height: 20, fontSize: "0.7rem" }}
														/>
													)}
												</Stack>
											</Stack>
										))
									)}
								</Stack>
							</CardContent>
						</Card>
					</Grid>

					<Grid size={{ xs: 12, md: 4 }}>
						<Card sx={{ height: "100%" }}>
							<CardHeader
								title={
									<Stack direction="row" alignItems="center" spacing={3}>
										<CustomAvatar size={28} skin="light" color="warning" variant="rounded">
											<Icon icon="ri-alert-line" fontSize={16} />
										</CustomAvatar>
										<Typography variant="h6">Stock Alert</Typography>
									</Stack>
								}
							/>
							<CardContent sx={{ pt: 0 }}>
								<Stack spacing={0}>
									{inventoryAlerts.length === 0 ? (
										<Box
											sx={{
												py: 6,
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												gap: 1,
											}}
										>
											<CustomAvatar size={40} skin="light" color="success" variant="rounded">
												<Icon icon="ri-check-line" width={20} />
											</CustomAvatar>
											<Typography variant="body2" color="text.secondary">
												All stock levels look healthy.
											</Typography>
										</Box>
									) : (
										inventoryAlerts.slice(0, 6).map((item, index) => {
											const severity = String(item?.severity || "warning");
											const chipColor =
												severity === "critical"
													? "error"
													: severity === "high"
														? "warning"
														: "info";
											const avatarColor =
												severity === "critical"
													? theme.palette.error.main
													: severity === "high"
														? theme.palette.warning.main
														: theme.palette.info.main;

											return (
												<Box
													key={`${item?.productId || item?.name}-${index}`}
													sx={{
														py: 2,
														px: 1,
														borderBottom:
															index < Math.min(inventoryAlerts.length, 6) - 1
																? `1px solid ${alpha(theme.palette.divider, 0.6)}`
																: "none",
														transition: "background-color 0.15s ease",
														"&:hover": {
															backgroundColor: alpha(theme.palette.action.hover, 0.04),
														},
													}}
												>
													<Stack
														direction="row"
														justifyContent="space-between"
														alignItems="center"
														spacing={1.5}
													>
														<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
															<Avatar
																sx={{
																	width: 36,
																	height: 36,
																	fontSize: "0.8rem",
																	fontWeight: 600,
																	bgcolor: alpha(avatarColor, 0.1),
																	color: avatarColor,
																}}
															>
																{getInitials(item?.name)}
															</Avatar>
															<Box sx={{ minWidth: 0 }}>
																<Typography
																	variant="body2"
																	sx={{
																		fontWeight: 500,
																		overflow: "hidden",
																		textOverflow: "ellipsis",
																		whiteSpace: "nowrap",
																	}}
																>
																	{item?.name || "Product"}
																</Typography>
																<Typography variant="caption" color="text.disabled">
																	Alert {Number(item?.alertQuantity || 0).toLocaleString("en-US")}
																	{" • "}
																	Shortfall {Number(item?.shortfall || 0).toLocaleString("en-US")}
																</Typography>
															</Box>
														</Stack>
														<Chip
															size="small"
															variant="outlined"
															color={chipColor}
															label={`${Number(item?.quantity || 0).toLocaleString("en-US")} left`}
															sx={{ height: 22, fontSize: "0.72rem", fontWeight: 600 }}
														/>
													</Stack>
												</Box>
											);
										})
									)}
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Grid>

			<AppSnackbar
				open={openSnackbar.open}
				message={openSnackbar.message}
				severity={openSnackbar.type || "success"}
				onClose={handleSnackbarClose}
				autoHideDuration={6000}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			/>
		</Grid>
	);
};

export default Dashboard;
