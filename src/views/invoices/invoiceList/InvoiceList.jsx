'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import InvoiceHead from '@/views/invoices/invoiceList/invoiceHead';
import InvoiceFilter from '@/views/invoices/invoiceList/InvoiceFilter';
import Link from 'next/link';


import {
  cloneInvoice,
  sendInvoice,
  getFilteredInvoices,
  getInitialInvoiceData,
  searchCustomers,
  searchInvoices,
  convertTosalesReturn,
  sendPaymentLink,
  printDownloadInvoice,
} from '@/app/(dashboard)/invoices/actions';
import {

    Box,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Card,
    TableSortLabel,
    TablePagination,
    Chip,
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
import { amountFormat, convertFirstLetterToCapital } from '@/common/helper';

// ** Import the usePermission hook **
import { useSession } from 'next-auth/react';
import { usePermission } from '@/hooks/usePermission';
import { useSearchParams } from 'next/navigation';

/**
 * InvoiceList Component
 * Manages and displays a list of invoices with filtering, sorting, and pagination.
 *
 * @returns JSX.Element
 */
const InvoiceList = () => {



    // ** Replace session-based permissions with usePermission hook **
    const { data: session, status } = useSession();
    const user = session?.user;
    const canCreate = usePermission('invoice', 'create');
    const canUpdate = usePermission('invoice', 'update');
    const canView = usePermission('invoice', 'view');
    const canDelete = usePermission('invoice', 'delete');
console.log('can view:')
console.log(canView)

console.log('can update:')
console.log(canUpdate)


    const [invoices, setInvoices] = useState([]);
    const [cardCounts, setCardCounts] = useState({});
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [tab, setTab] = useState('ALL');
    const [filters, setFilters] = useState({});
    const [filterOpen, setFilterOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [sortBy, setSortBy] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [columns, setColumns] = useState([]);

    const [manageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [availableColumns, setAvailableColumns] = useState([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'error', 'warning', 'info', 'success'
    });


    const defaultColumns = [
        { key: 'index', label: '#', visible: true },
        { key: 'invoiceNumber', label: 'Invoice Number', visible: true },
        { key: 'createdOn', label: 'Created On', visible: true },
        { key: 'invoiceTo', label: 'Invoice To', visible: true },
        { key: 'totalAmount', label: 'Total Amount', visible: true },
        { key: 'paidAmount', label: 'Paid Amount', visible: true },
        { key: 'paymentMode', label: 'Payment Mode', visible: true },
        { key: 'balance', label: 'Balance', visible: true },
        { key: 'dueDate', label: 'Due Date', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'action', label: 'Action', visible: true },
    ];

    const [convertDialogOpen, setConvertDialogOpen] = useState(false);
    const [invoiceToConvert, setInvoiceToConvert] = useState(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        const success = searchParams.get('success');
        if (success) {
            setSnackbar({
                open: true,
                message: success,
                severity: 'success',
            });
        }
    }, [searchParams]);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    /**
     * Open the Convert to Sales Return dialog.
     *
     * @param {object} invoice - The invoice to convert.
     */
    const openConvertDialog = (invoice) => {
        setInvoiceToConvert(invoice);
        setConvertDialogOpen(true);
    };

    /**
     * Close the Convert to Sales Return dialog.
     */
    const closeConvertDialog = () => {
        setInvoiceToConvert(null);
        setConvertDialogOpen(false);
    };

    /**
     * Confirm conversion to sales return.
     */
    const confirmConvertToSalesReturn = async () => {
        try {
            await handleConvertToSalesReturn(invoiceToConvert.id || invoiceToConvert._id);
            closeConvertDialog();
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to convert invoice to sales return.',
                severity: 'error',
            });
            // Handle error if needed
        }
    };

    /**
     * Initialize state from localStorage with fallback to defaults
     */
    useEffect(() => {
        try {
            const storedColumns = localStorage.getItem('invoiceVisibleColumns');
            if (storedColumns) {
                const parsedColumns = JSON.parse(storedColumns);
                setColumns(parsedColumns);
            } else {
                setColumns(defaultColumns);
            }

            const storedFilters = localStorage.getItem('invoiceFilters');
            if (storedFilters) {
                const parsedFilters = JSON.parse(storedFilters);
                setFilters(parsedFilters);
            }

            const storedSortBy = localStorage.getItem('invoiceSortBy');
            if (storedSortBy) {
                setSortBy(storedSortBy);
            }

            const storedSortDirection = localStorage.getItem('invoiceSortDirection');
            if (storedSortDirection) {
                setSortDirection(storedSortDirection);
            }
        } catch (error) {
            console.error('Error loading cache:', error);
            // Reset to defaults if any error occurs
            setColumns(defaultColumns);
            setFilters({});
            setSortBy('');
            setSortDirection('asc');
            localStorage.removeItem('invoiceVisibleColumns');
            localStorage.removeItem('invoiceFilters');
            localStorage.removeItem('invoiceSortBy');
            localStorage.removeItem('invoiceSortDirection');
        }
    }, []);

    // ** Cache column visibility preferences **
    useEffect(() => {
        if (columns.length > 0) {
            localStorage.setItem('invoiceVisibleColumns', JSON.stringify(columns));
        }
    }, [columns]);

    // ** Cache filter preferences **
    useEffect(() => {
        if (Object.keys(filters).length > 0) {
            localStorage.setItem('invoiceFilters', JSON.stringify(filters));
        } else {
            localStorage.removeItem('invoiceFilters');
        }
    }, [filters]);

    // ** Cache sorting preferences **
    useEffect(() => {
        if (sortBy) {
            localStorage.setItem('invoiceSortBy', sortBy);
            localStorage.setItem('invoiceSortDirection', sortDirection);
        } else {
            localStorage.removeItem('invoiceSortBy');
            localStorage.removeItem('invoiceSortDirection');
        }
    }, [sortBy, sortDirection]);

    // ** Fetch initial data on component mount **
    useEffect(() => {

        const fetchAllData = async () => {
            setLoading(true);
            try {
                const initialData = await getInitialInvoiceData();

                setInvoices(initialData.invoices || []);
                setPagination(initialData.pagination || { current: 1, pageSize: 10, total: 0 });
                setCardCounts(initialData.cardCounts || {});

                // Only fetch filtered data if tab or filters have changed
                if (tab !== 'ALL' || Object.keys(filters).length > 0) {
                    const filteredData = await getFilteredInvoices(tab, 1, pagination.pageSize, filters);
                    setInvoices(filteredData.invoices || []);
                    setPagination(filteredData.pagination || { current: 1, pageSize: 10, total: 0 });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setSnackbar({
                    open: true,
                    message: error.message || 'Failed to fetch data.',
                    severity: 'error',
                });
            }
            setLoading(false);
        };

        fetchAllData();
    }, [tab, filters]); // Include all dependencies that should trigger a refetch

    /**
     * Handle cloning of an invoice.
     *
     * @param {string} id - ID of the invoice to clone.
     */
    const handleClone = async (id) => {
        try {
            const newInvoice = await cloneInvoice(id);
            console.log('Cloned Invoice:', newInvoice); // Debugging
            setInvoices((prev) => [newInvoice, ...prev]);
            setSnackbar({
                open: true,
                message: 'Invoice cloned successfully!',
                severity: 'success',
            });
        } catch (error) {
            console.error('Error cloning invoice:', error);
            setSnackbar({
                open: true,
                message: error.message || 'Failed to clone invoice.',
                severity: 'error',
            });
        }
    };

    /**
     * Handle sending of an invoice.
     *
     * @param {string} id - ID of the invoice to send.
     */
    const handleSend = async (id) => {
        try {
            await sendInvoice(id);
            setSnackbar({
                open: true,
                message: 'Invoice sent successfully!',
                severity: 'success',
            });
        } catch (error) {
            console.error('Error sending invoice:', error);
            setSnackbar({
                open: true,
                message: error.message || 'Failed to send invoice.',
                severity: 'error',
            });
        }
    };

    /**
     * Handle converting an invoice to sales return.
     *
     * @param {string} id - ID of the invoice to convert.
     */
    const handleConvertToSalesReturn = async (id) => {
        try {
            await convertTosalesReturn(id, tab);
            setSnackbar({
                open: true,
                message: 'Invoice converted to sales return successfully!',
                severity: 'success',
            });
            fetchData(tab, pagination.current, pagination.pageSize, filters);
        } catch (error) {
            console.error(`Error converting invoice ${id} to sales return:`, error);
            setSnackbar({
                open: true,
                message: error.message || 'Failed to convert invoice to sales return.',
                severity: 'error',
            });
        }
    };

    /**
     * Handle tab change.
     *
     * @param {object} event - The event object.
     * @param {string} newTab - The new tab value.
     */
    const handleTabChange = (event, newTab) => {
        setTab(newTab);
    };

    /**
     * Handle page change in pagination.
     *
     * @param {object} event - The event object.
     * @param {number} newPage - The new page number.
     */
    const handlePageChange = (event, newPage) => {
        const updatedPage = newPage + 1;
        setPagination((prev) => ({ ...prev, current: updatedPage }));
        fetchData(tab, updatedPage, pagination.pageSize, filters);
    };

    /**
     * Handle page size change in pagination.
     *
     * @param {object} event - The event object.
     */
    const handlePageSizeChange = (event) => {
        const newPageSize = parseInt(event.target.value, 10);
        setPagination((prev) => ({ ...prev, pageSize: newPageSize, current: 1 }));
        fetchData(tab, 1, newPageSize, filters);
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
     * Handle sort request when a column header is clicked.
     *
     * @param {string} columnKey - The key of the column to sort by.
     */
    const handleSortRequest = (columnKey) => {
        let newDirection = 'asc';
        if (sortBy === columnKey) {
            // Toggle sort direction
            newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
        } else {
            setSortBy(columnKey);
            setSortDirection('asc');
            newDirection = 'asc';
        }
        fetchData(tab, 1, pagination.pageSize, filters, columnKey, newDirection);
    };

    /**
     * Handle opening of the action menu.
     *
     * @param {object} event - The event object.
     * @param {object} invoice - The selected invoice object.
     */
    const handleMenuOpen = (event, invoice) => {
        setAnchorEl(event.currentTarget);
        setSelectedInvoice(invoice);
    };

    /**
     * Handle closing of the action menu.
     */
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedInvoice(null);
    };

    /**
     * Generate a status badge based on the invoice status.
     *
     * @param {string} status - The status of the invoice.
     * @returns {JSX.Element} - The badge component.
     */
    const getStatusBadge = (status) => {
        let color;
        switch (status) {
            case 'REFUND':
            case 'SENT':
                color = 'info';
                break;
            case 'UNPAID':
                color = 'default';
                break;
            case 'PARTIALLY_PAID':
                color = 'primary';
                break;
            case 'CANCELLED':
            case 'OVERDUE':
                color = 'error';
                break;
            case 'PAID':
                color = 'success';
                break;
            case 'DRAFTED':
                color = 'warning';
                break;
            default:
                color = 'default';
        }
        return (
            <Chip
                label={convertFirstLetterToCapital(status.replace('_', ' '))}
                color={color || 'default'}
                size="small"
                variant="tonal"
            />
        );
    };

    const currencyData = '$'; // Or retrieve from context or props

    /**
     * Handle resetting filters and sorting.
     */
    const handleReset = () => {
        setColumns(defaultColumns);
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



    /**
     * Handle opening the manage columns dialog.
     */
    const handleManageColumnsOpen = () => {
        setAvailableColumns(columns);
        setManageColumnsOpen(true);
    };

    /**
     * Handle closing the manage columns dialog.
     */
    const handleManageColumnsClose = () => {
        setManageColumnsOpen(false);
    };

    /**
     * Toggle visibility of a specific column.
     *
     * @param {string} columnKey - The key of the column to toggle.
     */
    const handleColumnToggle = (columnKey) => {
        setAvailableColumns((prevColumns) =>
            prevColumns.map((col) =>
                col.key === columnKey ? { ...col, visible: !col.visible } : col
            )
        );
    };

    /**
     * Save the updated column visibility settings.
     */
    const handleManageColumnsSave = () => {
        setColumns(availableColumns);
        setManageColumnsOpen(false);
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

    /**
     * Handle printing or downloading the invoice.
     *
     * @param {string} id - Invoice ID.
     */
    const handlePrintDownload = async (id) => {
        try {
            const pdfUrl = await printDownloadInvoice(id);
            window.open(pdfUrl, '_blank'); // Opens the PDF in a new tab
            setSnackbar({
                open: true,
                message: 'Invoice is being prepared for download.',
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to download invoice.',
                severity: 'error',
            });
        }
    };

    /**
     * Handle sending a payment link.
     *
     * @param {string} id - Invoice ID.
     */
    const handleSendPaymentLink = async (id) => {
        try {
            await sendPaymentLink(id);
            setSnackbar({
                open: true,
                message: 'Payment link sent successfully!',
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to send payment link.',
                severity: 'error',
            });
        }
    };

    // Modify your fetchData function to handle auth errors
    const fetchData = async (tabValue, page, pageSize, filterValues) => {
        setLoading(true);
        try {
            // ... existing fetch logic
        } catch (error) {
            if (!handleClientAuthError(error, router)) {
                console.error('Error fetching invoice data:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to fetch invoice data',
                    severity: 'error',
                });
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div>
            {/* 1st Segment: Stat Cards */}
            <InvoiceHead invoiceListData={cardCounts} currencyData={currencyData} />

            {/* 2nd Segment: Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mt: 6 }}>
                {(canCreate) && (
                    <Button variant="contained" color="primary" href="/add-invoice">
                        New Invoice
                    </Button>
                )}
            </Box>

            {/* 3rd Segment: Status Tabs */}
            <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}
                    sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Grid item xs="auto">
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={tab}
                                onChange={handleTabChange}
                                aria-label="Invoice Tabs"
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab label="All" value="ALL" />
                                <Tab label="Paid" value="PAID" />
                                <Tab label="Overdue" value="OVERDUE" />
                                <Tab label="Partially Paid" value="PARTIALLY_PAID" />
                                <Tab label="Draft" value="DRAFTED" />
                                <Tab label="Cancelled" value="CANCELLED" />
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
                            onClick={handleManageColumnsOpen}
                        >
                            Columns
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* 4th Segment: Invoice Table */}
            <Card>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map(
                                (column) =>
                                    column.visible && (
                                        <TableCell
                                            key={column.key}
                                            sortDirection={sortBy === column.key ? sortDirection : false}
                                        >
                                            {column.key !== 'action' ? (
                                                <TableSortLabel
                                                    active={sortBy === column.key}
                                                    direction={sortBy === column.key ? sortDirection : 'asc'}
                                                    onClick={() => handleSortRequest(column.key)}
                                                >
                                                    {column.label}
                                                </TableSortLabel>
                                            ) : (
                                                column.label
                                            )}
                                        </TableCell>
                                    )
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((invoice, index) => (
                            <TableRow key={invoice.id || invoice._id}>
                                {columns.map(
                                    (column) =>
                                        column.visible && (
                                            <TableCell key={column.key}>
                                                {/* Render based on column key */}
                                                {column.key === 'index' && index + 1}

                                                {column.key === 'invoiceNumber' && (
                                                    <Link href={`/invoices/invoice-view/${invoice._id}`} passHref>
                                                        <Typography
                                                            component="a"
                                                            sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'none' }}
                                                        >
                                                            {invoice.invoiceNumber || 'N/A'}
                                                        </Typography>
                                                    </Link>
                                                )}

                                                {column.key === 'createdOn' && (
                                                    <Typography>
                                                        {invoice.invoiceDate
                                                            ? moment(invoice.invoiceDate).format('DD MMM YYYY')
                                                            : 'N/A'}
                                                    </Typography>
                                                )}

                                                {column.key === 'invoiceTo' && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            src={invoice.customerId?.image || '/images/default-avatar.png'}
                                                            alt={invoice.customerId?.name || 'Deleted Customer'}
                                                        />

                                                        <Link href={`/invoices/invoice-list/invoice-view/${invoice.customerId?._id}`} passHref>
                                                            <Typography
                                                                sx={{ cursor: 'pointer', color: 'primary.main' }}
                                                            >
                                                                {invoice.customerId?.name || 'Deleted Customer'}
                                                            </Typography>
                                                        </Link>
                                                    </Box>
                                                )}

                                                {column.key === 'totalAmount' && (
                                                    <Typography>
                                                        {currencyData} {amountFormat(invoice.TotalAmount || 0)}
                                                    </Typography>
                                                )}

                                                {column.key === 'paidAmount' && (
                                                    <Typography>
                                                        {currencyData} {amountFormat(invoice.paidAmt || 0)}
                                                    </Typography>
                                                )}

                                                {column.key === 'paymentMode' && (
                                                    <Typography>{invoice.payment_method || 'N/A'}</Typography>
                                                )}

                                                {column.key === 'balance' && (
                                                    <Typography>
                                                        {currencyData} {amountFormat(invoice.balance || 0)}
                                                    </Typography>
                                                )}

                                                {column.key === 'dueDate' && (
                                                    <Typography>
                                                        {invoice.dueDate
                                                            ? moment(invoice.dueDate).format('DD MMM YYYY')
                                                            : 'N/A'}
                                                    </Typography>
                                                )}

                                                {column.key === 'status' && (
                                                    getStatusBadge(invoice.status)
                                                )}

                                                {column.key === 'action' && (
                                                    <IconButton
                                                        aria-label="more"
                                                        aria-controls="long-menu"
                                                        aria-haspopup="true"
                                                        onClick={(event) => handleMenuOpen(event, invoice)}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        )
                                )}
                            </TableRow>
                        ))}
                        {invoices.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        )}
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={pagination.current - 1}
                    onPageChange={handlePageChange}
                    rowsPerPage={pagination.pageSize}
                    onRowsPerPageChange={handlePageSizeChange}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </Card>

            {/* Filter Drawer */}
            <InvoiceFilter
                open={filterOpen}
                onClose={handleFilterToggle}
                onFilterChange={handleFilterChange}
                filters={filters}
            />

            {/* Manage Columns Dialog */}
            <Dialog open={manageColumnsOpen} onClose={handleManageColumnsClose}>
                <DialogTitle>Select Columns</DialogTitle>
                <DialogContent>
                    <FormGroup>
                        {availableColumns.map((column) => (
                            <FormControlLabel
                                key={column.key}
                                control={
                                    <Checkbox
                                        checked={column.visible}
                                        onChange={() => handleColumnToggle(column.key)}
                                    />
                                }
                                label={column.label}
                            />
                        ))}
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleManageColumnsClose}>Cancel</Button>
                    <Button onClick={handleManageColumnsSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {(canView) && selectedInvoice && (
                    <MenuItem
                        component={Link}
                        href={`/invoices/invoice-view/${selectedInvoice._id}`}
                        onClick={handleMenuClose}
                        sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
                    >
                        <ListItemIcon>
                            <VisibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="View" />
                    </MenuItem>
                )}
                {canUpdate && selectedInvoice && (
                      <MenuItem
                        component={Link}
                        href={`/invoices/edit/${selectedInvoice._id}`}
                        onClick={handleMenuClose}
                        sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
                    >

                                <ListItemIcon>
                                    <ReplayIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Edit" />

                    </MenuItem>
                )}
                {canCreate && selectedInvoice && (
                    <MenuItem onClick={() => handleClone(selectedInvoice.id || selectedInvoice._id)}>
                        <ListItemIcon>
                            <CopyIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Clone" />
                    </MenuItem>
                )}
                {canCreate && selectedInvoice && (
                    <MenuItem onClick={() => handleSend(selectedInvoice.id || selectedInvoice._id)}>
                        <ListItemIcon>
                            <SendIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Send" />
                    </MenuItem>
                )}
                {canUpdate && selectedInvoice && (
                    <MenuItem onClick={() => openConvertDialog(selectedInvoice)}>
                        <ListItemIcon>
                            <ReplayIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Convert to Sales Return" />
                    </MenuItem>
                )}
                {/* New Menu Items */}
                {canUpdate && selectedInvoice && (
                    <MenuItem onClick={() => handlePrintDownload(selectedInvoice._id)}>
                        <ListItemIcon>
                            <PrintIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Print & Download" />
                    </MenuItem>
                )}
                {canCreate && selectedInvoice && (
                    <MenuItem onClick={() => handleSendPaymentLink(selectedInvoice._id)}>
                        <ListItemIcon>
                            <LinkIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Send Payment Link" />
                    </MenuItem>
                )}
                {/* Add more MenuItems as needed */}
            </Menu>

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
