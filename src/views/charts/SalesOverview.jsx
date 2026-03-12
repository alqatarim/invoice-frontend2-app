"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Icon } from "@iconify/react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import CardHeader from "@mui/material/CardHeader";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import { alpha } from "@mui/material/styles";

import CustomAvatar from "@core/components/mui/Avatar";
import { statusOptions } from "@/data/dataSets";

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

const STATUS_COLOR_FALLBACK = {
	PAID: "success",
	DRAFTED: "secondary",
	OVERDUE: "error",
	PARTIALLY_PAID: "warning",
	SENT: "info",
	UNPAID: "warning",
	REFUND: "secondary",
};

const APEX_STATUS_COLORS = {
	success: "#28C76F",
	secondary: "#A8AAAE",
	error: "#EA5455",
	warning: "#FF9F43",
	info: "#00CFE8",
	primary: "#7367F0",
};

const normalizeStatus = (value = "") =>
	String(value).trim().replace(/\s+/g, "_").toUpperCase();

const formatMoney = (value) =>
	Number(value || 0).toLocaleString("en-US", {
		maximumFractionDigits: 0,
	});

const CardWidgetsSalesOverview = ({
	labels = [],
	amounts = [],
	statusCounts = [],
	currencyData = "SAR",
	activeFilterLabel = "All Time",
	width = 265,
	height = 265,
}) => {
	const theme = useTheme();

	const statusOptionsMap = useMemo(() => {
		const map = new Map();
		statusOptions.forEach((option) => {
			map.set(normalizeStatus(option.value), option);
		});
		return map;
	}, []);

	const statusData = useMemo(() => {
		const defaultLabels =
			labels.length > 0 ? labels : ["PAID", "DRAFTED", "OVERDUE", "PARTIALLY_PAID"];

		return defaultLabels.map((status, index) => {
			const normalizedStatus = normalizeStatus(status);
			const foundStatus = statusOptionsMap.get(normalizedStatus);
			const color =
				foundStatus?.color ||
				STATUS_COLOR_FALLBACK[normalizedStatus] ||
				"primary";
			const amount = Number(amounts[index] || 0);

			return {
				key: normalizedStatus,
				label: foundStatus?.label || normalizedStatus.replace(/_/g, " "),
				icon: foundStatus?.icon || "ri-circle-line",
				color,
				amount,
				count: Number(statusCounts[index] || 0),
			};
		});
	}, [labels, amounts, statusCounts, statusOptionsMap]);

	const totalAmount = useMemo(
		() => statusData.reduce((sum, item) => sum + item.amount, 0),
		[statusData]
	);

	const hasData = statusData.some((item) => item.amount > 0);

	const statusDataWithShare = useMemo(() => {
		return statusData.map((item) => ({
			...item,
			share: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
		}));
	}, [statusData, totalAmount]);

	const dominantStatus = useMemo(() => {
		return (
			statusDataWithShare.reduce((top, current) => {
				if (current.amount > top.amount) return current;
				return top;
			}, statusDataWithShare[0] || { label: "N/A", amount: 0 }) || {
				label: "N/A",
				amount: 0,
			}
		);
	}, [statusDataWithShare]);

	const chartOptions = useMemo(() => {
		const chartColors = statusDataWithShare.map((item) => {
			return APEX_STATUS_COLORS[item.color] || APEX_STATUS_COLORS.primary;
		});

		return {
			chart: {
				type: "donut",
				sparkline: { enabled: true },
				width,
				height,
			},
			stroke: { width: 0 },
			dataLabels: { enabled: false },
			labels: statusDataWithShare.map((item) => item.label),
			legend: { show: false },
			colors: chartColors,
			plotOptions: {
				pie: {
					donut: {
						size: "74%",
						labels: {
							show: true,
							name: {
								show: true,
								offsetY: 14,
								fontSize: "0.82rem",
								color: "var(--mui-palette-text-secondary)",
							},
							value: {
								show: true,
								offsetY: -14,
								fontWeight: 600,
								fontSize: "1rem",
								formatter: (value) => formatMoney(value),
								color: "var(--mui-palette-text-primary)",
							},
							total: {
								show: true,
								label: `${currencyData} Total`,
								fontSize: "0.8rem",
								color: "var(--mui-palette-text-secondary)",
								formatter: () => formatMoney(totalAmount),
							},
						},
					},
				},
			},
			tooltip: {
				y: {
					formatter: (value) => `${formatMoney(value)} ${currencyData}`,
				},
			},
		};
	}, [statusDataWithShare, theme.palette, width, height, currencyData, totalAmount]);

	return (
		<Card sx={{ height: "100%" }}>
			<CardHeader
				title="Invoices Insights"
				subheader={`Distribution by amount • ${activeFilterLabel}`}
			// action={
			// 	<Chip
			// 		size="small"
			// 		variant="tonal"
			// 		color="primary"
			// 		label={`Top: ${dominantStatus?.label || "N/A"}`}
			// 	/>
			// }
			/>
			<CardContent sx={{ pt: 0 }}>
				{!hasData ? (
					<Box
						sx={{
							minHeight: 360,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: 1.5,
							color: "text.secondary",
						}}
					>
						<Icon
							icon="ri-donut-chart-line"
							width="1.5rem"
							color={theme.palette.text.secondary}
						/>
						<Typography variant="body2" color="text.secondary">
							No insight data available for this period.
						</Typography>
					</Box>
				) : (
					<Stack spacing={4}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								py: 1.5,
								"& .apexcharts-tooltip": {
									background:
										"var(--mui-palette-background-paper) !important",
									color: "var(--mui-palette-text-primary) !important",
									border: `1px solid ${alpha(theme.palette.divider, 0.8)} !important`,
								},
								"& .apexcharts-tooltip-title": {
									background:
										"var(--mui-palette-background-default) !important",
									color:
										"var(--mui-palette-text-secondary) !important",
									borderBottom:
										"1px solid var(--mui-palette-divider) !important",
								},
							}}
						>
							<AppReactApexCharts
								type="donut"
								width={width}
								height={height}
								series={statusDataWithShare.map((item) => item.amount)}
								options={chartOptions}
							/>
						</Box>

						<Stack spacing={2.2}>
							{statusDataWithShare.map((status) => (
								<Box key={status.key}>
									<Stack
										direction="row"
										alignItems="center"
										justifyContent="space-between"
										spacing={1.5}
										sx={{ mb: 1 }}
									>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<CustomAvatar
												size={30}
												skin="light"
												color={status.color}
												variant="rounded"
											>
												<Icon icon={status.icon} width={16} />
											</CustomAvatar>
											<Box>
												<Typography variant="body2" sx={{ fontWeight: 500 }}>
													{status.label}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{status.count.toLocaleString("en-US")} invoices
												</Typography>
											</Box>
										</Stack>

										<Box sx={{ textAlign: "right" }}>
											<Typography variant="body2" sx={{ fontWeight: 600 }}>
												{formatMoney(status.amount)} {currencyData}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{status.share.toFixed(1)}%
											</Typography>
										</Box>
									</Stack>

									{/* <LinearProgress
										variant="determinate"
										value={status.share}
										color={status.color}
										sx={{
											height: 6,
											borderRadius: 6,
											backgroundColor: alpha(theme.palette[status.color].main, 0.14),
										}}
									/> */}
								</Box>
							))}
						</Stack>
					</Stack>
				)}
			</CardContent>
		</Card>
	);
};

export default CardWidgetsSalesOverview;
