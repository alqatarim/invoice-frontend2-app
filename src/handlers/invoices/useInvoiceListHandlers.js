import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';
import { searchHandler } from './list/searchHandler';
import { convertDialogHandler } from './list/convertDialogHandler';
import { tabHandler } from './list/tabHandler';

/**
 * useInvoiceListHandlers
 * Composes data, actions, and search hooks for invoice list feature.
 */
export function useInvoiceListHandlers(options) {
  // Data/state management
  const data = dataHandler(options);

  // Tab state management
  const tabState = tabHandler({ initialTab: options.initialTab });

  // Actions (pass fetchData, pagination, filters, tab for refresh)
  const actions = actionsHandler({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: (...args) => data.fetchData(tabState.tab, ...args),
    pagination: data.pagination,
    filters: data.filters,
    tab: tabState.tab,
  });

  // Convert dialog logic
  const convertDialog = convertDialogHandler({
    handleConvertToSalesReturn: actions.handleConvertToSalesReturn,
    onError: options.onError,
    onSuccess: options.onSuccess,
  });

  // Search/autocomplete
  const search = searchHandler();

  return {
    ...data,
    ...actions,
    ...search,
    ...convertDialog,
    ...tabState,
  };
}