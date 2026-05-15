'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePermission } from '@/Auth/usePermission';
import { getInventoryMovementHistory } from '@/app/(dashboard)/inventory/actions';
import { getFilteredProducts } from '@/app/(dashboard)/products/actions';
import { useInventoryListHandlers } from '@/handlers/inventory/useInventoryListHandlers';
import { useBranchInventoryHandlers } from '@/handlers/inventory/useBranchInventoryHandlers';
import useAccessibleBranchScope from '@/hooks/useAccessibleBranchScope';
import { getInventoryColumns } from './inventoryColumns';
import { getBranchInventoryColumns } from './branchInventoryColumns';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

const EMPTY_STOCK_DIALOG = {
  open: false,
  type: null,
  branchRow: null,
  anchorEl: null,
  quantity: '',
};

const EMPTY_TRANSFER_DIALOG = {
  open: false,
  branchRow: null,
  toProvince: '',
  toCity: '',
  toDistrict: '',
  toBranchId: '',
  quantity: '',
  notes: '',
};

const EMPTY_CYCLE_COUNT_DIALOG = {
  open: false,
  branchRow: null,
  countedQuantity: '',
  notes: '',
};

const EMPTY_MOVEMENT_DIALOG = {
  open: false,
  loading: false,
  rows: [],
  productName: '',
  branchLabel: '',
};

const getBranchIdentifiers = (branch = {}) => (
  [branch?.branchId, branch?._id]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
);

const branchMatchesIdentifier = (branch = {}, value = '') => {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) return false;

  return getBranchIdentifiers(branch).includes(normalizedValue);
};

const findBranchByIdentifier = (branchList = [], value = '') =>
  (Array.isArray(branchList) ? branchList : []).find((branch) =>
    branchMatchesIdentifier(branch, value)
  ) || null;

const findInventoryBranchRecord = (inventoryBranches = [], branch = {}) => {
  const identifiers = new Set(getBranchIdentifiers(branch));

  return (Array.isArray(inventoryBranches) ? inventoryBranches : []).find((entry) =>
    identifiers.has(String(entry?.branchId || '').trim())
  ) || null;
};

const buildLocationTreeFromBranches = (branchList = []) => {
  const provinceMap = new Map();

  (Array.isArray(branchList) ? branchList : []).forEach((branch) => {
    const province = String(branch?.province || '').trim();
    const city = String(branch?.city || '').trim();
    const district = String(branch?.district || '').trim();

    if (!province || !city) {
      return;
    }

    if (!provinceMap.has(province)) {
      provinceMap.set(province, { province, cities: new Map() });
    }

    const provinceEntry = provinceMap.get(province);

    if (!provinceEntry.cities.has(city)) {
      provinceEntry.cities.set(city, { name: city, districts: new Set() });
    }

    if (district) {
      provinceEntry.cities.get(city).districts.add(district);
    }
  });

  return [...provinceMap.values()]
    .sort((left, right) => left.province.localeCompare(right.province))
    .map((provinceEntry) => ({
      province: provinceEntry.province,
      cities: [...provinceEntry.cities.values()]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((cityEntry) => ({
          name: cityEntry.name,
          districts: [...cityEntry.districts].sort((left, right) => left.localeCompare(right)),
        })),
    }));
};

const buildStockDataFromEntry = (entryData) => ({
  productId: entryData.productId,
  quantity: entryData.quantity,
  notes: 'Initial stock allocation',
  branchEntries: [
    {
      branchId: entryData.branchId,
      branchName: entryData.branchName,
      branchType: entryData.branchType,
      province: entryData.province,
      city: entryData.city,
      district: entryData.district,
      quantity: entryData.quantity,
    },
  ],
});

