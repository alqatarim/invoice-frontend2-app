import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
     Card,
     Button,
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     FormControlLabel,
     Checkbox,
     FormGroup,
     Grid,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { useSearchParams } from 'next/navigation';

import PurchaseHead from '@/views/purchases/listPurchase/purchaseHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { usePurchaseListHandlers } from '@/handlers/purchases/list/usePurchaseListHandlers';
import { formatCurrency } from '@/utils/currencyUtils';
import { getPurchaseColumns } from './purchaseColumns';
import AppSnackbar from '@/components/shared/AppSnackbar';

/**
 * Simplified PurchaseList Component - matches purchase order list structure
 */
const PurchaseList = ({ initialPurchases, initialPagination, vendors = [] }) => {
     const theme = useTheme();
     const { data: session } = useSession();
     const searchParams = useSearchParams();

     // Permissions
     const permissions = {
          canCreate: usePermission('purchase', 'create'),
          canUpdate: usePermission('purchase', 'update'),
          canView: usePermission('purchase', 'view'),
          canDelete: usePermission('purchase', 'delete'),
     };

     // Snackbar state
     const [snackbar, setSnackbar] = useState({
          open: false,
          message: '',
          severity: 'success',
     });

     // Notification handlers
     const onError = React.useCallback(msg => {
          setSnackbar({ open: true, message: msg, severity: 'error' });
     }, []);

     const onSuccess = React.useCallback(msg => {
          setSnackbar({ open: true, message: msg, severity: 'success' });
     }, []);

     // Initialize simplified handlers
     const handlers = usePurchaseListHandlers({
          initialPurchases,
          initialPagination,
          onError,
          onSuccess,
     });

     // Column management
     const columns = useMemo(() => {
          if (!theme || !permissions) return [];
          return getPurchaseColumns({ theme, permissions });
     }, [theme, permissions]);

     const [columnsState, setColumns] = useState(() => {
          if (typeof window !== 'undefined' && columns.length > 0) {
               const saved = localStorage.getItem('purchaseVisibleColumns');
               if (saved) {
                    try {
                         const parsed = JSON.parse(saved);
                         return Array.isArray(parsed) ? parsed : columns;
                    } catch (e) {
                         console.warn('Failed to parse saved column preferences:', e);
                    }
               }
          }
          return columns;
     });

     const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

     React.useEffect(() => {
          if (columns.length > 0 && columnsState.length === 0) {
               setColumns(columns);
          }
     }, [columns, columnsState.length]);

     const handleColumnCheckboxChange = React.useCallback((columnKey, checked) => {
          setColumns(prev => prev.map(col =>
               col.key === columnKey ? { ...col, visible: checked } : col
          ));
     }, []);

     const handleSaveColumns = React.useCallback(() => {
          setManageColumnsOpen(false);
          if (typeof window !== 'undefined') {
               localStorage.setItem('purchaseVisibleColumns', JSON.stringify(columnsState));
          }
     }, [columnsState]);

     // Table columns
     const tableColumns = useMemo(() => {
          const cellHandlers = {
               handleDelete: handlers.handleDelete,
               handleView: handlers.handleView,
               handleEdit: handlers.handleEdit,
               handleClone: handlers.handleClone,
               handleSend: handlers.handleSend,
               handlePrintDownload: handlers.handlePrintDownload,
               openConvertDialog: handlers.openConvertDialog,
               permissions,
               pagination: handlers.pagination,
          };

          return columnsState
               .filter(col => col.visible)
               .map(col => ({
                    ...col,
                    renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
               }));
     }, [columnsState, handlers, permissions]);

     const tablePagination = useMemo(() => ({
          page: handlers.pagination.current - 1,
          pageSize: handlers.pagination.pageSize,
          total: handlers.pagination.total
     }), [handlers.pagination]);

     return (
          <div className='flex flex-col gap-5'>
               <PurchaseHead
                    purchaseListData={handlers.purchases}
                    isLoading={handlers.loading}
               />

               <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                         <CustomListTable
                              addRowButton={
                                   permissions.canCreate && (
                                        <Button
                                             component={Link}
                                             href="/purchases/purchase-add"
                                             variant="contained"
                                             startIcon={<Icon icon="tabler:plus" />}
                                        >
                                             New Purchase
                                        </Button>
                                   )
                              }
                              columns={tableColumns}
                              rows={handlers.purchases}
                              loading={handlers.loading}
                              pagination={tablePagination}
                              onPageChange={(page) => handlers.handlePageChange(page)}
                              onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
                              onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
                              sortBy={handlers.sortBy}
                              sortDirection={handlers.sortDirection}
                              noDataText="No purchases found"
                              rowKey={(row) => row._id || row.id}
                              showSearch={true}
                              searchValue={handlers.searchTerm || ''}
                              onSearchChange={handlers.handleSearchInputChange}
                              searchPlaceholder="Search purchases..."
                              onRowClick={
                                   permissions.canView
                                        ? (row) => handlers.handleView(row._id)
                                        : undefined
                              }
                              enableHover
                         />
                    </Grid>
               </Grid>

               <Dialog
                    open={manageColumnsOpen}
                    onClose={() => setManageColumnsOpen(false)}
                    maxWidth="sm"
                    fullWidth
               >
                    <DialogTitle>Manage Columns</DialogTitle>
                    <DialogContent>
                         <FormGroup>
                              {columnsState.map((column) => (
                                   <FormControlLabel
                                        key={column.key}
                                        control={
                                             <Checkbox
                                                  checked={column.visible}
                                                  onChange={(e) => handleColumnCheckboxChange(column.key, e.target.checked)}
                                             />
                                        }
                                        label={column.label}
                                   />
                              ))}
                         </FormGroup>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={() => setManageColumnsOpen(false)} color="secondary">
                              Cancel
                         </Button>
                         <Button onClick={handleSaveColumns} color="primary" variant="contained">
                              Save
                         </Button>
                    </DialogActions>
               </Dialog>

               <AppSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
                    autoHideDuration={6000}
               />

          </div>
     );
};

export default PurchaseList;
