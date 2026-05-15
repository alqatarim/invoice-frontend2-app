'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildProductDescription, parseProductDescription } from '@/utils/productMeta';
import {
  deleteProduct,
  getFilteredProducts,
  updateProduct,
} from '@/app/(dashboard)/products/actions';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

export function useProductListHandler({
  initialProducts = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
  onSuccess,
}) {
  const router = useRouter();

  const handleOpenViewPage = useCallback((productId) => {
    router.push(`/products/product-view/${productId}`);
  }, [router]);

  const handleOpenEditPage = useCallback((productId) => {
    router.push(`/products/product-edit/${productId}`);
  }, [router]);

  const [products, setProducts] = useState(initialProducts || []);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const loadingRef = useRef(false);
  const stateRef = useRef({
    pagination: initialPagination,
    sortBy: initialSortBy,
    sortDirection: initialSortDirection,
    filters: {},
    searchTerm: '',
  });

  useEffect(() => {
    stateRef.current = {
      pagination,
      sortBy,
      sortDirection,
      filters,
      searchTerm,
    };
  }, [pagination, sortBy, sortDirection, filters, searchTerm]);

  const fetchProducts = useCallback(async (params = {}) => {
    if (loadingRef.current) return null;

    loadingRef.current = true;
    setLoading(true);

    try {
      const currentState = stateRef.current;
      const page = params.page ?? currentState.pagination.current;
      const pageSize = params.pageSize ?? currentState.pagination.pageSize;
      const nextFilters = params.filters ?? currentState.filters;
      const nextSortBy = params.sortBy ?? currentState.sortBy;
      const nextSortDirection = params.sortDirection ?? currentState.sortDirection;

      const result = await getFilteredProducts(
        page,
        pageSize,
        nextFilters,
        nextSortBy,
        nextSortDirection
      );

      setProducts(result?.products || []);
      setPagination(result?.pagination || DEFAULT_PAGINATION);
      setFilters(nextFilters);
      setSortBy(nextSortBy);
      setSortDirection(nextSortDirection);

      if (params.search !== undefined) {
        setSearchTerm(params.search);
      }

      return result;
    } catch (error) {
      onError?.(error.message || 'Failed to fetch products');
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [onError]);

  const refreshData = useCallback(() => {
    const currentState = stateRef.current;

    return fetchProducts({
      page: currentState.pagination.current,
      pageSize: currentState.pagination.pageSize,
      filters: currentState.filters,
      sortBy: currentState.sortBy,
      sortDirection: currentState.sortDirection,
    });
  }, [fetchProducts]);

  const handlePageChange = useCallback(
    newPageZeroBased => {
      const nextPage = Number(newPageZeroBased) + 1;

      if (!Number.isFinite(nextPage)) return;

      setPagination(current => ({ ...current, current: nextPage }));
      fetchProducts({ page: nextPage });
    },
    [fetchProducts]
  );

  const handlePageSizeChange = useCallback(
    newPageSize => {
      const pageSize = Number(newPageSize);

      if (!Number.isFinite(pageSize) || pageSize <= 0) return;

      setPagination(current => ({ ...current, current: 1, pageSize }));
      fetchProducts({ page: 1, pageSize });
    },
    [fetchProducts]
  );

  const handleSortRequest = useCallback(
    (columnKey, direction) => {
      const currentState = stateRef.current;
      const nextDirection =
        direction ||
        (currentState.sortBy === columnKey && currentState.sortDirection === 'asc'
          ? 'desc'
          : 'asc');

      setSortBy(columnKey);
      setSortDirection(nextDirection);
      fetchProducts({ page: 1, sortBy: columnKey, sortDirection: nextDirection });
    },
    [fetchProducts]
  );

  const handleSearchInputChange = useCallback(
    async value => {
      if (value === stateRef.current.searchTerm) return;

      const trimmed = String(value || '').trim();
      const nextFilters = { ...stateRef.current.filters };

      if (trimmed) {
        nextFilters.search_product = trimmed;
      } else {
        delete nextFilters.search_product;
      }

      setSearchTerm(value);

      try {
        await fetchProducts({ page: 1, filters: nextFilters, search: value });
      } catch (error) {
        onError?.(error.message || 'Search failed');
      }
    },
    [fetchProducts, onError]
  );

  const handleDelete = useCallback(
    async productId => {
      try {
        const response = await deleteProduct(productId);

        if (response && response.success === false) {
          throw new Error(response.error?.message || response.message || 'Failed to delete product');
        }

        onSuccess?.('Product deleted successfully!');
        await refreshData();

        return response;
      } catch (error) {
        onError?.(error.message || 'Failed to delete product');
        return { success: false, message: error.message || 'Failed to delete product' };
      }
    },
    [onError, onSuccess, refreshData]
  );

  const handleView = useCallback(productId => {
    if (!productId) return;
    handleOpenViewPage(productId);
  }, [handleOpenViewPage]);

  const handleEdit = useCallback(productId => {
    if (!productId) return;
    handleOpenEditPage(productId);
  }, [handleOpenEditPage]);

  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = useCallback((rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  const handleRowClick = useCallback((row) => {
    const { meta } = parseProductDescription(row.productDescription);
    const variantsCount = Array.isArray(meta?.variants) ? meta.variants.length : 0;

    if (!variantsCount) return;
    toggleRow(row._id);
  }, [toggleRow]);

  const handleSaveVariants = useCallback(async (product, nextVariants) => {
    try {
      const { description, meta } = parseProductDescription(product.productDescription);
      const updatedMeta = { ...meta, variants: nextVariants };
      const updatedDescription = buildProductDescription(description, updatedMeta);

      const payload = {
        name: product.name || '',
        type: product.type || 'product',
        sku: product.sku || '',
        discountValue: product.discountValue || 0,
        barcode: product.barcode || '',
        units: product.units?._id || product.units || '',
        category: product.category?._id || product.category || '',
        sellingPrice: product.sellingPrice || '',
        purchasePrice: product.purchasePrice || '',
        discountType: product.discountType || '',
        alertQuantity: product.alertQuantity || '',
        tax: product.tax?._id || product.tax || '',
        productDescription: updatedDescription,
      };

      onSuccess?.('Updating variant details...');
      const response = await updateProduct(product._id, payload);

      if (!response?.success) {
        const errorMessage = response?.message || 'Failed to update variants';
        onError?.(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess?.('Variants updated successfully!');
      await refreshData();
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update variants';
      onError?.(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onError, onSuccess, refreshData]);

  const productsWithIndex = useMemo(
    () =>
      products.map((product, index) => ({
        ...product,
        _index: index,
      })),
    [products]
  );

  return {
    products: productsWithIndex,
    pagination,
    loading,
    searchTerm,
    sortBy,
    sortDirection,
    expandedRows,
    refreshData,
    toggleRow,
    handleRowClick,
    handleView,
    handleEdit,
    handleDelete,
    handleSaveVariants,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
  };
}

export default useProductListHandler;
