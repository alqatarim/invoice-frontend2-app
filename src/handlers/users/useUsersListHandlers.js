import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { getFilteredUsers, deleteUser, addUser, updateUser, getRoles } from '@/app/(dashboard)/users/actions';
import { getUserColumns } from '@/views/users/usersList/userColumns';
import { usePermission } from '@/Auth/usePermission';
import { useSnackbar } from 'notistack';

export const useUsersListHandlers = ({
     initialUsers = [],
     initialPagination = { current: 1, pageSize: 10, total: 0 },
     initialTab = 'ALL',
     initialFilters = {},
     initialSortBy = '',
     initialSortDirection = 'asc',
     initialColumns = [],
     onError,
     onSuccess,
}) => {
     const router = useRouter();
     const theme = useTheme();
     const { enqueueSnackbar } = useSnackbar();

     // State management - use initial data if provided, otherwise start empty
     const [users, setUsers] = useState(initialUsers);
     const [pagination, setPagination] = useState(initialPagination);
     const [loading, setLoading] = useState(false);
     const [sortBy, setSortBy] = useState(initialSortBy);
     const [sortDirection, setSortDirection] = useState(initialSortDirection);
     const [filterValues, setFilterValues] = useState({
          status: initialTab !== 'ALL' ? [initialTab] : [],
          role: [],
          search: '',
          ...initialFilters,
     });
     const [hasInitialData, setHasInitialData] = useState(initialUsers.length > 0);

     // Column management - convert initialColumns to proper format if needed
     const [availableColumns, setAvailableColumns] = useState(() => {
          return initialColumns.map(col => ({
               key: col.key || col.id,
               label: col.label,
               visible: col.visible !== undefined ? col.visible : true,
          }));
     });
     const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

     // Delete dialog state
     const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
     const [userToDelete, setUserToDelete] = useState(null);

     // User dialog state (for add/edit)
     const [userDialogOpen, setUserDialogOpen] = useState(false);
     const [userDialogData, setUserDialogData] = useState(null);
     const [userDialogLoading, setUserDialogLoading] = useState(false);

     // View dialog state
     const [viewDialogOpen, setViewDialogOpen] = useState(false);
     const [selectedUserId, setSelectedUserId] = useState(null);

     // Roles data
     const [roles, setRoles] = useState([]);

     // Permissions
     const permissions = {
          canCreate: usePermission('user', 'create'),
          canUpdate: usePermission('user', 'update'),
          canView: usePermission('user', 'view'),
          canDelete: usePermission('user', 'delete'),
     };

     // Load roles on mount
     useEffect(() => {
          const loadRoles = async () => {
               try {
                    const rolesData = await getRoles();
                    setRoles(rolesData);
               } catch (error) {
                    console.error('Error loading roles:', error);
               }
          };
          loadRoles();
     }, []);

    // Load users data - only fetch when explicitly called (not on initial mount)
     const loadUsers = useCallback(async (page, pageSize) => {
          setLoading(true);
          try {
               const result = await getFilteredUsers(
                    page || pagination.current,
                    pageSize || pagination.pageSize,
                    filterValues,
                    sortBy,
                    sortDirection
               );

               setUsers(result.users);
               setPagination(result.pagination);
               setHasInitialData(true); // Mark that we've fetched fresh data
          } catch (error) {
               console.error('Error loading users:', error);
               if (onError) onError('Failed to load users');
          } finally {
               setLoading(false);
          }
     }, [pagination.current, pagination.pageSize, filterValues, sortBy, sortDirection, onError]);

    useEffect(() => {
         if (hasInitialData) return;
         loadUsers(1, pagination.pageSize);
    }, [hasInitialData, loadUsers, pagination.pageSize]);

     // Filter handlers
     const handleFilterValueChange = useCallback((field, value) => {
          setFilterValues(prev => ({
               ...prev,
               [field]: value,
          }));
     }, []);

    const handleSearchInputChange = useCallback((value) => {
         const nextValue = value ?? '';
         setFilterValues(prev => ({
              ...prev,
              search: nextValue,
         }));
         loadUsers(1, pagination.pageSize);
    }, [loadUsers, pagination.pageSize]);

     const handleFilterApply = useCallback(async () => {
          try {
               await loadUsers(1, pagination.pageSize);
               if (onSuccess) onSuccess('Filters applied successfully');
          } catch (error) {
               if (onError) onError('Failed to apply filters');
          }
     }, [loadUsers, pagination.pageSize, onSuccess, onError]);

     // Refresh data - useful for manual refresh or after mutations
     const refreshData = useCallback(async () => {
          await loadUsers(pagination.current, pagination.pageSize);
     }, [loadUsers, pagination.current, pagination.pageSize]);

     const handleFilterReset = useCallback(() => {
          const resetFilters = {
               status: [],
               role: [],
               search: '',
          };
          setFilterValues(resetFilters);
          setSortBy('');
          setSortDirection('asc');
     }, []);

     // Tab change handler
     const handleTabChange = useCallback((event, newValue) => {
          const statusFilter = newValue.includes('ALL') ? [] : newValue;
          handleFilterValueChange('status', statusFilter);
     }, [handleFilterValueChange]);

     // Pagination handlers
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

     // Sorting handler
     const handleSortRequest = useCallback((property) => {
          const isAsc = sortBy === property && sortDirection === 'asc';
          const newDirection = isAsc ? 'desc' : 'asc';
          setSortBy(property);
          setSortDirection(newDirection);
          loadUsers(1, pagination.pageSize);
     }, [sortBy, sortDirection, loadUsers, pagination.pageSize]);

     // Delete handlers
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
     }, [userToDelete, loadUsers, enqueueSnackbar]);

     const closeDeleteDialog = useCallback(() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
     }, []);

     // User dialog handlers
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

     const handleSubmitUser = useCallback(async (userId, userData) => {
          setUserDialogLoading(true);
          try {
               const response = userId
                    ? await updateUser(userId, userData)
                    : await addUser(userData);

               if (response.success) {
                    enqueueSnackbar(
                         userId ? 'User updated successfully!' : 'User added successfully!',
                         { variant: 'success', autoHideDuration: 3000 }
                    );
                    await loadUsers(pagination.current, pagination.pageSize);
                    setUserDialogOpen(false);
                    setUserDialogData(null);
                    return true;
               } else {
                    enqueueSnackbar(response.message || 'Failed to save user', {
                         variant: 'error',
                         autoHideDuration: 5000,
                    });
                    return false;
               }
          } catch (error) {
               console.error('Error saving user:', error);
               enqueueSnackbar('Failed to save user', {
                    variant: 'error',
                    autoHideDuration: 5000,
               });
               return false;
          } finally {
               setUserDialogLoading(false);
          }
     }, [loadUsers, enqueueSnackbar, pagination]);

     // Column management handlers
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

     // Image error handler
     const handleImageError = useCallback((event) => {
          event.target.src = '/images/avatars/default-avatar.png';
     }, []);

     // Get filtered options for filters - use the same roles from API
     const roleOptions = useMemo(() => [
          { value: 'Adminss', label: 'Admin' },
          { value: 'Super Admin', label: 'Super Admin' },
          { value: 'admin', label: 'Admin' },
          { value: 'manager', label: 'Manager' },
          { value: 'user', label: 'User' },
          { value: 'accountant', label: 'Accountant' },
          { value: 'developer', label: 'Developer' },
          { value: 'guest', label: 'Guest' },
     ], []);

     const statusOptions = useMemo(() => [
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
     ], []);

     // Get columns with handlers - use proper theme
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
          // Data
          users,
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
          hasInitialData,

          // Dialog states
          userDialogOpen,
          userDialogData,
          userDialogLoading,
          viewDialogOpen,
          selectedUserId,
          roles,

          // Permissions
          permissions,

          // Options for filters
          roleOptions,
          statusOptions,

          // Columns
          columns,

          // Handlers
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
