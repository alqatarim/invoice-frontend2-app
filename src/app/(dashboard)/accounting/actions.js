'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  CHART_OF_ACCOUNTS: '/chart-of-accounts',
  ACCOUNTING_SETTINGS: '/accounting-settings',
  JOURNAL_ENTRIES: '/journal-entries',
  ACCOUNTING_REPORTS: '/accounting-reports',
  INVENTORY_COSTING: '/inventory-costing',
};

const buildQueryString = params => {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const unwrapResponse = response => response?.data || response || {};

export async function getChartOfAccounts(search = '') {
  const response = await fetchWithAuth(
    `${ENDPOINTS.CHART_OF_ACCOUNTS}${buildQueryString({ search })}`,
    { cache: 'no-store' }
  );

  return unwrapResponse(response);
}

export async function getAccountDropdown() {
  const response = await fetchWithAuth(`${ENDPOINTS.CHART_OF_ACCOUNTS}/dropdown`, {
    cache: 'no-store',
  });

  return unwrapResponse(response);
}

export async function createAccount(payload) {
  const response = await fetchWithAuth(ENDPOINTS.CHART_OF_ACCOUNTS, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return unwrapResponse(response);
}

export async function updateAccount(id, payload) {
  const response = await fetchWithAuth(`${ENDPOINTS.CHART_OF_ACCOUNTS}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return unwrapResponse(response);
}

export async function getAccountingSettings() {
  const response = await fetchWithAuth(ENDPOINTS.ACCOUNTING_SETTINGS, {
    cache: 'no-store',
  });

  return unwrapResponse(response);
}

export async function updateAccountingSettings(payload) {
  const response = await fetchWithAuth(ENDPOINTS.ACCOUNTING_SETTINGS, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return unwrapResponse(response);
}

export async function getManualJournals({ page = 1, pageSize = 10, search = '', startDate = '', endDate = '' } = {}) {
  const response = await fetchWithAuth(
    `${ENDPOINTS.JOURNAL_ENTRIES}/manual-journals${buildQueryString({
      page,
      pageSize,
      search,
      startDate,
      endDate,
    })}`,
    {
      cache: 'no-store',
    }
  );

  return unwrapResponse(response);
}

export async function getManualVouchers({ page = 1, pageSize = 10, search = '', startDate = '', endDate = '' } = {}) {
  const response = await fetchWithAuth(
    `${ENDPOINTS.JOURNAL_ENTRIES}/manual-vouchers${buildQueryString({
      page,
      pageSize,
      search,
      startDate,
      endDate,
    })}`,
    {
      cache: 'no-store',
    }
  );

  return unwrapResponse(response);
}

export async function getJournalEntryById(id) {
  const response = await fetchWithAuth(`${ENDPOINTS.JOURNAL_ENTRIES}/${id}`, {
    cache: 'no-store',
  });

  return unwrapResponse(response);
}

export async function createManualJournal(payload) {
  const response = await fetchWithAuth(`${ENDPOINTS.JOURNAL_ENTRIES}/manual-journals`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return unwrapResponse(response);
}

export async function createManualVoucher(payload) {
  const response = await fetchWithAuth(`${ENDPOINTS.JOURNAL_ENTRIES}/manual-vouchers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return unwrapResponse(response);
}

export async function reverseJournalEntry(id, reason = 'Manual reversal') {
  const response = await fetchWithAuth(`${ENDPOINTS.JOURNAL_ENTRIES}/${id}/reverse`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

  return unwrapResponse(response);
}

export async function getTrialBalance({ startDate = '', endDate = '', branchId = '' } = {}) {
  const response = await fetchWithAuth(
    `${ENDPOINTS.ACCOUNTING_REPORTS}/trial-balance${buildQueryString({
      startDate,
      endDate,
      branchId,
    })}`,
    { cache: 'no-store' }
  );

  return unwrapResponse(response);
}

export async function getBalanceSheet({ asOfDate = '', branchId = '' } = {}) {
  const response = await fetchWithAuth(
    `${ENDPOINTS.ACCOUNTING_REPORTS}/balance-sheet${buildQueryString({
      asOfDate,
      branchId,
    })}`,
    { cache: 'no-store' }
  );

  return unwrapResponse(response);
}

export async function getIncomeStatement({ startDate = '', endDate = '', branchId = '' } = {}) {
  const response = await fetchWithAuth(
    `${ENDPOINTS.ACCOUNTING_REPORTS}/income-statement${buildQueryString({
      startDate,
      endDate,
      branchId,
    })}`,
    { cache: 'no-store' }
  );

  return unwrapResponse(response);
}

export async function getGeneralLedger({ accountId = '', startDate = '', endDate = '', branchId = '' } = {}) {
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

export async function runAccountingBackfill() {
  const response = await fetchWithAuth(`${ENDPOINTS.ACCOUNTING_REPORTS}/backfill`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  return unwrapResponse(response);
}

export async function getInventoryCostingSummary() {
  const response = await fetchWithAuth(`${ENDPOINTS.INVENTORY_COSTING}/summary`, {
    cache: 'no-store',
  });

  return unwrapResponse(response);
}
