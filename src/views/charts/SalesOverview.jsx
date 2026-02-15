"use client";

// Next Imports
import dynamic from "next/dynamic";

// MUI Imports
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import { Icon } from "@iconify/react";
// Components Imports
import CustomAvatar from "@core/components/mui/Avatar";
import OptionsMenu from "@core/components/option-menu";
import { statusOptions } from "@/data/dataSets";

// Styled Component Imports - Optimized loading
const AppReactApexCharts = dynamic(
	() => import("@/libs/styles/AppReactApexCharts"),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center h-64 bg-gray-100 animate-pulse rounded-lg">
				<div className="text-gray-500">Loading chart...</div>
			</div>
		),
	}
);

const CardWidgetsSalesOverview = ({
	series,
	labels,
	amounts,
	currencyData,
	width,
	height,
}) => {
	// Hooks
	const theme = useTheme();

	const safeAmounts = (amounts || []).map((val) => Number(val) || 0);
	const safeLabels = labels || [];
	const hasData = safeAmounts.some((val) => val > 0);

	// Precompute status data for mapping, with safe fallbacks
	const statusData = safeLabels.map((label, idx) => {
		const option = statusOptions.find((opt) => opt.value === label) || {};
		return {
			label: option.label || label || `Status ${idx + 1}`,
			icon: option.icon || "ri-circle-fill",
			color: option.color || "primary",
			amount: safeAmounts[idx] || 0,
			idx,
		};
	});

	// Don't render chart if there's no data yet
	if (!hasData || safeLabels.length === 0) {
		return (
			<Card>
				<CardHeader
					title="Invoices Overview"
					action={
						<OptionsMenu
							iconClassName="text-textPrimary"
							options={["Last 28 Days", "Last Month", "Last Year"]}
						/>
					}
				/>
				<CardContent>
					<Box className="flex items-center justify-center h-64">
						<Typography variant="body2" color="text.secondary">
							Loading chart data...
						</Typography>
					</Box>
				</CardContent>
			</Card>
		);
	}

	const options = {
		chart: {
			sparkline: { enabled: true },
			width: width,
			height: height,
		},
		grid: {
			padding: {
				left: 7,
				right: 7,
			},
		},

		colors: safeLabels.map((label) => {
			const found = statusOptions.find((option) => option.value === label);
			if (found && theme.palette[found.color]) {
				return theme.palette[found.color].light;
			}
			return theme.palette.primary.light;
		}),
		stroke: { width: 0 },
		legend: { show: false },
		tooltip: {
			theme: "false",
			y: {
				formatter: (value) => Number(value).toFixed(0),
			},
		},
		dataLabels: { enabled: false },
		labels: safeLabels,
		states: {
			hover: {
				filter: { type: "none" },
			},
			active: {
				filter: { type: "none" },
			},
		},
		plotOptions: {
			pie: {
				customScale: 1,
				donut: {
					size: "80",
					labels: {
						show: true,
						name: {
							offsetY: 25,
							fontSize: "0.875rem",
							color: "var(--mui-palette-text-secondary)",
						},
						value: {
							offsetY: -15,
							fontWeight: 500,
							fontSize: "24px",
							formatter: (value) => `${Number(value).toFixed(2)}`,
							color: "var(--mui-palette-text-primary)",
						},
						total: {
							show: true,
							fontSize: "0.875rem",
							label: "Invoices",
							color: "var(--mui-palette-text-secondary)",
							formatter: (w) => {
								const total = w.globals.series.reduce((a, b) => a + b, 0);
								return `${Number(total).toFixed(2)}`;
							},
						},
					},
				},
			},
		},
		responsive: [
			{
				breakpoint: 2300,
				options: { chart: { height: 257 } },
			},
			{
				breakpoint: theme.breakpoints.values,
				options: { chart: { height: 276 } },
			},
			{
				breakpoint: 1050,
				options: { chart: { height: 250 } },
			},
		],
	};

	return (
		<Card>
			<CardHeader
				title="Invoices Overview"
				action={
					<OptionsMenu
						iconClassName="text-textPrimary"
						options={["Last 28 Days", "Last Month", "Last Year"]}
					/>
				}
			/>
			<CardContent>
				<Grid container className="flex flex-col justify-between items-center">
					<Grid size={{ xs: "12" }}>
						<Box
							sx={{
								"& .apexcharts-tooltip": {
									background: "var(--mui-palette-background-paper) !important",
									color: "var(--mui-palette-text-primary) !important",
									// border: "1px solid var(--mui-palette-divider) !important",
									// borderRadius: "8px",
									// boxShadow: theme.shadows[6],
								},
								"& .apexcharts-tooltip-title": {
									background: "var(--mui-palette-background-default) !important",
									color: "var(--mui-palette-text-secondary) !important",
									borderBottom: "1px solid var(--mui-palette-divider) !important",
								},
								"& .apexcharts-tooltip-text, & .apexcharts-tooltip-text-y-label, & .apexcharts-tooltip-text-y-value":
								{
									color: "var(--mui-palette-text-primary) !important",
								},
							}}
						>
							<AppReactApexCharts
								type="donut"
								width={width}
								height={height}
								series={safeAmounts}
								options={options}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: "12" }}>
						<Divider className="mlb-6" />
						<Box className="flex flex-row justify-evenly gap-y-6 space-x-8 items-center flex-wrap">
							<Box className="flex flex-col justify-start items-center gap-1 flex-wrap">
								< Box className="flex flex-row items-center gap-2" >
									<CustomAvatar
										size={30}
										skin="light"
										color="primary"
										variant="rounded"
									>
										<Icon
											icon={"mdi:invoice-text-outline"}
											color={theme.palette.primary}
											width={20}
										/>
									</CustomAvatar>

									<Typography variant="body2" className="text-[0.9rem]">
										Total
									</Typography>
								</Box>
								<Box className="flex items-center flex-row gap-1">
									<Icon
										icon="lucide:saudi-riyal"
										width={15}
										color={theme.palette.secondary.light}
									/>
									<Typography variant='h6' className="text-[0.95rem]">
										{Number(safeAmounts.reduce((a, b) => a + b, 0)).toFixed(2)}
									</Typography>
								</Box>
							</Box>


							{statusData.map((status, i) => (
								<Box className="flex flex-col justify-start gap-1 flex-wrap">
									< Box className="flex flex-row items-center gap-2" >
										<CustomAvatar
											size={30}
											skin="light"
											color={status.color}
											variant="rounded"
										>
											<Icon
												icon={status.icon}
												color={status.color}
												width={20}
											/>
										</CustomAvatar>

										<Typography variant="body2" className="text-[0.87rem]">
											{status.label}
										</Typography>
									</Box>
									<Box key={status.label + i} className="flex items-center flex-row gap-1">
										<Icon
											icon="lucide:saudi-riyal"
											width={15}
											color={theme.palette.secondary.light}
										/>
										<Typography variant='h6' className="text-[0.95rem]">
											{Number(status.amount).toFixed(2)}
										</Typography>
									</Box>

								</Box>

							))}

						</Box>
					</Grid>
				</Grid>
			</CardContent >
		</Card >
	);
};

export default CardWidgetsSalesOverview;
