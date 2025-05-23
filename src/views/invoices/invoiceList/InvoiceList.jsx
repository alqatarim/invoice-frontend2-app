import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import InvoiceHead from '@/views/invoices/invoiceList/invoiceHead';
import InvoiceFilter from '@/views/invoices/invoiceList/invoiceFilter';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
    Box,
    Typography,
    Card,
    Button,
    Grid,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Skeleton,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    Send as SendIcon,
    ContentCopy as CopyIcon,
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon,
    Replay as ReplayIcon,
    FilterList as FilterListIcon,
    ViewColumn as ViewColumnIcon,
    Clear as ClearIcon,
    Print as PrintIcon,
    Link as LinkIcon,
} from '@mui/icons-material';

import moment from 'moment';
import { useTheme } from '@mui/material/styles'
// ** Import the usePermission hook **
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { useSearchParams } from 'next/navigation';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useInvoiceListHandlers } from '@/handlers/invoices/useInvoiceListHandlers';
import { invoiceTabs } from '@/data/dataSets';
import menuHandler from '@/handlers/invoices/list/menuHandler';
import { actionsHandler } from '@/handlers/invoices/list/actionsHandler';
import { formatCurrency } from '@/utils/currencyUtils';
import { statusOptions } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';

/**
 * InvoiceList Component
 * Manages and displays a list of invoices with filtering, sorting, and pagination.
 *
 * @returns JSX.Element
 */
