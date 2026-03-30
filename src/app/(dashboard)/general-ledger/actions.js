'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  CHART_OF_ACCOUNTS: '/chart-of-accounts',
  JOURNAL_ENTRIES: '/journal-entries',
  ACCOUNTING_REPORTS: '/accounting-reports',
};

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const unwrapResponse = (response) => response?.data || response || {};

export async function getAccountDropdown() {
  const response = await fetchWithAuth(`${ENDPOINTS.CHART_OF_ACCOUNTS}/dropdown`, {
    cache: 'no-store',
  });

  return unwrapResponse(response);
}

export async function getGeneralLedger({
  accountId = '',
  startDate = '',
  endDate = '',
  branchId = '',
} = {}) {
  const response = await fetchWithAuth(
    `${ENDPOINTS.ACCOUNTING_REPORTS}/general-ledger${buildQueryString({
      accountId,
      startDate,
      endDate,
      branchId,
    })}`,
    { cache: 'no-store' }
  );

  return unwrapResponse(response);
}

export async function getJournalEntryById(id) {
  const response = await fetchWithAuth(`${ENDPOINTS.JOURNAL_ENTRIES}/${id}`, {
    cache: 'no-store',
  });

  return unwrapResponse(response);
}