export function useBranchStockTableHandler({
  theme,
  inventoryItem,
  branches = [],
  provincesCities = [],
  stockLoading,
  onAddStock,
  onRemoveStock,
  onTransfer,
  onCycleCount,
  onViewHistory,
  onSaveBranchEntry,
}) {
  const [newRow, setNewRow] = useState(null);

  const isAnyLoading = Boolean(
    stockLoading?.addStock ||
    stockLoading?.removeStock ||
    stockLoading?.transferStock ||
    stockLoading?.cycleCount
  );

  const inventoryInfo = inventoryItem?.inventory_Info?.[0] || {};
  const batches = Array.isArray(inventoryInfo?.batches) ? inventoryInfo.batches : [];
  const serialNumbers = Array.isArray(inventoryInfo?.serialNumbers) ? inventoryInfo.serialNumbers : [];
  const recentTransfers = Array.isArray(inventoryInfo?.transferHistory)
    ? inventoryInfo.transferHistory.slice(0, 3)
    : [];
  const lastCycleCount = inventoryInfo?.lastCycleCount || null;

  const branchesWithStock = useMemo(
    () => (inventoryItem?.inventory_Info?.[0]?.branches || [])
      .filter((branch) => Number(branch?.quantity || 0) > 0),
    [inventoryItem]
  );

  const provinceDoc = useMemo(
    () => provincesCities.find((province) => province.province === newRow?.province),
    [provincesCities, newRow?.province]
  );

  const cityOptions = provinceDoc?.cities || [];

  const cityDoc = useMemo(
    () => cityOptions.find((city) => city.name === newRow?.city),
    [cityOptions, newRow?.city]
  );

  const districtOptions = cityDoc?.districts || [];

  const filteredBranches = useMemo(
    () =>
      branches.filter((branch) => {
        if (newRow?.province && branch.province !== newRow.province) return false;
        if (newRow?.city && branch.city !== newRow.city) return false;
        if (newRow?.district && branch.district !== newRow.district) return false;

        return true;
      }),
    [branches, newRow?.province, newRow?.city, newRow?.district]
  );

  const buildRowPayload = useCallback(
    (branch) => ({
      rowType: 'branch',
      ...branch,
      parentItem: inventoryItem,
    }),
    [inventoryItem]
  );

  const handleAddClick = useCallback(
    (event, branch) => {
      event.stopPropagation();
      onAddStock?.('add', buildRowPayload(branch), event.currentTarget);
    },
    [buildRowPayload, onAddStock]
  );

  const handleRemoveClick = useCallback(
    (event, branch) => {
      event.stopPropagation();
      onRemoveStock?.('remove', buildRowPayload(branch), event.currentTarget);
    },
    [buildRowPayload, onRemoveStock]
  );

  const handleTransferClick = useCallback(
    (event, branch) => {
      event.stopPropagation();
      onTransfer?.(buildRowPayload(branch));
    },
    [buildRowPayload, onTransfer]
  );

  const handleCycleCountClick = useCallback(
    (event, branch) => {
      event.stopPropagation();
      onCycleCount?.(buildRowPayload(branch));
    },
    [buildRowPayload, onCycleCount]
  );

  const handleHistoryClick = useCallback(
    (event, branch) => {
      event.stopPropagation();
      onViewHistory?.(buildRowPayload(branch));
    },
    [buildRowPayload, onViewHistory]
  );

  const handleAddNewRow = useCallback(() => {
    setNewRow({
      province: '',
      city: '',
      district: '',
      branchId: '',
      quantity: '',
    });
  }, []);

  const handleCancelNewRow = useCallback(() => {
    setNewRow(null);
  }, []);

  const updateNewRow = useCallback((field, value) => {
    setNewRow((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'province') {
        updated.city = '';
        updated.district = '';
        updated.branchId = '';
      } else if (field === 'city') {
        updated.district = '';
        updated.branchId = '';
      } else if (field === 'district') {
        updated.branchId = '';
      }

      return updated;
    });
  }, []);

  const handleSaveNewRow = useCallback(async () => {
    if (!newRow?.branchId || !newRow?.quantity) return;

    const selectedBranch = branches.find((branch) => branch.branchId === newRow.branchId);

    if (!selectedBranch) return;

    await onSaveBranchEntry?.({
      productId: inventoryItem._id,
      branchId: selectedBranch.branchId,
      branchName: selectedBranch.name,
      branchType: selectedBranch.branchType,
      province: selectedBranch.province,
      city: selectedBranch.city,
      district: selectedBranch.district,
      quantity: Number(newRow.quantity),
    });

    setNewRow(null);
  }, [branches, inventoryItem?._id, newRow, onSaveBranchEntry]);

  const selectSx = useMemo(() => ({
    fontSize: '0.8rem',
    '& .MuiSelect-select': {
      py: 0.75,
      px: 1.5,
      fontSize: '0.8rem',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  }), [theme]);

  return {
    newRow,
    isAnyLoading,
    inventoryInfo,
    batches,
    serialNumbers,
    recentTransfers,
    lastCycleCount,
    branchesWithStock,
    cityOptions,
    districtOptions,
    filteredBranches,
    selectSx,
    handleAddClick,
    handleRemoveClick,
    handleTransferClick,
    handleCycleCountClick,
    handleHistoryClick,
    handleAddNewRow,
    handleCancelNewRow,
    handleSaveNewRow,
    updateNewRow,
  };
}

