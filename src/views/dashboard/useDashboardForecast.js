'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getAIForecastInsights } from '@/app/(dashboard)/dashboard/actions';

import { buildForecastPayload } from '@/utils/dashboardForecastUtils';

export function useDashboardForecast({ dashboardData = {}, onError = () => {} }) {
	const [isGeneratingAIForecast, setIsGeneratingAIForecast] = useState(false);
	const [aiForecastData, setAiForecastData] = useState(null);
	const [aiInsightCards, setAiInsightCards] = useState([]);
	const forecastRequestRef = useRef(0);

	const resetForecast = useCallback(() => {
		forecastRequestRef.current += 1;
		setAiForecastData(null);
		setAiInsightCards([]);
		setIsGeneratingAIForecast(false);
	}, []);

	useEffect(() => {
		const labels = Array.isArray(dashboardData?.financeTrend?.labels)
			? dashboardData.financeTrend.labels
			: [];

		if (!labels.length) {
			resetForecast();
			return;
		}

		const requestId = forecastRequestRef.current + 1;
		forecastRequestRef.current = requestId;

		const generateForecast = async () => {
			setIsGeneratingAIForecast(true);

			try {
				const response = await getAIForecastInsights(buildForecastPayload(dashboardData));

				if (requestId !== forecastRequestRef.current) return;

				if (response?.code === 200 && response?.data?.series) {
					setAiForecastData(response.data);
					setAiInsightCards(
						Array.isArray(response?.data?.insightCards) ? response.data.insightCards : []
					);
					return;
				}

				setAiForecastData(null);
				setAiInsightCards([]);
				onError(response?.message || 'Failed to generate AI forecast. Showing baseline trend.');
			} catch (error) {
				if (requestId !== forecastRequestRef.current) return;

				setAiForecastData(null);
				setAiInsightCards([]);
				onError(error?.message || 'Failed to generate AI forecast. Showing baseline trend.');
			} finally {
				if (requestId === forecastRequestRef.current) {
					setIsGeneratingAIForecast(false);
				}
			}
		};

		generateForecast();
	}, [dashboardData, onError, resetForecast]);

	return {
		aiForecastData,
		aiInsightCards,
		isGeneratingAIForecast,
		resetForecast,
	};
}
