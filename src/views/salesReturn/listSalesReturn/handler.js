import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getSalesReturnList, deleteSalesReturn } from '@/app/(dashboard)/sales-return/actions';

function useDataHandler({
  initialSalesReturns,
  initialPagination,
  initialSortBy,
  initialSortDirection,
  onError
}) {
  const [salesReturns, setSalesReturns] = useState(initialSalesReturns || []);
  const [pagination, setPagination] = useState(() => {
    const basePagination = initialPagination || { current: 1, pageSize: 10, total: 0 };
    if (initialSalesReturns?.length > 0 && basePagination.total === 0) {
      return { ...basePagination, total: initialSalesReturns.length };
    }
    return basePagination;
  });
  const [sortBy, setSortBy] = useState(initialSortBy || '');
  const [sortDirection, setSortDirection] = useState(initialSortDirection || 'asc');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const loadingRef = useRef(false);
  const stateRef = useRef({
    searchTerm,
    pagination,
    sortBy,
    sortDirection
  });

  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sortBy,
      sortDirection
    };
  }, [searchTerm, pagination, sortBy, sortDirection]);

  const fetchSalesReturns = useCallback(async (params = {}) => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const currentState = stateRef.current;
      const page = params.page || currentState.pagination.current;
      const limit = params.limit || currentState.pagination.pageSize;
      const response = await getSalesReturnList(page, limit);

      if (response?.success) {
        setSalesReturns(response.data || []);
        setPagination((prev) => ({
          current: params.page || prev.current,
          pageSize: params.limit || prev.pageSize,
          total: response.totalRecords || 0
        }));
        return { success: true, data: response.data };
      }

      setSalesReturns([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      throw new Error(response.message || 'Failed to fetch sales returns');
    } catch (error) {
      console.error('Error fetching sales returns:', error);
      onError(error.message || 'Failed to fetch sales returns');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [onError]);

  const handlePageChange = useCallback((newPageZeroBased) => {
    const nextPage = Number(newPageZeroBased) + 1;
    if (!Number.isFinite(nextPage)) {
      return;
    }

    setPagination((prev) => ({ ...prev, current: nextPage }));
    if (nextPage > 1 || searchTerm) {
      fetchSalesReturns({ page: nextPage });
    }
  }, [fetchSalesReturns, searchTerm]);

  const handlePageSizeChange = useCallback((newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, current: 1 }));
    fetchSalesReturns({ limit: newSize, page: 1 });
  }, [fetchSalesReturns]);

  const handleSortChange = useCallback((column, direction) => {
    setSortBy(column);
    setSortDirection(direction);
  }, []);

  const handleSearchInputChange = useCallback(async (value) => {
    if (value === stateRef.current.searchTerm) {
      return;
    }

    setSearching(true);
    setSearchTerm(value);

    try {
      if (value.trim() === '') {
        setSalesReturns(initialSalesReturns || []);
        setPagination((prev) => ({
          ...prev,
          current: 1,
          total: (initialSalesReturns || []).length
        }));
      } else {
        const filtered = (initialSalesReturns || []).filter((item) =>
          item.credit_note_id?.toLowerCase().includes(value.toLowerCase()) ||
          item.customerInfo?.name?.toLowerCase().includes(value.toLowerCase()) ||
          item.customerInfo?.phone?.includes(value)
        );
        setSalesReturns(filtered);
        setPagination((prev) => ({ ...prev, current: 1, total: filtered.length }));
      }
    } catch (error) {
      console.error('Error searching sales returns:', error);
      onError(error.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [initialSalesReturns, onError]);

  const handleSearchSubmit = useCallback(async (event) => {
    event.preventDefault();
    setSearching(true);

    try {
      await fetchSalesReturns({ search: searchTerm, page: 1 });
    } catch (error) {
      console.error('Error submitting search:', error);
      onError(error.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [fetchSalesReturns, onError, searchTerm]);

  const handleSearchClear = useCallback(async () => {
    setSearchTerm('');
    setSearching(true);

    try {
      setSalesReturns(initialSalesReturns || []);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: (initialSalesReturns || []).length
      }));
    } catch (error) {
      console.error('Error clearing search:', error);
      onError(error.message || 'Failed to clear search');
    } finally {
      setSearching(false);
    }
  }, [initialSalesReturns, onError]);

  const handleSearchFocus = useCallback(() => {}, []);
  const handleSearchBlur = useCallback(() => {}, []);

  return {
    salesReturns,
    pagination,
    sortBy,
    sortDirection,
    loading,
    searchTerm,
    searching,
    setSalesReturns,
    setPagination,
    setSortBy,
    setSortDirection,
    setLoading,
    fetchSalesReturns,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSearchInputChange,
    handleSearchSubmit,
    handleSearchClear,
    handleSearchFocus,
    handleSearchBlur,
    setSearchTerm
  };
}

function useActionsHandler({ onError, onSuccess, fetchSalesReturns }) {
  const router = useRouter();
  const [selectedSalesReturn, setSelectedSalesReturn] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleView = useCallback((salesReturn) => {
    const salesReturnId = salesReturn._id;
    router.push(`/sales-return/sales-return-view/${salesReturnId}`);
  }, [router]);

  const handleEdit = useCallback((salesReturn) => {
    const salesReturnId = salesReturn._id;
    router.push(`/sales-return/sales-return-edit/${salesReturnId}`);
  }, [router]);

  const handleDeleteClick = useCallback((salesReturn) => {
    setSelectedSalesReturn(salesReturn);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSalesReturn) {
      return;
    }

    try {
      const response = await deleteSalesReturn(selectedSalesReturn._id);

      if (response.success) {
        onSuccess('Sales return deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedSalesReturn(null);
        fetchSalesReturns();
      } else {
        throw new Error(response.message || 'Failed to delete sales return');
      }
    } catch (error) {
      console.error('Error deleting sales return:', error);
      onError(error.message || 'Failed to delete sales return');
    }
  }, [fetchSalesReturns, onError, onSuccess, selectedSalesReturn]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedSalesReturn(null);
  }, []);

  const handlePrintDownload = useCallback((salesReturnId) => {
    if (!salesReturnId) {
      onError('Invalid sales return selected');
      return;
    }

    window.open(`/sales-return/sales-return-view/${salesReturnId}?print=true`, '_blank');
  }, [onError]);

  const handleProcessRefund = useCallback((salesReturnId) => {
    if (!salesReturnId) {
      onError('Invalid sales return selected');
      return;
    }

    router.push(`/sales-return/process-refund/${salesReturnId}`);
  }, [onError, router]);

  return {
    selectedSalesReturn,
    deleteDialogOpen,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handlePrintDownload,
    handleProcessRefund
  };
}

function useColumnsHandler({ initialColumns }) {
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [tempColumns, setTempColumns] = useState(initialColumns || []);

  const handleManageColumnsOpen = useCallback(() => {
    setManageColumnsOpen(true);
  }, []);

  const handleManageColumnsClose = useCallback(() => {
    setManageColumnsOpen(false);
    setTempColumns(initialColumns || []);
  }, [initialColumns]);

  const handleColumnToggle = useCallback((columnId) => {
    setTempColumns((prev) =>
      prev.map((column) =>
        column.id === columnId
          ? { ...column, visible: !column.visible }
          : column
      )
    );
  }, []);

  const handleManageColumnsSave = useCallback((setColumns) => {
    setColumns(tempColumns);
    setManageColumnsOpen(false);

    try {
      localStorage.setItem('salesReturnListColumns', JSON.stringify(tempColumns));
    } catch (error) {
      console.warn('Failed to save column preferences:', error);
    }
  }, [tempColumns]);

  const handleResetColumns = useCallback(() => {
    setTempColumns(initialColumns || []);
  }, [initialColumns]);

  const loadSavedColumns = useCallback(() => {
    try {
      const saved = localStorage.getItem('salesReturnListColumns');
      if (saved) {
        const savedColumns = JSON.parse(saved);
        setTempColumns(savedColumns);
        return savedColumns;
      }
    } catch (error) {
      console.warn('Failed to load saved column preferences:', error);
    }

    return initialColumns || [];
  }, [initialColumns]);

  const getVisibleColumns = useCallback((columns) => columns.filter((column) => column.visible !== false), []);

  return {
    manageColumnsOpen,
    tempColumns,
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnToggle,
    handleManageColumnsSave,
    handleResetColumns,
    loadSavedColumns,
    getVisibleColumns
  };
}

export function useSalesReturnListHandlers({
  initialSalesReturns,
  initialPagination,
  initialSortBy,
  initialSortDirection,
  initialColumns,
  onError,
  onSuccess
}) {
  const dataHandler = useDataHandler({
    initialSalesReturns,
    initialPagination,
    initialSortBy,
    initialSortDirection,
    onError,
    onSuccess
  });

  const actionsHandler = useActionsHandler({
    onError,
    onSuccess,
    fetchSalesReturns: dataHandler.fetchSalesReturns
  });

  const columnsHandler = useColumnsHandler({
    initialColumns
  });

  const customerOptions = useMemo(
    () =>
      dataHandler.salesReturns?.map((salesReturn) => ({
        _id: salesReturn.customerInfo?._id,
        name: salesReturn.customerInfo?.name
      })).filter((customer) => customer._id && customer.name) || [],
    [dataHandler.salesReturns]
  );

  const salesReturnsWithIndex = useMemo(
    () =>
      dataHandler.salesReturns.map((salesReturn, index) => ({
        ...salesReturn,
        _index: index
      })),
    [dataHandler.salesReturns]
  );

  return {
    salesReturns: salesReturnsWithIndex,
    pagination: dataHandler.pagination,
    loading: dataHandler.loading,
    sortBy: dataHandler.sortBy,
    sortDirection: dataHandler.sortDirection,
    customerOptions,
    fetchSalesReturns: dataHandler.fetchSalesReturns,
    handlePageChange: dataHandler.handlePageChange,
    handlePageSizeChange: dataHandler.handlePageSizeChange,
    handleSortChange: dataHandler.handleSortChange,
    searchTerm: dataHandler.searchTerm,
    searching: dataHandler.searching,
    handleSearchInputChange: dataHandler.handleSearchInputChange,
    handleSearchSubmit: dataHandler.handleSearchSubmit,
    handleSearchClear: dataHandler.handleSearchClear,
    handleSearchFocus: dataHandler.handleSearchFocus,
    handleSearchBlur: dataHandler.handleSearchBlur,
    selectedSalesReturn: actionsHandler.selectedSalesReturn,
    deleteDialogOpen: actionsHandler.deleteDialogOpen,
    handleView: actionsHandler.handleView,
    handleEdit: actionsHandler.handleEdit,
    handleDeleteClick: actionsHandler.handleDeleteClick,
    handleDeleteConfirm: actionsHandler.handleDeleteConfirm,
    handleDeleteCancel: actionsHandler.handleDeleteCancel,
    handlePrintDownload: actionsHandler.handlePrintDownload,
    handleProcessRefund: actionsHandler.handleProcessRefund,
    manageColumnsOpen: columnsHandler.manageColumnsOpen,
    tempColumns: columnsHandler.tempColumns,
    handleManageColumnsOpen: columnsHandler.handleManageColumnsOpen,
    handleManageColumnsClose: columnsHandler.handleManageColumnsClose,
    handleColumnToggle: columnsHandler.handleColumnToggle,
    handleManageColumnsSave: columnsHandler.handleManageColumnsSave,
    handleResetColumns: columnsHandler.handleResetColumns,
    loadSavedColumns: columnsHandler.loadSavedColumns,
    getVisibleColumns: columnsHandler.getVisibleColumns
  };
}
