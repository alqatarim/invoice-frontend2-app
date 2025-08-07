"use client";

// React Imports
import { useMemo } from "react";

// Next Imports
import dynamic from "next/dynamic";

// MUI Imports
import { useTheme } from "@mui/material/styles";

// Styled Component Imports - Optimized with loading state
const AppReactApexCharts = dynamic(() =>
	import("@/libs/styles/AppReactApexCharts"), {
	ssr: false,
	loading: () => (
		<div 
			className="flex items-center justify-center bg-gray-100 animate-pulse rounded-lg"
			style={{ height: '100px', width: '100%' }}
		>
			<span className="text-gray-500 text-sm">Loading chart...</span>
		</div>
	),
});

const MultiBarProgress = ({
	stats = [],
	totalAmount,
	height = 100,
	barHeight = "35px",
	width = "100%",
	borderColor = "info",
	showTotal = true,
	...props
}) => {
	// Hooks
	const theme = useTheme();

	// Use provided total amount or calculate from stats as fallback
	//   const totalAmount = propTotalAmount || stats.reduce((sum, stat) => sum + Number(stat.stats || 0), 0)

	// Memoized calculations for better performance
	const { validStats, colors } = useMemo(() => {
		// Filter stats with values > 0
		const filtered = stats.filter((stat) => Number(stat.stats || 0) > 0);

		// Return early if no valid stats
		if (filtered.length === 0) {
			return { validStats: [], colors: [] };
		}

		// Map colors from stat objects to theme colors
		const themeColors = filtered.map((stat) => {
			const colorName = stat.color || "default";
			const themeColor = theme.palette[colorName];
			if (themeColor?.main) {
				if (stat.colorOpacity && themeColor[stat.colorOpacity]) {
					return themeColor[stat.colorOpacity];
				}
				return themeColor.main;
			}
			return theme.palette.primary.light;
		});

		return {
			validStats: filtered,
			colors: themeColors,
		};
	}, [stats, theme.palette]);

	// Return null if no valid stats
	if (validStats.length === 0) {
		return null;
	}

	// Calculate total for percentage
	const total =
		totalAmount ||
		validStats.reduce((sum, stat) => sum + Number(stat.stats || 0), 0);

	// Memoized ApexCharts series data and options
	const { series, options } = useMemo(() => {
		const chartSeries = validStats.map((stat) => ({
			name: stat.title,
			data: [Number(stat.stats || 0), 0],
		}));

		const chartOptions = {
		chart: {
			type: "bar",
			stacked: true,
			toolbar: { show: false },
			width: width,
			height: height,
			parentHeightOffset: 0,
			sparkline: {
				enabled: true,
			},
			margin: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
			},
			offsetX: 0,
			offsetY: 0,
		},
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: barHeight,
				borderRadius: 19,
			},
		},
		dataLabels: {
			enabled: true,
			formatter: function (val, opts) {
				const stat = validStats[opts.seriesIndex];
				if (!val || val === 0) return "";
				return stat.isCurrency
					? `﷼ ${Number(val).toLocaleString()}`
					: Number(val).toLocaleString();
			},
			style: {
				fontWeight: 500,
				fontSize: "14px",
			},
			offsetX: 0,
			offsetY: 0,
			dropShadow: { enabled: false },
		},
		colors: colors,
		xaxis: {
			categories: ["Progress", ""],
			labels: { show: false },
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			show: false,
			labels: { show: false },
		},
		grid: {
			show: false,
			padding: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
			},
		},
		legend: {
			show: true,
			position: "bottom",
			horizontalAlign: "center",
			floating: true,
			fontSize: "13px",
			fontWeight: 500,
			itemMargin: {
				horizontal: 12,
				vertical: 0,
			},
			markers: {
				width: 10,
				height: 10,
				radius: 3,
				offsetX: 0,
				offsetY: 0,
			},
			offsetY: -10,
			height: 25,
		},
		tooltip: {
			enabled: true,
			shared: false,
			followCursor: false,
			intersect: true,
			custom: function ({ series, seriesIndex, dataPointIndex, w }) {
				const stat = validStats[seriesIndex];
				const value = Number(stat.stats || 0);
				const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

				// <div style="display: flex; justify-content: space-between; flex-direction: column; align-items: start; gap: 0px; padding: 12px 15px;  border-radius: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); min-width: 180px; padding: 12px 15px;"></div>
				return `
          <div style="display: flex; justify-content: space-between; flex-direction: column; align-items: start; gap: 0px; padding: 8px 15px; border: 0px solid  min-width: 180px; ">

            <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 12px; width: 100%; min-width: 120px;">
              <div style="display: flex; align-items: center; gap: 5px; flex: 1;">
                <span style="width: 10px; height: 10px; background-color: ${
									colors[seriesIndex]
								}; border-radius: 3px; display: inline-block;  ${
					theme.palette.divider
				};"></span>
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 450; font-size: 0.9rem; color: ${
									colors[seriesIndex]
								}; letter-spacing: 0.01em;">${stat.title}</div>
              </div>

                <div style="display: flex; align-items: center; gap: 3px;">
            ${
							stat.isCurrency
								? `<span style="color: ${theme.palette.secondary.light}; font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; font-size: 1.1em; font-weight: 600; vertical-align: middle;">﷼</span> `
								: ""
						}
              <span style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-weight: 500; font-size: 0.9rem; color: ${
								theme.palette.text.primary
							};">
                ${value.toLocaleString()}
              </span>

                          </div>

            </div>

            <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent 0%, ${
							theme.palette.divider
						} 20%, ${
					theme.palette.divider
				} 80%, transparent 100%); margin: 5px 0; opacity: 0.6;"></div>




             <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 0px; width: 100%;">
                <span style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 0.9rem; color: ${
									theme.palette.text.primary
								}; font-weight: 500; flex-shrink: 0;">${percentage}%</span>
            ${
							stat.trendNumber
								? `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 0.9rem; color: ${theme.palette.text.primary}; font-weight: 500; letter-spacing: 0.01em;">
                <span style=\'font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight:600; font-size: 0.9rem; color:${theme.palette.text.primary}\'>${stat.trendNumber}</span>
                </div>`
								: ""
						}
            </div>
          </div>
        `;
			},
		},
	};

		return { series: chartSeries, options: chartOptions };
	}, [validStats, colors, width, height, barHeight, total]);

	return (
		<div
			style={{
				margin: 0,
				padding: 0,
				display: "flex",
				flexDirection: "column",
				height: height,
				position: "relative",
				overflow: "visible",
			}}
		>
			<AppReactApexCharts
				type="bar"
				width={width}
				height={height}
				options={options}
				series={series}
			/>
		</div>
	);
};

export default MultiBarProgress;
