'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_FORECAST_MODEL = process.env.OPENAI_FORECAST_MODEL || 'gpt-5.2';
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';

const buildDashboardQuery = ({ filter = '', branchId = '' } = {}) => {
  const searchParams = new URLSearchParams();

  if (filter) searchParams.set('type', filter);
  if (branchId) searchParams.set('branchId', branchId);

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export async function getFilteredDashboardData(filter = '', branchId = '') {
  return fetchWithAuth(`/dashboard${buildDashboardQuery({ filter, branchId })}`);
}

export async function getDashboardData(branchId = '') {
  return fetchWithAuth(`/dashboard${buildDashboardQuery({ branchId })}`);
}

const toFiniteNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const average = (values) => {
  const list = Array.isArray(values)
    ? values.map(toFiniteNumber).filter((value) => Number.isFinite(value))
    : [];

  if (list.length === 0) return 0;

  return list.reduce((sum, value) => sum + value, 0) / list.length;
};

const sum = (values) =>
  (Array.isArray(values) ? values : []).reduce(
    (accumulator, value) => accumulator + toFiniteNumber(value),
    0
  );

const safeDivide = (numerator, denominator) => {
  const num = toFiniteNumber(numerator);
  const den = toFiniteNumber(denominator);

  if (Math.abs(den) < 1e-9) return 0;

  return num / den;
};

const stdDev = (values) => {
  const list = (Array.isArray(values) ? values : [])
    .map(toFiniteNumber)
    .filter((value) => Number.isFinite(value));

  if (list.length === 0) return 0;

  const mean = average(list);
  const variance = average(list.map((value) => (value - mean) ** 2));

  return Math.sqrt(Math.max(variance, 0));
};

const roundTo = (value, digits = 2) => {
  const number = toFiniteNumber(value);
  const factor = 10 ** digits;
  return Math.round(number * factor) / factor;
};

const conciseSentence = (value, maxLen = 90) => {
  const raw = String(value || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';

  const first = raw.split(/[.!?]/).find(Boolean)?.trim() || raw;

  if (first.length <= maxLen) {
    return `${first.replace(/\.*$/, '')}.`;
  }

  const cut = first.slice(0, maxLen);
  const stop = cut.lastIndexOf(' ');
  const compact = (stop > 24 ? cut.slice(0, stop) : cut).trim();

  return `${compact.replace(/[;,:-]+$/, '')}.`;
};

const plainLanguage = (value) =>
  String(value || '')
    .replace(/\brun-rate\b/gi, 'sales')
    .replace(/\bnormalization\b/gi, 'stabilization')
    .replace(/\boutlier\b/gi, 'special month')
    .replace(/\bcadence\b/gi, 'pace')
    .replace(/\bdiscretionary\b/gi, 'non-essential')
    .replace(/\bcompression\b/gi, 'drop')
    .replace(/\bnear-term\b/gi, 'next 1-2 months')
    .replace(/\bprioritize\b/gi, 'focus on')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeSeriesShape = (series = {}, key, allowNegative = false) => {
  const fallbackActual = Array.isArray(series?.[key]?.actual) ? series[key].actual : [];
  const fallbackForecast = Array.isArray(series?.[key]?.forecast) ? series[key].forecast : [];
  const baseLength = Math.max(fallbackActual.length, fallbackForecast.length, 6);
  const normalizedForecast = [...fallbackForecast];

  while (normalizedForecast.length < baseLength) normalizedForecast.push(0);

  const safeForecast = normalizedForecast.map((value) => {
    const parsed = toFiniteNumber(value);
    return allowNegative ? parsed : Math.max(0, parsed);
  });

  return {
    actual: fallbackActual.map((value) => (value === null ? null : toFiniteNumber(value))),
    forecast: safeForecast,
    growthPercentage: toFiniteNumber(series?.[key]?.growthPercentage),
    forecastNext: toFiniteNumber(series?.[key]?.forecastNext),
  };
};

const buildBaselineSeries = (financeTrend) => {
  const series = financeTrend?.series || {};

  return {
    sales: normalizeSeriesShape(series, 'sales', false),
    expenses: normalizeSeriesShape(series, 'expenses', false),
    profits: normalizeSeriesShape(series, 'profits', true),
  };
};

const extractJsonPayload = (content) => {
  if (!content || typeof content !== 'string') return null;

  const direct = content.trim();

  if (direct.startsWith('{') && direct.endsWith('}')) {
    try {
      return JSON.parse(direct);
    } catch {
      // Continue with fallback extraction.
    }
  }

  const firstBrace = direct.indexOf('{');
  const lastBrace = direct.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) return null;

  const candidate = direct.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

const monthTokenToIndex = (token) => {
  const map = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  return map[String(token || '').toLowerCase()] ?? null;
};

const getSeasonName = (monthIndex) => {
  if (monthIndex === null || monthIndex === undefined) return 'unknown';
  if ([11, 0, 1].includes(monthIndex)) return 'winter';
  if ([2, 3, 4].includes(monthIndex)) return 'spring';
  if ([5, 6, 7].includes(monthIndex)) return 'summer';
  return 'autumn';
};

const buildTemporalSignals = (labels) => {
  const list = Array.isArray(labels) ? labels : [];

  return list.map((label) => {
    const monthToken = String(label || '').trim().slice(0, 3);
    const monthIndex = monthTokenToIndex(monthToken);
    const season = getSeasonName(monthIndex);
    const events = [];

    if ([2, 3].includes(monthIndex)) events.push('Ramadan/Eid demand shifts in MENA retail');
    if (monthIndex === 8) events.push('Back-to-school demand acceleration');
    if (monthIndex === 10) events.push('White Friday / promotions impact discretionary demand');
    if ([5, 6, 7].includes(monthIndex)) {
      events.push('Heat-driven beverage and cooling-product demand');
    }
    if (monthIndex === 11) {
      events.push('Year-end budget resets and holiday retail volatility');
    }

    return { label, season, events };
  });
};

const buildBusinessDiagnostics = ({
  baselineSeries,
  operations,
  topProducts,
  topCustomers,
  inventoryAlerts,
  labels,
}) => {
  const salesActual = baselineSeries?.sales?.actual || [];
  const expensesActual = baselineSeries?.expenses?.actual || [];
  const profitsActual = baselineSeries?.profits?.actual || [];

  const cleanSales = salesActual
    .filter((value) => value !== null && value !== undefined)
    .map(toFiniteNumber);
  const cleanExpenses = expensesActual
    .filter((value) => value !== null && value !== undefined)
    .map(toFiniteNumber);
  const cleanProfits = profitsActual
    .filter((value) => value !== null && value !== undefined)
    .map(toFiniteNumber);

  const latestSales = cleanSales[cleanSales.length - 1] || 0;
  const latestExpenses = cleanExpenses[cleanExpenses.length - 1] || 0;
  const latestProfit = cleanProfits[cleanProfits.length - 1] || 0;

  const salesVolatility = roundTo(
    safeDivide(stdDev(cleanSales.slice(-6)), average(cleanSales.slice(-6)) || 1),
    3
  );
  const expenseVolatility = roundTo(
    safeDivide(stdDev(cleanExpenses.slice(-6)), average(cleanExpenses.slice(-6)) || 1),
    3
  );

  const salesLast3 = sum(cleanSales.slice(-3));
  const expensesLast3 = sum(cleanExpenses.slice(-3));
  const purchasesAmount = toFiniteNumber(operations?.purchasesAmount);
  const expenseToSalesRatio = roundTo(safeDivide(expensesLast3, salesLast3), 3);
  const purchaseCoveragePressure = roundTo(safeDivide(purchasesAmount, salesLast3 || 1), 3);

  const topProductsList = (Array.isArray(topProducts) ? topProducts : []).slice(0, 8);
  const topCustomersList = (Array.isArray(topCustomers) ? topCustomers : []).slice(0, 8);
  const topProductRevenueTotal = sum(topProductsList.map((item) => item?.revenue));
  const topCustomerRevenueTotal = sum(topCustomersList.map((item) => item?.revenue));
  const topProductConcentration = roundTo(
    safeDivide(toFiniteNumber(topProductsList?.[0]?.revenue), topProductRevenueTotal || 1),
    3
  );
  const topCustomerConcentration = roundTo(
    safeDivide(toFiniteNumber(topCustomersList?.[0]?.revenue), topCustomerRevenueTotal || 1),
    3
  );

  const alerts = Array.isArray(inventoryAlerts) ? inventoryAlerts : [];
  const criticalAlerts = alerts.filter(
    (item) => String(item?.severity || '').toLowerCase() === 'critical'
  ).length;
  const highAlerts = alerts.filter(
    (item) => String(item?.severity || '').toLowerCase() === 'high'
  ).length;
  const inventoryStressIndex = roundTo(
    safeDivide(criticalAlerts * 2 + highAlerts, Math.max(alerts.length, 1)),
    3
  );

  return {
    labels,
    latestMonth: labels?.[2] || labels?.[labels.length - 4] || '',
    nextMonth: labels?.[3] || labels?.[labels.length - 3] || '',
    latestSales: roundTo(latestSales, 2),
    latestExpenses: roundTo(latestExpenses, 2),
    latestProfit: roundTo(latestProfit, 2),
    salesVolatility,
    expenseVolatility,
    expenseToSalesRatio,
    purchaseCoveragePressure,
    topProductConcentration,
    topCustomerConcentration,
    inventoryStressIndex,
    criticalAlerts,
    highAlerts,
  };
};

const buildMacroPriors = ({ region, temporalSignals }) => {
  const nextSignal = Array.isArray(temporalSignals) ? temporalSignals[3] : null;

  return {
    region,
    baseAssumptions: [
      'GCC retail is sensitive to season, promotions, and household cash-flow timing.',
      'Demand in small shops can shift quickly with weather and religious/event periods.',
      'Discretionary categories show higher volatility than staples.',
    ],
    nextPeriodSeason: nextSignal?.season || 'unknown',
    nextPeriodEvents: nextSignal?.events || [],
    instruction:
      'Use these as soft priors only. Never invent hard external numbers or fake news facts.',
  };
};

const stabilizeFutureSeries = ({
  candidateFuture = [],
  baselineFuture = [],
  recentActual = [],
  allowNegative = false,
}) => {
  const horizon = Math.max(baselineFuture.length, 1);
  const output = [];
  const cleanRecent = (Array.isArray(recentActual) ? recentActual : [])
    .filter((value) => value !== null && value !== undefined)
    .map(toFiniteNumber);

  for (let index = 0; index < horizon; index += 1) {
    const candidate = toFiniteNumber(candidateFuture?.[index]);
    const baseline = toFiniteNumber(baselineFuture?.[index]);
    const fallback =
      index > 0 ? output[index - 1] : cleanRecent[cleanRecent.length - 1] ?? baseline;
    let nextValue =
      Number.isFinite(candidate) && candidate !== 0
        ? candidate
        : Number.isFinite(baseline)
          ? baseline
          : fallback;

    const recentMean = average(cleanRecent.slice(-3));
    const anchor = recentMean || baseline || fallback || 0;

    if (!allowNegative) {
      const floor = Math.max(0, anchor * 0.5);
      const cap = Math.max(anchor * 1.85, floor + 1);
      nextValue = clamp(nextValue, floor, cap);
    } else {
      const band = Math.max(Math.abs(anchor), 1);
      nextValue = clamp(nextValue, -band * 2.3, band * 2.3);
    }

    if (index === 0 && cleanRecent.length > 0) {
      const latest = cleanRecent[cleanRecent.length - 1];
      const maxDelta = allowNegative
        ? Math.max(Math.abs(latest) * 0.95, 5000)
        : Math.max(Math.abs(latest) * 0.45, 500);
      nextValue = clamp(nextValue, latest - maxDelta, latest + maxDelta);
      if (!allowNegative) nextValue = Math.max(0, nextValue);
    }

    if (index > 0) {
      const prev = output[index - 1];
      const maxStep = allowNegative
        ? Math.max(Math.abs(prev) * 0.6, 4000)
        : Math.max(Math.abs(prev) * 0.35, 350);
      nextValue = clamp(nextValue, prev - maxStep, prev + maxStep);
      if (!allowNegative) nextValue = Math.max(0, nextValue);
    }

    output.push(Math.round(nextValue));
  }

  return output;
};

const stabilizeBacktestSeries = ({
  candidateBacktest = [],
  baselineBacktest = [],
  referenceActual = [],
  allowNegative = false,
}) => {
  const horizon = Math.max(baselineBacktest.length, candidateBacktest.length, 0);
  const output = [];

  for (let index = 0; index < horizon; index += 1) {
    const candidate = toFiniteNumber(candidateBacktest?.[index]);
    const baseline = toFiniteNumber(baselineBacktest?.[index]);
    const actual = toFiniteNumber(referenceActual?.[index]);
    const prev = index > 0 ? output[index - 1] : baseline || actual || 0;
    const anchor = average([
      actual,
      baseline,
      prev,
      toFiniteNumber(referenceActual?.[index - 1]),
      toFiniteNumber(referenceActual?.[index - 2]),
    ]);

    let nextValue =
      Number.isFinite(candidate) && candidate !== 0
        ? candidate
        : Number.isFinite(baseline) && baseline !== 0
          ? baseline
          : actual || prev;

    if (!allowNegative) {
      const floor = Math.max(0, anchor * 0.45);
      const cap = Math.max(anchor * 1.9, floor + 1);
      nextValue = clamp(nextValue, floor, cap);
    } else {
      const band = Math.max(Math.abs(anchor), 1);
      nextValue = clamp(nextValue, -band * 2.4, band * 2.4);
    }

    if (index > 0) {
      const maxStep = allowNegative
        ? Math.max(Math.abs(prev) * 0.7, 4500)
        : Math.max(Math.abs(prev) * 0.4, 400);
      nextValue = clamp(nextValue, prev - maxStep, prev + maxStep);
      if (!allowNegative) nextValue = Math.max(0, nextValue);
    }

    output.push(Math.round(nextValue));
  }

  return output;
};

const buildMetricSeries = (baselineMetric, aiMetric, allowNegative = false) => {
  const actual = Array.isArray(baselineMetric?.actual) ? baselineMetric.actual : [];
  const baselineForecast = Array.isArray(baselineMetric?.forecast)
    ? baselineMetric.forecast.map(toFiniteNumber)
    : [];
  const firstFutureIndexRaw = actual.findIndex(
    (value) => value === null || value === undefined
  );
  const firstFutureIndex =
    firstFutureIndexRaw >= 0 ? firstFutureIndexRaw : Math.max(baselineForecast.length - 3, 0);
  const horizon = Math.max(baselineForecast.length - firstFutureIndex, 1);
  const backtestWindow = Math.min(3, firstFutureIndex);
  const backtestStart = Math.max(firstFutureIndex - backtestWindow, 0);

  const recentActual = actual
    .filter((value) => value !== null && value !== undefined)
    .map(toFiniteNumber);

  const candidateFuture = Array.isArray(aiMetric?.future)
    ? aiMetric.future
    : Array.isArray(aiMetric?.forecast)
      ? aiMetric.forecast.slice(firstFutureIndex)
      : [];

  const baselineFuture = baselineForecast.slice(firstFutureIndex, firstFutureIndex + horizon);
  const baselineBacktest = baselineForecast.slice(backtestStart, firstFutureIndex);
  const referenceBacktestActual = actual
    .slice(backtestStart, firstFutureIndex)
    .map((value) => (value === null || value === undefined ? 0 : toFiniteNumber(value)));

  const candidateBacktest = Array.isArray(aiMetric?.backtest)
    ? aiMetric.backtest
    : Array.isArray(aiMetric?.forecast)
      ? aiMetric.forecast.slice(backtestStart, firstFutureIndex)
      : [];

  const stabilizedFuture = stabilizeFutureSeries({
    candidateFuture,
    baselineFuture,
    recentActual,
    allowNegative,
  });
  const stabilizedBacktest = stabilizeBacktestSeries({
    candidateBacktest,
    baselineBacktest,
    referenceActual: referenceBacktestActual,
    allowNegative,
  });

  const mergedForecast = [...baselineForecast];

  for (let index = 0; index < backtestWindow; index += 1) {
    mergedForecast[backtestStart + index] =
      stabilizedBacktest[index] ??
      baselineBacktest[index] ??
      mergedForecast[backtestStart + index] ??
      0;
  }

  for (let index = 0; index < horizon; index += 1) {
    mergedForecast[firstFutureIndex + index] =
      stabilizedFuture[index] ??
      baselineFuture[index] ??
      mergedForecast[firstFutureIndex + index] ??
      0;
  }

  const latestActual = recentActual[recentActual.length - 1] ?? 0;
  const forecastNext = toFiniteNumber(mergedForecast[firstFutureIndex]);
  const growthPercentage =
    Math.abs(latestActual) > 0.01
      ? Number((((forecastNext - latestActual) / Math.abs(latestActual)) * 100).toFixed(1))
      : 0;

  return {
    actual,
    forecast: mergedForecast,
    firstFutureIndex,
    growthPercentage,
    forecastNext,
  };
};

const buildFallbackInsightCards = ({
  labels,
  mergedSeries,
  inventoryAlerts,
  topProducts,
}) => {
  const sales = mergedSeries?.sales || {};
  const expenses = mergedSeries?.expenses || {};
  const profits = mergedSeries?.profits || {};
  const salesActual = Array.isArray(sales.actual)
    ? sales.actual.filter((value) => value !== null && value !== undefined).map(toFiniteNumber)
    : [];
  const latestSalesActual = salesActual[salesActual.length - 1] || 0;
  const salesDelta =
    latestSalesActual > 0
      ? ((toFiniteNumber(sales.forecastNext) - latestSalesActual) /
          Math.abs(latestSalesActual)) *
        100
      : 0;
  const nextLabel = labels?.[sales.firstFutureIndex] || 'Next period';

  const criticalAlerts = (Array.isArray(inventoryAlerts) ? inventoryAlerts : [])
    .filter((item) => String(item?.severity || '').toLowerCase() === 'critical')
    .slice(0, 2)
    .map((item) => item?.name)
    .filter(Boolean);

  const fastDemandProducts = (Array.isArray(topProducts) ? topProducts : [])
    .slice(0, 3)
    .map((item) => item?.name)
    .filter(Boolean);

  const cards = [
    {
      type: 'sales',
      icon: 'ri-line-chart-line',
      title: 'Sales next month',
      text:
        salesDelta >= 0
          ? `${nextLabel}: target about +${Math.abs(salesDelta).toFixed(1)}% sales vs this month.`
          : `${nextLabel}: prepare for about ${Math.abs(salesDelta).toFixed(1)}% lower sales.`,
    },
    {
      type: 'purchases',
      icon: 'ri-shopping-cart-line',
      title: 'Purchase plan',
      text:
        toFiniteNumber(expenses.forecastNext) >
        toFiniteNumber(expenses.actual?.[expenses.firstFutureIndex - 1] || 0)
          ? 'Buy only fast sellers first and delay slow items this month.'
          : 'Keep buying pace steady; refill by product speed, not by broad category.',
    },
    {
      type: 'demand_supply',
      icon: 'ri-scales-3-line',
      title: 'Stock priority',
      text:
        criticalAlerts.length > 0
          ? `Restock first: ${criticalAlerts.join(', ')}.`
          : 'No critical stockouts now; keep safety stock for top 20% items.',
    },
    {
      type: 'profitability',
      icon: 'ri-funds-line',
      title: 'Margin check',
      text:
        toFiniteNumber(profits.forecastNext) >= 0
          ? 'Margin outlook is positive; keep promo discounts controlled.'
          : 'Margin risk is high; reduce discounts and renegotiate buy prices.',
    },
  ];

  if (fastDemandProducts.length > 0) {
    cards.push({
      type: 'demand_supply',
      icon: 'ri-fire-line',
      title: 'Demand leaders',
      text: `Keep these always available: ${fastDemandProducts.join(', ')}.`,
    });
  }

  return cards.slice(0, 5).map((card) => ({
    ...card,
    title: conciseSentence(plainLanguage(card.title), 32).replace(/\.$/, ''),
    text: conciseSentence(plainLanguage(card.text), 90),
  }));
};

const normalizeInsightCards = (cards) => {
  const iconByType = {
    sales: 'ri-line-chart-line',
    purchases: 'ri-shopping-cart-line',
    demand_supply: 'ri-scales-3-line',
    profitability: 'ri-funds-line',
  };

  return (Array.isArray(cards) ? cards : [])
    .map((item) => ({
      type: item?.type || 'sales',
      icon: item?.icon || iconByType[item?.type] || 'ri-lightbulb-line',
      title: conciseSentence(plainLanguage(item?.title || 'Insight'), 32).replace(/\.$/, ''),
      text: conciseSentence(plainLanguage(item?.text || ''), 90),
    }))
    .filter((item) => item.text)
    .slice(0, 6);
};

const mergeForecastSeries = (baseline, aiPayload = {}) => ({
  sales: buildMetricSeries(baseline.sales, aiPayload?.sales, false),
  expenses: buildMetricSeries(baseline.expenses, aiPayload?.expenses, false),
  profits: buildMetricSeries(baseline.profits, aiPayload?.profits, true),
});

export async function getAIForecastInsights(payload = {}) {
  const financeTrend = payload?.financeTrend || {};
  const labels = Array.isArray(financeTrend?.labels) ? financeTrend.labels : [];
  const baselineSeries = buildBaselineSeries(financeTrend);
  const currency = payload?.currency || 'SAR';

  if (!OPENAI_API_KEY) {
    return {
      code: 400,
      message: 'OPENAI_API_KEY is not configured on the server.',
    };
  }

  if (labels.length === 0) {
    return {
      code: 400,
      message: 'No finance trend labels available for AI forecasting.',
    };
  }

  const temporalSignals = buildTemporalSignals(labels);
  const futureHorizon = Math.max(1, labels.length - 3);
  const region = payload?.region || 'Saudi Arabia / GCC';
  const diagnostics = buildBusinessDiagnostics({
    baselineSeries,
    operations: payload?.operations || {},
    topProducts: payload?.topProducts || [],
    topCustomers: payload?.topCustomers || [],
    inventoryAlerts: payload?.inventoryAlerts || [],
    labels,
  });
  const macroPriors = buildMacroPriors({
    region,
    temporalSignals,
  });

  const promptPayload = {
    currency,
    labels,
    locale: payload?.locale || 'en-SA',
    region,
    generatedAt: new Date().toISOString(),
    temporalSignals,
    diagnostics,
    macroPriors,
    baselineSeries,
    topProducts: Array.isArray(payload?.topProducts) ? payload.topProducts.slice(0, 8) : [],
    topCustomers: Array.isArray(payload?.topCustomers) ? payload.topCustomers.slice(0, 8) : [],
    inventoryAlerts: Array.isArray(payload?.inventoryAlerts)
      ? payload.inventoryAlerts.slice(0, 8)
      : [],
    operations: payload?.operations || {},
  };

  const schema = {
    sales: {
      backtest: [0, 0, 0],
      future: Array.from({ length: futureHorizon }, () => 0),
      rationale: [''],
    },
    expenses: {
      backtest: [0, 0, 0],
      future: Array.from({ length: futureHorizon }, () => 0),
      rationale: [''],
    },
    profits: {
      backtest: [0, 0, 0],
      future: Array.from({ length: futureHorizon }, () => 0),
      rationale: [''],
    },
    insightCards: [
      { type: 'sales', title: '', text: '', icon: 'ri-line-chart-line' },
      { type: 'purchases', title: '', text: '', icon: 'ri-shopping-cart-line' },
      { type: 'demand_supply', title: '', text: '', icon: 'ri-scales-3-line' },
      { type: 'profitability', title: '', text: '', icon: 'ri-funds-line' },
    ],
  };

  try {
    const aiResponse = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_FORECAST_MODEL,
        temperature: 0.12,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              'You are a frontier-grade retail forecasting engine for invoice-driven businesses.',
              'Blend time-series behavior, purchasing patterns, customer concentration, inventory pressure,',
              'localization, seasonality, religious/calendar events, and macro trend priors.',
              'Use diagnostics and macroPriors as hard planning context unless contradicted by data.',
              'Return only strict JSON (no markdown, no prose outside JSON).',
              'When writing insightCards, use plain store-owner language (simple words, no jargon).',
              'Each insight must be specific and actionable for small and medium shops.',
            ].join(' '),
          },
          {
            role: 'user',
            content: [
              'Generate high-precision next-horizon forecasts and concise store-level decisions.',
              `Context JSON:\n${JSON.stringify(promptPayload)}`,
              `Return EXACT JSON schema:\n${JSON.stringify(schema)}`,
              'Hard constraints:',
              `1) Each *.future length must be exactly ${futureHorizon}.`,
              '1.1) Each *.backtest length must be exactly 3 in chronological order: [two months prior, previous month, current month].',
              '2) sales.future and expenses.future must be >= 0.',
              '3) profits.future may be negative but must be coherent with sales-expense relationship.',
              '4) First future month must be continuous with latest actual; avoid abrupt unrealistic jumps.',
              '5) Month-to-month swing should generally stay smooth unless justified by temporal signals.',
              '6) Encode localization effects (Saudi/GCC seasonality, Ramadan/Eid shifts, heat season, back-to-school, promotion windows).',
              '7) Consider macro demand priors (consumer demand sensitivity, discretionary spend cycles, category shifts) without inventing fake facts.',
              '8) insightCards must be concise, specific, high-signal, and directly actionable for sales/purchasing/inventory allocation.',
              '9) Do not output weak generic tips like "monitor inventory".',
              '10) Backtest values must be generated with rolling-origin logic: for each backtest month, use only earlier months as training context (no leakage of same-month actual).',
              '11) For insightCards text: max 90 characters, 1 sentence, include a clear action and timeframe where possible.',
              '12) Avoid jargon terms like normalization, outlier, run-rate, discretionary, cadence, compression.',
            ].join('\n\n'),
          },
        ],
      }),
      cache: 'no-store',
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();

      return {
        code: 502,
        message: `OpenAI request failed (${aiResponse.status}): ${errorText.slice(0, 220)}`,
      };
    }

    const aiJson = await aiResponse.json();
    const aiContent = aiJson?.choices?.[0]?.message?.content || '';
    const parsed = extractJsonPayload(aiContent);

    if (!parsed) {
      return {
        code: 500,
        message: 'Unable to parse AI forecast response.',
      };
    }

    const mergedSeries = mergeForecastSeries(baselineSeries, parsed);
    const aiCards = normalizeInsightCards(parsed?.insightCards);
    const fallbackCards = buildFallbackInsightCards({
      labels,
      mergedSeries,
      inventoryAlerts: promptPayload.inventoryAlerts,
      topProducts: promptPayload.topProducts,
    });
    const insightCards = aiCards.length > 0 ? aiCards : fallbackCards;

    return {
      code: 200,
      data: {
        labels,
        series: mergedSeries,
        insightCards,
      },
    };
  } catch (error) {
    return {
      code: 500,
      message: error?.message || 'AI forecast generation failed.',
    };
  }
}
