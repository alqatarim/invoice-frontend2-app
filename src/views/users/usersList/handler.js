import { useCallback, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';

import { usePermission } from '@/Auth/usePermission';
import { addUser, deleteUser, getFilteredUsers, updateUser } from '@/app/(dashboard)/users/actions';
import { orgRoleOptions, userStatusOptions } from '@/data/dataSets';
import { getUserColumns } from './userColumns';
import { resolveUserAvatarUrl } from '@/utils/defaultUserAvatar';

export const useUsersListHandlers = ({
  initialUsers = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialCardCounts = {},
  initialTab = 'ALL',
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialColumns = [],
  initialRoles = [],
  onError,
  onSuccess,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [users, setUsers] = useState(initialUsers);
  const [cardCounts, setCardCounts] = useState(initialCardCounts || {});
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [filterValues, setFilterValues] = useState({
    status: initialTab !== 'ALL' ? [initialTab] : [],
    role: [],
    organizationalRole: [],
    search: '',
    ...initialFilters,
  });
  const loadingRef = useRef(false);

  const [availableColumns, setAvailableColumns] = useState(() => {
    return initialColumns.map(col => ({
      key: col.key || col.id,
      label: col.label,
      visible: col.visible !== undefined ? col.visible : true,
    }));
  });
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogData, setUserDialogData] = useState(null);
  const [userDialogLoading, setUserDialogLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [roles] = useState(initialRoles);

  const permissions = {
    canCreate: usePermission('user', 'create'),
    canUpdate: usePermission('user', 'update'),
    canView: usePermission('user', 'view'),
    canDelete: usePermission('user', 'delete'),
  };

  const loadUsers = useCallback(async (page, pageSize, overrides = {}) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const resolvedFilters = overrides.filters ?? filterValues;
      const resolvedSortBy = overrides.sortBy ?? sortBy;
      const resolvedSortDirection = overrides.sortDirection ?? sortDirection;
      const result = await getFilteredUsers(
        page || pagination.current,
        pageSize || pagination.pageSize,
        resolvedFilters,
        resolvedSortBy,
        resolvedSortDirection
      );

      setUsers(result.users);
      setCardCounts(result.summary || {});
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
      if (onError) onError('Failed to load users');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [filterValues, onError, pagination.current, pagination.pageSize, sortBy, sortDirection]);

  const handleFilterValueChange = useCallback((field, value) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSearchInputChange = useCallback((value) => {
    const nextValue = value ?? '';
    if (nextValue === (filterValues.search || '')) return;

    const nextFilters = {
      ...filterValues,
      search: nextValue,
    };

    setFilterValues(prev => ({
      ...prev,
      search: nextValue,
    }));
    loadUsers(1, pagination.pageSize, { filters: nextFilters });
  }, [filterValues, loadUsers, pagination.pageSize]);

  const handleFilterApply = useCallback(async () => {
    try {
      await loadUsers(1, pagination.pageSize);
      if (onSuccess) onSuccess('Filters applied successfully');
    } catch (error) {
      if (onError) onError('Failed to apply filters');
    }
  }, [loadUsers, onError, onSuccess, pagination.pageSize]);

  const refreshData = useCallback(async () => {
    await loadUsers(pagination.current, pagination.pageSize);
  }, [loadUsers, pagination.current, pagination.pageSize]);

  const handleFilterReset = useCallback(() => {
    const resetFilters = {
      status: [],
      role: [],
      organizationalRole: [],
      search: '',
    };
    setFilterValues(resetFilters);
    setSortBy('');
    setSortDirection('asc');
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    const statusFilter = newValue.includes('ALL') ? [] : newValue;
    handleFilterValueChange('status', statusFilter);
  }, [handleFilterValueChange]);

  const handlePageChange = useCallback((eventOrPage, maybePage) => {
    const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage;
    if (typeof nextPage !== 'number') return;
    loadUsers(nextPage + 1, pagination.pageSize);
  }, [loadUsers, pagination.pageSize]);

  const handlePageSizeChange = useCallback((eventOrSize) => {
    const newPageSize = typeof eventOrSize === 'number'
      ? eventOrSize
      : parseInt(eventOrSize.target.value, 10);
    if (!Number.isFinite(newPageSize)) return;
    loadUsers(1, newPageSize);
  }, [loadUsers]);

  const handleSortRequest = useCallback((property) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortBy(property);
    setSortDirection(newDirection);
    loadUsers(1, pagination.pageSize, { sortBy: property, sortDirection: newDirection });
  }, [loadUsers, pagination.pageSize, sortBy, sortDirection]);

  const handleDelete = useCallback((user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;

    try {
      const response = await deleteUser(userToDelete._id);
      if (response.success) {
        enqueueSnackbar('User deleted successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        await loadUsers(pagination.current, pagination.pageSize);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        enqueueSnackbar(response.message || 'Failed to delete user', {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      enqueueSnackbar('Failed to delete user', {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  }, [enqueueSnackbar, loadUsers, pagination.current, pagination.pageSize, userToDelete]);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, []);

  const handleAdd = useCallback(() => {
    setUserDialogData(null);
    setUserDialogOpen(true);
  }, []);

  const handleEdit = useCallback((user) => {
    setUserDialogData(user);
    setUserDialogOpen(true);
  }, []);

  const handleView = useCallback((userId) => {
    setSelectedUserId(userId);
    setViewDialogOpen(true);
  }, []);

  const handleCloseUserDialog = useCallback(() => {
    setUserDialogOpen(false);
    setUserDialogData(null);
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setViewDialogOpen(false);
    setSelectedUserId(null);
  }, []);

  const handleSubmitUser = useCallback(async (userId, userData, preparedImage = null) => {
    setUserDialogLoading(true);
    let loadingKey = null;

    try {
      loadingKey = enqueueSnackbar(userId ? 'Updating member...' : 'Adding member...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = userId
        ? await updateUser(userId, userData, preparedImage)
        : await addUser(userData, preparedImage);

      closeSnackbar(loadingKey);

      if (response.success) {
        const successMessage = userId ? 'Member updated successfully!' : 'Member added successfully!';
        enqueueSnackbar(
          successMessage,
          { variant: 'success', autoHideDuration: 3000 }
        );
        await loadUsers(pagination.current, pagination.pageSize);
        setUserDialogOpen(false);
        setUserDialogData(null);
        return { success: true, message: successMessage, data: response.data };
      }

      const errorMessage = response.message || 'Failed to save member';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
      return { success: false, message: errorMessage };
    } catch (error) {
      if (loadingKey) {
        closeSnackbar(loadingKey);
      }
      console.error('Error saving user:', error);
      const errorMessage = error.message || 'Failed to save member';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
      return { success: false, message: errorMessage };
    } finally {
      setUserDialogLoading(false);
    }
  }, [closeSnackbar, enqueueSnackbar, loadUsers, pagination.current, pagination.pageSize]);

  const handleManageColumnsOpen = useCallback(() => {
    setManageColumnsOpen(true);
  }, []);

  const handleManageColumnsClose = useCallback(() => {
    setManageColumnsOpen(false);
  }, []);

  const handleColumnCheckboxChange = useCallback((columnKey, checked) => {
    setAvailableColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: checked } : col
      )
    );
  }, []);

  const handleManageColumnsSave = useCallback((setColumns) => {
    setColumns(availableColumns);
    setManageColumnsOpen(false);
    if (onSuccess) onSuccess('Column preferences saved');
  }, [availableColumns, onSuccess]);

  const handleImageError = useCallback((event) => {
    const rowId = event?.currentTarget?.dataset?.userId || '';
    event.target.src = resolveUserAvatarUrl({ userId: rowId });
  }, []);

  const organizationalRoleOptions = useMemo(
    () =>
      orgRoleOptions.map(({ value, label }) => ({
        value,
        label,
      })),
    []
  );

  const roleOptions = useMemo(
    () =>
      (roles || []).map(role => ({
        value: role.value || role.label,
        label: role.label || role.value,
      })),
    [roles]
  );

  const statusOptions = useMemo(() => userStatusOptions, []);

  const columns = useMemo(() => {
    return getUserColumns({
      theme,
      permissions,
      handleEdit,
      handleDelete,
      handleView,
      handleImageError,
    });
  }, [theme, permissions, handleEdit, handleDelete, handleView, handleImageError]);

  return {
    users,
    cardCounts,
    pagination,
    loading,
    filterValues,
    sortBy,
    sortDirection,
    searchTerm: filterValues.search || '',
    availableColumns,
    manageColumnsOpen,
    deleteDialogOpen,
    userToDelete,
    userDialogOpen,
    userDialogData,
    userDialogLoading,
    viewDialogOpen,
    selectedUserId,
    roles,
    permissions,
    roleOptions,
    organizationalRoleOptions,
    statusOptions,
    columns,
    handleFilterValueChange,
    handleSearchInputChange,
    handleFilterApply,
    handleFilterReset,
    handleTabChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleDelete,
    confirmDelete,
    closeDeleteDialog,
    handleAdd,
    handleEdit,
    handleView,
    handleCloseUserDialog,
    handleCloseViewDialog,
    handleSubmitUser,
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnCheckboxChange,
    handleManageColumnsSave,
    handleImageError,
    refreshData,
  };
};
