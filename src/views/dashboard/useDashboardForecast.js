'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getAIForecastInsights } from '@/app/(dashboard)/dashboard/actions';

import { buildForecastPayload } from '@/utils/dashboardForecastUtils';

const EMPTY_INSIGHT_CARDS = Object.freeze([]);
const FORECAST_SERIES_KEYS = ['sales', 'purchases', 'expenses', 'profits'];

// Build a stable signature so the forecast effect only fires when the inputs
// that actually drive the AI call change. Depending on the whole dashboardData
// object would re-fire on every parent render and create an infinite loop.
const buildForecastSignature = (dashboardData) => {
	const trend = dashboardData?.financeTrend;
	if (!trend) return '';

	const labels = Array.isArray(trend.labels) ? trend.labels : [];
	if (!labels.length) return '';

	const series = trend.series || {};
	const seriesParts = FORECAST_SERIES_KEYS.map((key) => {
		const entry = series[key];
		if (!entry) return `${key}:`;
		const actual = Array.isArray(entry.actual) ? entry.actual.length : 0;
		const forecast = Array.isArray(entry.forecast) ? entry.forecast.length : 0;
		return `${key}:${actual}/${forecast}`;
	}).join('|');

	return `${labels.length}::${labels[0]}::${labels[labels.length - 1]}::${seriesParts}`;
};

export function useDashboardForecast({ dashboardData = null, onError = () => {} }) {
	const [isGeneratingAIForecast, setIsGeneratingAIForecast] = useState(false);
	const [aiForecastData, setAiForecastData] = useState(null);
	const [aiInsightCards, setAiInsightCards] = useState(EMPTY_INSIGHT_CARDS);
	const forecastRequestRef = useRef(0);
	const dashboardDataRef = useRef(dashboardData);

	dashboardDataRef.current = dashboardData;

	const forecastSignature = useMemo(
		() => buildForecastSignature(dashboardData),
		[dashboardData]
	);

	const resetForecast = useCallback(() => {
		forecastRequestRef.current += 1;
		setAiForecastData((prev) => (prev === null ? prev : null));
		setAiInsightCards((prev) => (prev === EMPTY_INSIGHT_CARDS ? prev : EMPTY_INSIGHT_CARDS));
		setIsGeneratingAIForecast((prev) => (prev ? false : prev));
	}, []);

	useEffect(() => {
		if (!forecastSignature) {
			resetForecast();
			return undefined;
		}

		const requestId = forecastRequestRef.current + 1;
		forecastRequestRef.current = requestId;
		let cancelled = false;

		const generateForecast = async () => {
			setIsGeneratingAIForecast(true);

			try {
				const response = await getAIForecastInsights(
					buildForecastPayload(dashboardDataRef.current)
				);

				if (cancelled || requestId !== forecastRequestRef.current) return;

				if (response?.code === 200 && response?.data?.series) {
					setAiForecastData(response.data);
					setAiInsightCards(
						Array.isArray(response.data.insightCards)
							? response.data.insightCards
							: EMPTY_INSIGHT_CARDS
					);
					return;
				}

				setAiForecastData(null);
				setAiInsightCards(EMPTY_INSIGHT_CARDS);
				onError(response?.message || 'Failed to generate AI forecast. Showing baseline trend.');
			} catch (error) {
				if (cancelled || requestId !== forecastRequestRef.current) return;

				setAiForecastData(null);
				setAiInsightCards(EMPTY_INSIGHT_CARDS);
				onError(error?.message || 'Failed to generate AI forecast. Showing baseline trend.');
			} finally {
				if (!cancelled && requestId === forecastRequestRef.current) {
					setIsGeneratingAIForecast(false);
				}
			}
		};

		generateForecast();

		return () => {
			cancelled = true;
		};
	}, [forecastSignature, onError, resetForecast]);

	return {
		aiForecastData,
		aiInsightCards,
		isGeneratingAIForecast,
		resetForecast,
	};
}
