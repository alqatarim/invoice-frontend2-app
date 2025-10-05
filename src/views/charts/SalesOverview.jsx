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

	const hasData = (amounts || []).some((val) => Number(val) > 0);

	// Precompute status data for mapping, with safe fallbacks
	const statusData = (labels || []).map((label, idx) => {
		const option = statusOptions.find((opt) => opt.value === label) || {};
		return {
			label: option.label || label || `Status ${idx + 1}`,
			icon: option.icon || "ri-circle-fill",
			// color: option.color ? (theme.palette[option.color] || theme.palette.primary) : '#9f87ff',
			color: option.color,
			amount: amounts && amounts[idx] !== undefined ? amounts[idx] : 0,
			idx,
		};
	});

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

		colors: labels.map((label) => {
			return (
				theme.palette[
					statusOptions.find((option) => option.value === label).color
				].light || theme.palette.primary.light
			);
		}),
		stroke: { width: 0 },
		legend: { show: false },
		tooltip: { theme: "false" },
		dataLabels: { enabled: false },
		labels: labels,
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
						<AppReactApexCharts
							type="donut"
							width={width}
							height={height}
							series={amounts}
							options={options}
						/>
					</Grid>
					<Grid size={{ xs: "12" }}>
						<Divider className="mlb-6" />
						<Grid container className="flex flex-row justify-start gap-1">
							<Grid size={{ xs: 6, md: 3.5 }} className="">
								<Box className="flex items-center gap-2 mbe-1">
									<CustomAvatar
										size="2.35rem"
										skin="light"
										color="primary"
										variant="rounded"
									>
										<Icon
											icon={"mdi:invoice-text-outline"}
											color={theme.palette.primary}
											width={30}
										/>
									</CustomAvatar>

									<Typography variant="body2" className="text-[0.9rem]">
										Total
									</Typography>
								</Box>
								<Box className="flex items-center flex-row gap-1">
									<Icon
										icon="lucide:saudi-riyal"
										width="1.2rem"
										color={theme.palette.secondary.light}
									/>
									<Typography className="text-textPrimary font-medium text-[1.1rem]">
										{Number(amounts.reduce((a, b) => a + b, 0)).toFixed(2)}
									</Typography>
								</Box>
							</Grid>

							{statusData.map((status, i) => (
								<Grid
									size={{ xs: 6, md: 3.5 }}
									key={status.label + i}
									className=""
								>
									<Box className="flex items-center gap-2 mbe-1">
										<CustomAvatar
											size="2.35rem"
											skin="light"
											color={status.color}
											variant="rounded"
										>
											<Icon
												icon={status.icon}
												color={status.color}
												width={30}
											/>
										</CustomAvatar>

										<Typography variant="body2" className="text-[0.9rem]">
											{status.label}
										</Typography>
									</Box>
									<Box className="flex items-center flex-row gap-1">
										<Icon
											icon="lucide:saudi-riyal"
											width="1.2rem"
											color={theme.palette.secondary.light}
										/>
										<Typography className="text-textPrimary font-medium text-[1.1rem]">
											{Number(status.amount).toFixed(2)}
										</Typography>
									</Box>
								</Grid>
							))}
						</Grid>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default CardWidgetsSalesOverview;