const InvoiceList = ({
    initialInvoices = [],
  pagination: initialPagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts: initialCardCounts = {},
  tab: initialTab = 'ALL',
  filters: initialFilters = {},
  isLoading: initialIsLoading = false,
  sortBy: initialSortBy = '',
  sortDirection: initialSortDirection = 'asc',
  fetchData: externalFetchData,
  ...rest
}) => {

  const theme = useTheme();

    // ** Replace session-based permissions with usePermission hook **
    const { data: session, status } = useSession();
    const user = session?.user;
    const canCreate = usePermission('invoice', 'create');
    const canUpdate = usePermission('invoice', 'update');
    const canView = usePermission('invoice', 'view');
    const canDelete = usePermission('invoice', 'delete');


    const [pagination, setPagination] = useState(initialPagination);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(initialIsLoading);
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [sortDirection, setSortDirection] = useState(initialSortDirection);





        const [filterOpen, setFilterOpen] = useState(false);
    const [filterValues, setFilterValues] = useState(initialFilters);

    const [manageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [availableColumns, setAvailableColumns] = useState([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'error', 'warning', 'info', 'success'
    });





    const searchParams = useSearchParams();

    // useEffect(() => {
    //     const success = searchParams.get('success');
    //     if (success) {
    //         setSnackbar({
    //             open: true,
    //             message: success,
    //             severity: 'success',
    //         });
    //     }
    // }, [searchParams]);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    /**
     * Handle filter changes.
     *
     * @param {Object} newFilters - The new filter values.
     */
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    /**
     * Toggle filter drawer open/close.
     */
    const handleFilterToggle = () => {
        setFilterOpen(!filterOpen);
    };




    /**
     * Determine if any filter is applied.
     *
     * @returns {boolean} - Whether any filter is applied.
     */
    const isFilterApplied = useMemo(() => {
        return (
            (filters.customer && filters.customer.length > 0) ||
            (filters.invoiceNumber && filters.invoiceNumber.length > 0) ||
            (filters.fromDate) ||
            (filters.toDate) ||
            (filters.status && filters.status.length > 0)
        );
    }, [filters]);


    // Handlers
    const onError = (msg) => setSnackbar({ open: true, message: msg, severity: 'error' });
    const onSuccess = (msg) => setSnackbar({ open: true, message: msg, severity: 'success' });

    const {
        invoices: invoicesFromHandlers,
        pagination: paginationFromHandlers,
        tab,
        handleTabChange,
        filters: filtersFromHandlers,
        setFilters: setFiltersFromHandlers,
        // loading: loadingFromHandlers,
        sortBy: sortByFromHandlers,
        sortDirection: sortDirectionFromHandlers,
        fetchData: fetchDataFromHandlers,
        handleClone: handleCloneFromHandlers,
        handleSend: handleSendFromHandlers,
        handleConvertToSalesReturn: handleConvertToSalesReturnFromHandlers,
        handlePrintDownload: handlePrintDownloadFromHandlers,
        handleSendPaymentLink: handleSendPaymentLinkFromHandlers,
        handlePageChange,
        handlePageSizeChange,
        handleSortRequest,
        customerOptions,
        invoiceOptions,
        // handleCustomerSearch,
        // handleInvoiceSearch,
        // setCustomerOptions,
        // setInvoiceOptions,
        convertDialogOpen,
        // invoiceToConvert,
        openConvertDialog,
        closeConvertDialog,
        confirmConvertToSalesReturn,
    } = useInvoiceListHandlers({
        initialInvoices,
        initialPagination,
        initialTab,
        initialFilters,
        initialSortBy,
        initialSortDirection,
        onError,
        onSuccess,
    });

    const invoiceListActions = actionsHandler({
        onSuccess,
        onError,
        fetchData: fetchDataFromHandlers,
        pagination: paginationFromHandlers,
        filters: filtersFromHandlers,
        tab,
    });


    // Declarative columns array with renderCell logic
    const columns = [
      {
        key: 'invoiceNumber',
        visible: true,
        label: 'Invoice No',
        sortable: true,
        renderCell: (row, rowIdx) => (
          <Link href={`/invoices/invoice-view/${row._id}`} passHref>
            <Typography sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }} align='center'>
              {row.invoiceNumber || 'N/A'}
            </Typography>
          </Link>
        ),
      },
      {
        key: 'createdOn',
        visible: true,
        label: 'Created',
        sortable: true,
        renderCell: (row) => (
            <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
            {row.invoiceDate ? moment(row.invoiceDate).format('DD MMM YY') : 'N/A'}
            </Typography>
        ),
      },
      {
        key: 'invoiceTo',
        visible: true,
        label: 'Invoice To',
        renderCell: (row) => (


            <Link href={`/invoices/invoice-list/invoice-view/${row.customerId?._id}`} passHref>
              <Typography sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} variant="body1" color='primary.main' className='text-[0.9rem] text-start' >{row.customerId?.name || 'Deleted Customer'}</Typography>
            </Link>

        ),
      },
      {
        key: 'amounts',
        label: 'Amount',
        visible: true,
        align: 'center',
        renderCell: (row) => {
          const total = Number(row.TotalAmount) || 0;
          const paid = Number(row.paidAmount) || 0;
          const percentPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
          return (
            <Box className="flex flex-col min-w-[130px] w-full">
              {/* Top row: paid left, total right */}
              <Box className="flex flex-row justify-between items-center mb-0.5 w-full">

                  <Typography color="text.primary" className='text-[0.9rem]'>{paid}</Typography>

                <Box className="flex items-center gap-1 min-w-[48px] justify-end">
                  <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
                  <Typography color="text.primary" className='text-[0.9rem] font-medium'>{total}</Typography>
                </Box>
              </Box>
              {/* Progress bar below */}
              <Box className="flex-1 w-full">
                <LinearProgress variant="determinate" color='info' value={percentPaid} />
              </Box>
            </Box>
          );
        },
      },
      {
        key: 'dueDate',
        label: 'Due Date',
        visible: true,
        align: 'center',
        renderCell: (row) => (
            <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
            {row.dueDate ? moment(row.dueDate).format('DD MMM YY') : 'N/A'}
            </Typography>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        visible: true,
        align: 'center',
        renderCell: (row) => <Chip className='mx-0' size='small' variant='tonal' label={statusOptions.find(opt => opt.value === row.status)?.label || ''} color={statusOptions.find(opt => opt.value === row.status)?.color || 'default'} />,
      },
      {
        key: 'action',
        label: '',
        visible: true,
        align: 'right',
        renderCell: (row) => {
          // Build options array based on permissions and handlers
          const options = [];
          if (canView) {
            options.push({
              text: 'View',
              icon: <Icon icon="mdi:eye-outline" />,
              href: `/invoices/invoice-view/${row._id}`,
             linkProps: {
                    className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
                  }
            });
          }
          if (canUpdate) {
            options.push({
              text: 'Edit',
              icon:  <Icon icon="mdi:edit-outline" />,
              href: `/invoices/edit/${row._id}`,
            linkProps: {
                    className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
                  }
            });
          }
          if (canCreate) {
            options.push({
              text: 'Clone',
              icon: <Icon icon="mdi:content-duplicate" />,
              menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => handleCloneFromHandlers(row.id || row._id)
              }
            });


            options.push({
              text: 'Send',
              icon: <Icon icon="mdi:invoice-send-outline" />,
              menuItemProps: {
                 className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => handleSendFromHandlers(row.id || row._id)
              }
            });
          }
          if (canUpdate) {
            options.push({
              text: 'Convert to Sales Return',
              icon: <Icon icon="mdi:invoice-export-outline" style={{ transform: 'scaleX(-1)' }} />,
              menuItemProps: {
                 className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => openConvertDialog(row)
              }
            });
            options.push({
              text: 'Print & Download',
              icon: <Icon icon="mdi:printer-outline" />,
              menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => handlePrintDownloadFromHandlers(row._id)
              }
            });
          }
          if (canCreate) {
            options.push({
              text: 'Send Payment Link',
              icon: <Icon icon="mdi:link-variant" />,
              menuItemProps: {
               className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => handleSendPaymentLinkFromHandlers(row._id)
              }
            });
          }
          return (
            <OptionMenu
              icon={<MoreVertIcon />}
              iconButtonProps={{ size: 'small', 'aria-label': 'more actions' }}
              options={options}
            />
          );
        },
      },
    ];

    const [columnsState, setColumns] = useState(columns);


    /**
     * Handle resetting filters and sorting.
     */
    const handleReset = () => {
        setColumns(columns);
        setFilters({});
        setSortBy('');
        setSortDirection('asc');
        localStorage.removeItem('invoiceFilters');
        localStorage.removeItem('invoiceVisibleColumns');
        localStorage.removeItem('invoiceSortBy');
        localStorage.removeItem('invoiceSortDirection');
        setPagination((prev) => ({
            ...prev,
            current: 1,
            pageSize: 10,
        }));
        fetchData('ALL', 1, 10, {});
    };



    // Fetch data when tab, filters, pagination, sortBy, or sortDirection change
    useEffect(() => {
        fetchDataFromHandlers(
            tab,
            paginationFromHandlers.current,
            paginationFromHandlers.pageSize,
            filtersFromHandlers,
            sortByFromHandlers,
            sortDirectionFromHandlers
        );
    }, [tab, filtersFromHandlers, paginationFromHandlers.current, paginationFromHandlers.pageSize, sortByFromHandlers, sortDirectionFromHandlers]);

    return (
        <div>
            {/* 1st Segment: Stat Cards */}
            <InvoiceHead
                invoiceListData={initialCardCounts}
                currencyData={formatCurrency(0).replace(/\d|\.|,/g, '').trim()}
                isLoading={loading}
            />

            {/* 2nd Segment: Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mt: 6 }}>
                {(canCreate) && (
                    <Button variant="contained" color="primary" href="/invoices/add">
                        New Invoice
                    </Button>
                )}
            </Box>

            {/* 3rd Segment: Status Tabs */}
            <Box sx={{ mb: 2 }}>
                <Grid container spacing={2} className="items-center justify-between">
                    <Grid item xs="auto">
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tab} onChange={handleTabChange} aria-label="Invoice Tabs" variant="scrollable" scrollButtons="auto">
                                {invoiceTabs.map(tabObj => (
                                    <Tab key={tabObj.value} label={tabObj.label} value={tabObj.value} />
                                ))}
                            </Tabs>
                        </Box>
                    </Grid>
                    <Grid item xs="auto">
                        <Button
                            variant="text"
                            startIcon={<ClearIcon />}
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="text"
                            startIcon={<FilterListIcon />}
                            onClick={handleFilterToggle}
                        >
                            Filter {isFilterApplied && '*'} {/* Add indicator if filters are applied */}
                        </Button>
                        <Button
                            variant="text"
                            startIcon={<ViewColumnIcon />}
                            onClick={() => handleManageColumnsOpen(setAvailableColumns, setManageColumnsOpen, columns)}
                        >
                            Columns
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* 4th Segment: Invoice Table */}
            <Card>
                <CustomListTable
                    columns={columns}
                    rows={invoicesFromHandlers}
                    loading={loading}
                    pagination={{ page: paginationFromHandlers.current - 1, pageSize: paginationFromHandlers.pageSize, total: paginationFromHandlers.total }}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handlePageSizeChange}
                    onSort={handleSortRequest}
                    sortBy={sortByFromHandlers}
                    sortDirection={sortDirectionFromHandlers}
                    noDataText="No invoices found."
                    rowKey={(row, idx) => row._id || row.id || idx}
                />
            </Card>

            {/* Filter Drawer */}
            <InvoiceFilter
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                values={filterValues}
                onChange={handleFilterChange}
                onApply={invoiceListActions.handleFilterApply}
                onReset={invoiceListActions.handleFilterReset}
                customerOptions={customerOptions}
                invoiceOptions={invoiceOptions}
            />

            {/* Manage Columns Dialog */}
            <Dialog open={manageColumnsOpen} onClose={() => handleManageColumnsClose(setManageColumnsOpen)}>
                <DialogTitle>Select Columns</DialogTitle>
                <DialogContent>
                    <FormGroup>
                        {availableColumns.map((column) => (
                            <FormControlLabel
                                key={column.key}
                                control={
                                    <Checkbox
                                        checked={column.visible}
                                        onChange={() => handleManageColumnsSave(setColumns, setManageColumnsOpen, availableColumns)}
                                    />
                                }
                                label={column.label}
                            />
                        ))}
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleManageColumnsClose(setManageColumnsOpen)}>Cancel</Button>
                    <Button onClick={() => handleManageColumnsSave(setColumns, setManageColumnsOpen, availableColumns)} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Convert to Sales Return Dialog */}
            <Dialog
                open={convertDialogOpen}
                onClose={closeConvertDialog}
                aria-labelledby="convert-dialog-title"
                aria-describedby="convert-dialog-description"
            >
                <DialogTitle id="convert-dialog-title">Convert to Sales Return</DialogTitle>
                <DialogContent>
                    Are you sure you want to convert this invoice to a sales return?
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConvertDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmConvertToSalesReturn} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default InvoiceList;