export function useBranchInventoryTableHandler({
  branch,
  stockLoading,
  onAddStock,
  onRemoveStock,
  onTransfer,
  onCycleCount,
  onViewHistory,
  onSaveBranchEntry,
}) {
  const [newRow, setNewRow] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [productInput, setProductInput] = useState('');
  const [productLoading, setProductLoading] = useState(false);

  const isAnyLoading = Boolean(
    stockLoading?.addStock ||
    stockLoading?.removeStock ||
    stockLoading?.transferStock ||
    stockLoading?.cycleCount
  );

  const inventoryItems = Array.isArray(branch?.inventoryItems) ? branch.inventoryItems : [];

  useEffect(() => {
    if (!newRow || productOptions.length) return;

    const fetchProducts = async () => {
      setProductLoading(true);

      try {
        const response = await getFilteredProducts(1, 1000);
        setProductOptions(Array.isArray(response?.products) ? response.products : []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProducts();
  }, [newRow, productOptions.length]);

  const buildBranchRow = useCallback(
    (item) => ({
      rowType: 'branch',
      branchId: branch?.branchId,
      branchName: branch?.name,
      branchType: branch?.branchType,
      province: branch?.province,
      city: branch?.city,
      district: branch?.district,
      quantity: Number(item?.quantity || 0),
      parentItem: {
        _id: item?.productId,
        name: item?.name,
        sku: item?.sku,
        sellingPrice: item?.sellingPrice,
        purchasePrice: item?.purchasePrice,
        inventory_Info: [
          {
            branches: Array.isArray(item?.branches) ? item.branches : [],
            quantity: Number(item?.totalQuantity || 0),
            batches: Array.isArray(item?.batches) ? item.batches : [],
            serialNumbers: Array.isArray(item?.serialNumbers) ? item.serialNumbers : [],
            valuationMethod: item?.valuationMethod || 'FIFO',
            lastCycleCount: item?.lastCycleCount || null,
            transferHistory: Array.isArray(item?.transferHistory) ? item.transferHistory : [],
          },
        ],
      },
    }),
    [branch]
  );

  const handleAddClick = useCallback(
    (event, item) => {
      event.stopPropagation();
      onAddStock?.('add', buildBranchRow(item), event.currentTarget);
    },
    [buildBranchRow, onAddStock]
  );

  const handleRemoveClick = useCallback(
    (event, item) => {
      event.stopPropagation();
      onRemoveStock?.('remove', buildBranchRow(item), event.currentTarget);
    },
    [buildBranchRow, onRemoveStock]
  );

  const handleTransferClick = useCallback(
    (event, item) => {
      event.stopPropagation();
      onTransfer?.(buildBranchRow(item));
    },
    [buildBranchRow, onTransfer]
  );

  const handleCycleCountClick = useCallback(
    (event, item) => {
      event.stopPropagation();
      onCycleCount?.(buildBranchRow(item));
    },
    [buildBranchRow, onCycleCount]
  );

  const handleHistoryClick = useCallback(
    (event, item) => {
      event.stopPropagation();
      onViewHistory?.(buildBranchRow(item));
    },
    [buildBranchRow, onViewHistory]
  );

  const handleAddNewRow = useCallback(() => {
    setNewRow({
      product: null,
      quantity: '',
    });
  }, []);

  const handleCancelNewRow = useCallback(() => {
    setNewRow(null);
    setProductInput('');
  }, []);

  const handleProductChange = useCallback((product) => {
    setNewRow((prev) => ({ ...prev, product }));
  }, []);

  const handleProductInputChange = useCallback((value) => {
    setProductInput(value);
  }, []);

  const handleQuantityChange = useCallback((value) => {
    setNewRow((prev) => ({ ...prev, quantity: value }));
  }, []);

  const handleSaveNewRow = useCallback(async () => {
    if (!newRow?.product?._id || !newRow?.quantity) return;

    await onSaveBranchEntry?.({
      productId: newRow.product._id,
      quantity: Number(newRow.quantity),
      branchId: branch?.branchId,
      branchName: branch?.name,
      branchType: branch?.branchType,
      province: branch?.province,
      city: branch?.city,
      district: branch?.district,
    });

    handleCancelNewRow();
  }, [branch, handleCancelNewRow, newRow, onSaveBranchEntry]);

  return {
    newRow,
    productOptions,
    productInput,
    productLoading,
    isAnyLoading,
    inventoryItems,
    handleAddClick,
    handleRemoveClick,
    handleTransferClick,
    handleCycleCountClick,
    handleHistoryClick,
    handleAddNewRow,
    handleCancelNewRow,
    handleProductChange,
    handleProductInputChange,
    handleQuantityChange,
    handleSaveNewRow,
  };
}

export function useInventoryListViewHandler({
  theme,
  initialInventory = [],
  initialPagination = DEFAULT_PAGINATION,
  initialBranchInventory = [],
  initialBranchPagination = DEFAULT_PAGINATION,
  initialBranches = [],
  initialProvincesCities = [],
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialErrorMessage = '',
}) {
  const permissions = {
    canCreate: usePermission('inventory', 'create'),
    canUpdate: usePermission('inventory', 'update'),
    canView: usePermission('inventory', 'view'),
    canDelete: usePermission('inventory', 'delete'),
  };

  const [activeTab, setActiveTab] = useState('inventory');
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedBranchRows, setExpandedBranchRows] = useState({});
  const [stockDialog, setStockDialog] = useState(EMPTY_STOCK_DIALOG);
  const [transferDialog, setTransferDialog] = useState(EMPTY_TRANSFER_DIALOG);
  const [cycleCountDialog, setCycleCountDialog] = useState(EMPTY_CYCLE_COUNT_DIALOG);
  const [movementDialog, setMovementDialog] = useState(EMPTY_MOVEMENT_DIALOG);
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'success',
  });

  const branches = useMemo(
    () => (Array.isArray(initialBranches) ? initialBranches : []),
    [initialBranches]
  );

  const provincesCities = useMemo(
    () => (Array.isArray(initialProvincesCities) ? initialProvincesCities : []),
    [initialProvincesCities]
  );

  const branchScope = useAccessibleBranchScope({ branchesData: branches });

  const branchOptions = useMemo(() => {
    const scopedOptions = Array.isArray(branchScope.branchOptions) ? branchScope.branchOptions : [];

    return scopedOptions.length ? scopedOptions : branches;
  }, [branchScope.branchOptions, branches]);

  const scopedProvincesCities = useMemo(() => {
    const derivedLocations = buildLocationTreeFromBranches(branchOptions);

    return derivedLocations.length ? derivedLocations : provincesCities;
  }, [branchOptions, provincesCities]);

  const showError = useCallback((message) => {
    setSnackbar({
      open: true,
      message: message || 'Something went wrong',
      severity: 'error',
    });
  }, []);

  const showSuccess = useCallback((message) => {
    setSnackbar({
      open: true,
      message: message || 'Inventory updated successfully',
      severity: 'success',
    });
  }, []);

  const handlers = useInventoryListHandlers({
    initialInventory,
    initialPagination,
    initialFilters,
    initialSortBy,
    initialSortDirection,
    onError: showError,
    onSuccess: showSuccess,
  });

  const branchHandlers = useBranchInventoryHandlers({
    initialBranches: initialBranchInventory,
    initialPagination: initialBranchPagination,
    onError: showError,
  });

  const inventoryColumns = useMemo(
    () => getInventoryColumns({ theme }),
    [theme]
  );

  const branchColumns = useMemo(() => getBranchInventoryColumns(), []);

  const toggleRow = useCallback((rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  const handleRowClick = useCallback((row) => {
    toggleRow(row._id);
  }, [toggleRow]);

  const toggleBranchRow = useCallback((rowId) => {
    setExpandedBranchRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  const handleBranchRowClick = useCallback((row) => {
    toggleBranchRow(row._id);
  }, [toggleBranchRow]);

  const openStockDialog = useCallback((type, branchRow, anchorEl) => {
    setStockDialog({
      open: true,
      type,
      branchRow,
      anchorEl,
      quantity: '',
    });
  }, []);

  const closeStockDialog = useCallback(() => {
    setStockDialog(EMPTY_STOCK_DIALOG);
  }, []);

  const handleStockQuantityChange = useCallback((value) => {
    setStockDialog((prev) => {
      if (prev.type === 'remove') {
        const currentBranchStock = Number(prev.branchRow?.quantity || 0);
        const numValue = Number(value);

        if (numValue > currentBranchStock) {
          return { ...prev, quantity: String(currentBranchStock) };
        }
      }

      return { ...prev, quantity: value };
    });
  }, []);

  const handleStockSubmit = useCallback(async () => {
    try {
      const { branchRow, type, quantity: qtyStr } = stockDialog;
      const quantity = Number(qtyStr || 0);

      if (!quantity || quantity <= 0) {
        showError('Enter a valid quantity');
        return;
      }

      const currentBranchStock = Number(branchRow?.quantity || 0);

      if (type === 'remove' && quantity > currentBranchStock) {
        showError(`Cannot remove more than branch stock (${currentBranchStock} units)`);
        return;
      }

      const stockData = {
        productId: branchRow?.parentItem?._id,
        quantity,
        notes: '',
        branchEntries: [
          {
            branchId: branchRow.branchId,
            branchName: branchRow.branchName,
            branchType: branchRow.branchType,
            province: branchRow.province,
            city: branchRow.city,
            district: branchRow.district,
            quantity,
          },
        ],
      };

      if (type === 'add') {
        await handlers.handleAddStock(stockData);
      } else {
        await handlers.handleRemoveStock(stockData);
      }

      closeStockDialog();
      await branchHandlers.fetchData();
    } catch (error) {
      showError(error.message || `Failed to ${stockDialog.type} stock`);
    }
  }, [branchHandlers, closeStockDialog, handlers, showError, stockDialog]);

  const openTransferDialog = useCallback((branchRow) => {
    setTransferDialog({
      ...EMPTY_TRANSFER_DIALOG,
      open: true,
      branchRow,
    });
  }, []);

  const closeTransferDialog = useCallback(() => {
    setTransferDialog(EMPTY_TRANSFER_DIALOG);
  }, []);

  const updateTransferDialog = useCallback((field, value) => {
    setTransferDialog((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'toProvince') {
        updated.toCity = '';
        updated.toDistrict = '';
        updated.toBranchId = '';
      } else if (field === 'toCity') {
        updated.toDistrict = '';
        updated.toBranchId = '';
      } else if (field === 'toDistrict') {
        updated.toBranchId = '';
      }

      return updated;
    });
  }, []);

  const handleTransferDestinationChange = useCallback((value) => {
    setTransferDialog((prev) => ({ ...prev, toBranchId: value }));
  }, []);

  const handleTransferQuantityChange = useCallback((value) => {
    setTransferDialog((prev) => {
      const sourceStock = Number(prev.branchRow?.quantity || 0);
      const numValue = Number(value);

      if (numValue > sourceStock) {
        return { ...prev, quantity: String(sourceStock) };
      }

      return { ...prev, quantity: value };
    });
  }, []);

  const handleTransferNotesChange = useCallback((value) => {
    setTransferDialog((prev) => ({ ...prev, notes: value }));
  }, []);

  const transferProvinceDoc = useMemo(
    () => scopedProvincesCities.find((province) => province.province === transferDialog.toProvince),
    [scopedProvincesCities, transferDialog.toProvince]
  );

  const transferCityOptions = transferProvinceDoc?.cities || [];

  const transferCityDoc = useMemo(
    () => transferCityOptions.find((city) => city.name === transferDialog.toCity),
    [transferCityOptions, transferDialog.toCity]
  );

  const transferDistrictOptions = transferCityDoc?.districts || [];

  const transferFilteredBranches = useMemo(
    () =>
      branchOptions.filter((branch) => {
        if (branchMatchesIdentifier(branch, transferDialog.branchRow?.branchId)) return false;
        if (transferDialog.toProvince && branch.province !== transferDialog.toProvince) return false;
        if (transferDialog.toCity && branch.city !== transferDialog.toCity) return false;
        if (transferDialog.toDistrict && branch.district !== transferDialog.toDistrict) return false;

        return true;
      }),
    [
      branchOptions,
      transferDialog.branchRow?.branchId,
      transferDialog.toProvince,
      transferDialog.toCity,
      transferDialog.toDistrict,
    ]
  );

  const selectedTransferDestinationBranch = useMemo(
    () => findBranchByIdentifier(branchOptions, transferDialog.toBranchId),
    [branchOptions, transferDialog.toBranchId]
  );

  const destStock = useMemo(() => {
    if (!transferDialog.toBranchId || !transferDialog.branchRow?.parentItem) return 0;

    const inventoryBranches = transferDialog.branchRow.parentItem?.inventory_Info?.[0]?.branches || [];
    const destinationBranch = findBranchByIdentifier(branchOptions, transferDialog.toBranchId);
    const destBranch = destinationBranch
      ? findInventoryBranchRecord(inventoryBranches, destinationBranch)
      : inventoryBranches.find((branch) => branch.branchId === transferDialog.toBranchId);

    return Number(destBranch?.quantity || 0);
  }, [branchOptions, transferDialog.branchRow, transferDialog.toBranchId]);

  const handleTransferSubmit = useCallback(async () => {
    try {
      const fromBranch = transferDialog.branchRow;
      const toBranch = findBranchByIdentifier(branchOptions, transferDialog.toBranchId);
      const quantity = Number(transferDialog.quantity || 0);

      if (!fromBranch || !toBranch) {
        showError('Select a destination branch');
        return;
      }

      if (branchMatchesIdentifier(toBranch, fromBranch.branchId)) {
        showError('Select a different branch for transfer');
        return;
      }

      if (!quantity || quantity <= 0) {
        showError('Enter a valid transfer quantity');
        return;
      }

      const sourceStock = Number(fromBranch.quantity || 0);

      if (quantity > sourceStock) {
        showError(`Cannot transfer more than branch stock (${sourceStock} units)`);
        return;
      }

      await handlers.handleTransferStock({
        productId: fromBranch.parentItem?._id,
        fromBranchId: fromBranch.branchId,
        toBranchId: toBranch.branchId,
        quantity,
        notes: transferDialog.notes || `Transfer from ${fromBranch.branchName} to ${toBranch.name}`,
      });

      closeTransferDialog();
      await branchHandlers.fetchData();
    } catch (error) {
      showError(error.message || 'Failed to transfer stock');
    }
  }, [branchHandlers, branchOptions, closeTransferDialog, handlers, showError, transferDialog]);

  const openCycleCountDialog = useCallback((branchRow) => {
    setCycleCountDialog({
      open: true,
      branchRow,
      countedQuantity: String(Number(branchRow?.quantity || 0)),
      notes: '',
    });
  }, []);

  const closeCycleCountDialog = useCallback(() => {
    setCycleCountDialog(EMPTY_CYCLE_COUNT_DIALOG);
  }, []);

  const handleCycleCountQuantityChange = useCallback((value) => {
    setCycleCountDialog((prev) => ({ ...prev, countedQuantity: value }));
  }, []);

  const handleCycleCountNotesChange = useCallback((value) => {
    setCycleCountDialog((prev) => ({ ...prev, notes: value }));
  }, []);

  const handleCycleCountSubmit = useCallback(async () => {
    try {
      const branchRow = cycleCountDialog.branchRow;
      const countedQuantity = Number(cycleCountDialog.countedQuantity || 0);

      if (!branchRow?.parentItem?._id) {
        showError('Select an inventory branch to count');
        return;
      }

      if (countedQuantity < 0) {
        showError('Counted quantity cannot be negative');
        return;
      }

      await handlers.handleCycleCount({
        productId: branchRow.parentItem._id,
        branchId: branchRow.branchId,
        countedQuantity,
        notes: cycleCountDialog.notes || '',
      });

      closeCycleCountDialog();
      await branchHandlers.fetchData();
    } catch (error) {
      showError(error.message || 'Failed to record cycle count');
    }
  }, [branchHandlers, closeCycleCountDialog, cycleCountDialog, handlers, showError]);

  const handleOpenMovementHistory = useCallback(async (branchRow) => {
    try {
      const resolvedBranch = findBranchByIdentifier(branchOptions, branchRow?.branchId);

      setMovementDialog({
        open: true,
        loading: true,
        rows: [],
        productName: branchRow?.parentItem?.name || branchRow?.name || '',
        branchLabel: resolvedBranch?.name || branchRow?.branchName || '',
      });

      const rows = await getInventoryMovementHistory(
        branchRow?.parentItem?._id || branchRow?.productId,
        resolvedBranch?.branchId || ''
      );

      setMovementDialog((prev) => ({
        ...prev,
        loading: false,
        rows,
      }));
    } catch (error) {
      setMovementDialog((prev) => ({
        ...prev,
        loading: false,
      }));
      showError(error.message || 'Failed to load movement history');
    }
  }, [branchOptions, showError]);

  const closeMovementDialog = useCallback(() => {
    setMovementDialog(EMPTY_MOVEMENT_DIALOG);
  }, []);

  const saveBranchEntry = useCallback(
    async (entryData, errorMessage) => {
      try {
        await handlers.handleAddStock(buildStockDataFromEntry(entryData));
        await branchHandlers.fetchData();
      } catch (error) {
        showError(error.message || errorMessage);
      }
    },
    [branchHandlers, handlers, showError]
  );

  const handleSaveBranchEntry = useCallback(
    (entryData) => saveBranchEntry(entryData, 'Failed to add branch stock'),
    [saveBranchEntry]
  );

  const handleSaveBranchInventoryEntry = useCallback(
    (entryData) => saveBranchEntry(entryData, 'Failed to add branch inventory'),
    [saveBranchEntry]
  );

  const tableColumns = useMemo(() => {
    const cellHandlers = {
      ...handlers,
      permissions,
      openStockDialog,
      stockLoading: handlers.stockLoading,
      expandedRows,
      toggleRow,
      openTransferDialog,
    };

    return inventoryColumns
      .filter((column) => column.visible)
      .map((column) => ({
        ...column,
        renderCell: column.renderCell
          ? (row, rowIndex) => column.renderCell(row, rowIndex, cellHandlers)
          : undefined,
      }));
  }, [
    expandedRows,
    handlers,
    inventoryColumns,
    openStockDialog,
    openTransferDialog,
    permissions,
    toggleRow,
  ]);

  const branchTableColumns = useMemo(() => {
    const cellHandlers = {
      permissions,
      expandedRows: expandedBranchRows,
      toggleRow: toggleBranchRow,
    };

    return branchColumns
      .filter((column) => column.visible)
      .map((column) => ({
        ...column,
        renderCell: column.renderCell
          ? (row, rowIndex) => column.renderCell(row, rowIndex, cellHandlers)
          : undefined,
      }));
  }, [branchColumns, expandedBranchRows, permissions, toggleBranchRow]);

  const filteredInventory = useMemo(
    () => (Array.isArray(handlers.inventory) ? handlers.inventory : []),
    [handlers.inventory]
  );

  const filteredBranchInventory = useMemo(() => {
    const rows = Array.isArray(branchHandlers.branches) ? branchHandlers.branches : [];

    if (!branchScope.isRestrictedToAssignedBranches) {
      return rows;
    }

    const allowedBranchIds = new Set(branchOptions.flatMap(getBranchIdentifiers));

    return rows.filter((branch) =>
      getBranchIdentifiers(branch).some((identifier) => allowedBranchIds.has(identifier))
    );
  }, [branchHandlers.branches, branchOptions, branchScope.isRestrictedToAssignedBranches]);

  const tablePagination = useMemo(() => ({
    page: Math.max(Number(handlers.pagination.current || 1) - 1, 0),
    pageSize: handlers.pagination.pageSize,
    total: handlers.pagination.total,
  }), [handlers.pagination]);

  const branchTablePagination = useMemo(() => ({
    page: Math.max(Number(branchHandlers.pagination.current || 1) - 1, 0),
    pageSize: branchHandlers.pagination.pageSize,
    total: branchHandlers.pagination.total,
  }), [branchHandlers.pagination]);

  const stockDialogQuantity = Number(stockDialog.quantity || 0);
  const currentBranchStock = Number(stockDialog.branchRow?.quantity || 0);
  const projectedBranchStock = stockDialog.type === 'add'
    ? currentBranchStock + stockDialogQuantity
    : Math.max(0, currentBranchStock - stockDialogQuantity);

  const transferQuantity = Number(transferDialog.quantity || 0);
  const sourceStock = Number(transferDialog.branchRow?.quantity || 0);
  const projectedSourceStock = Math.max(0, sourceStock - transferQuantity);
  const projectedDestStock = destStock + transferQuantity;
  const cycleCountQuantity = Number(cycleCountDialog.countedQuantity || 0);
  const currentCountStock = Number(cycleCountDialog.branchRow?.quantity || 0);
  const cycleCountVariance = cycleCountQuantity - currentCountStock;

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  return {
    permissions,
    handlers,
    branchHandlers,
    branchScope,
    branchOptions,
    scopedProvincesCities,
    activeTab,
    setActiveTab,
    expandedRows,
    expandedBranchRows,
    tableColumns,
    branchTableColumns,
    tablePagination,
    branchTablePagination,
    filteredInventory,
    filteredBranchInventory,
    handleRowClick,
    handleBranchRowClick,
    stockDialog,
    closeStockDialog,
    handleStockQuantityChange,
    handleStockSubmit,
    stockDialogQuantity,
    currentBranchStock,
    projectedBranchStock,
    transferDialog,
    closeTransferDialog,
    updateTransferDialog,
    handleTransferDestinationChange,
    handleTransferQuantityChange,
    handleTransferNotesChange,
    transferCityOptions,
    transferDistrictOptions,
    transferFilteredBranches,
    selectedTransferDestinationBranch,
    transferQuantity,
    sourceStock,
    destStock,
    projectedSourceStock,
    projectedDestStock,
    handleTransferSubmit,
    cycleCountDialog,
    closeCycleCountDialog,
    handleCycleCountQuantityChange,
    handleCycleCountNotesChange,
    handleCycleCountSubmit,
    cycleCountQuantity,
    currentCountStock,
    cycleCountVariance,
    movementDialog,
    closeMovementDialog,
    openStockDialog,
    openTransferDialog,
    openCycleCountDialog,
    handleOpenMovementHistory,
    handleSaveBranchEntry,
    handleSaveBranchInventoryEntry,
    snackbar,
    handleSnackbarClose,
    onError: showError,
  };
}
