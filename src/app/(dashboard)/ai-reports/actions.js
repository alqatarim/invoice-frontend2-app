'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const unwrap = (response) => response?.data ?? response ?? {};

export async function askAiReport({
  messages = [],
  branchId = '',
  locale = 'en',
  reportContext = {},
} = {}) {
  try {
    const response = await fetchWithAuth('/ai-reports/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, branchId, locale, reportContext }),
      cache: 'no-store',
    });

    if (response?.error) {
      return {
        success: false,
        message: response.error,
        data: { blocks: [], suggestedFollowUps: [], meta: {} },
      };
    }

    return {
      success: response?.code === 200,
      message: response?.message || 'OK',
      data: unwrap(response),
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || 'Failed to reach AI Reports service.',
      data: { blocks: [], suggestedFollowUps: [], meta: {} },
    };
  }
}

export async function getAiReportSuggestions({ branchId = '' } = {}) {
  try {
    const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
    const response = await fetchWithAuth(`/ai-reports/suggestions${query}`, {
      cache: 'no-store',
    });

    if (response?.error) {
      return { suggestions: [], lowStockCount: 0 };
    }

    return unwrap(response);
  } catch {
    return { suggestions: [], lowStockCount: 0 };
  }
}
