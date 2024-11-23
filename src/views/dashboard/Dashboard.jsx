'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import SalesOverview from '@views/charts/SalesOverview'

import {
  Button,
  Chip,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Snackbar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import RefundIcon from '@mui/icons-material/MonetizationOn';
import ViewIcon from '@mui/icons-material/ViewCarouselOutlined';

import {
  amountFormat,
  convertFirstLetterToCapital,
} from '@/common/helper';
import { successToast } from '@/core/Toast/toast';
import moment from 'moment';
import {
  getDashboardData,
  getFilteredDashboardData,
  convertToSalesReturn,
  sendInvoice,
  cloneInvoice,
} from '@/app/(dashboard)/actions';
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle';
import CardStatWithImage from '@components/card-statistics/Character';



const Dashboard = () => {



  const [dashboardData, setDashboardData] = useState({});
  const [filterValue, setFilterValue] = useState('month');
  const [invoiceData, setInvoiceData] = useState([]);
  const [currencyData, setCurrencyData] = useState('SAR');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState({
    open: false,
    message: '',
    type: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch filtered dashboard data based on the selected filter
  const getDetails = async (filter = '') => {
    if (filterValue !== filter) setFilterValue(filter);
    setLoading(true);
    try {
      const response = await getFilteredDashboardData(filter);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setOpenSnackbar({
        open: true,
        message: 'Failed to fetch filtered dashboard data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await getDashboardData(`/dashboard`);

        if (response.code === 200) {
          setDashboardData(response.data);
          setInvoiceData(response.data?.invoiceList || []);

          console.log('Complete response data:', JSON.stringify(response.data, null, 2));
        } else {
          setOpenSnackbar({
            open: true,
            message: 'Failed to fetch dashboard initial data',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Error fetching initial dashboard initialdata data:', error);
        setOpenSnackbar({
          open: true,
          message: 'Failed to fetch dashboard initial data',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  // Handle converting invoice to sales return
  const handleConvertToSalesReturn = async (id) => {
    try {
      const response = await convertToSalesReturn(id);
      if (response.code === 200) {
        successToast('Invoice converted to sales return.');
      } else {
        setOpenSnackbar({
          open: true,
          message: 'Failed to convert to sales return',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error converting to sales return:', error);
      setOpenSnackbar({
        open: true,
        message: 'Error converting to sales return',
        type: 'error',
      });
    }
  };

  // Handle sending invoice via email
  const handleSendInvoice = async (id) => {
    try {
      const response = await sendInvoice(id);
      if (response.code === 200) {
        successToast('Invoice Mail sent Successfully.');
      } else {
        setOpenSnackbar({
          open: true,
          message: 'Failed to send invoice',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      setOpenSnackbar({
        open: true,
        message: 'Error sending invoice',
        type: 'error',
      });
    }
  };

   // Close the Snackbar
   const handleSnackbarClose = () => {
    setOpenSnackbar({ open: false, message: '', type: '' });
  };

  // Handle cloning an invoice
  const handleCloneInvoice = async (id) => {
    try {
      const response = await cloneInvoice(id);
      if (response.code === 200) {
        successToast('Invoice Cloned Successfully.');
        setInvoiceData((prev) => [response.data, ...prev]);
      } else {
        setOpenSnackbar({
          open: true,
          message: 'Failed to clone invoice',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error cloning invoice:', error);
      setOpenSnackbar({
        open: true,
        message: 'Error cloning invoice',
        type: 'error',
      });
    }
  };

  // Handle menu open/close for action items
  const handleMenuOpen = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };


  // Helper function to get the appropriate badge based on invoice status
  const getStatusBadge = (status) => {
    let color;
    switch (status) {
      case 'REFUND':
      case 'SENT':
        color = 'info';
        break;
      case 'UNPAID':
        color = 'grey';
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
        size='small'
        variant='tonal'
      />
    );
  };

  // Data for the top statistic cards
  const cardData = [
    {
      title: 'Amount Due',
      value: amountFormat(
        dashboardData?.overdueAmt
      ),
      symbol: currencyData,
      avatarIcon: 'ri-group-line',
      avatarColor: 'primary',
      change:
        dashboardData?.amountDuePercentage?.percentage === 'Increased'
          ? 'positive'
          : 'negative',
      changeNumber: dashboardData?.amountDuePercentage?.value || 0,
      subTitle: 'since last week',

    },
    {
      title: 'Customers',
      value: dashboardData?.customers || 0,
      avatarIcon: 'ri-user-add-line',
      avatarColor: 'error',
      change:
        dashboardData?.customerPercentage?.percentage === 'Increased'
          ? 'positive'
          : 'negative',
      changeNumber: dashboardData?.customerPercentage?.value || 0,
      subTitle: 'since last week',

      src: '/images/illustrations/characters/14.png',
    },
    {
      title: 'Invoices',
      value: amountFormat(dashboardData?.invoiced || 0),
      symbol: currencyData,
      avatarIcon: 'ri-user-follow-line',
      avatarColor: 'success',
      change:
        dashboardData?.invoicedPercentage?.percentage === 'Increased'
          ? 'positive'
          : 'negative',
      changeNumber: dashboardData?.invoicedPercentage?.value || 0,
      subTitle: 'since last week',
      src: '/images/illustrations/characters/14.png', // Optional: Provide src if needed
    },
    {
      title: 'Estimates',
      value: dashboardData?.estimates || 0,
      avatarIcon: 'ri-user-search-line',
      avatarColor: 'warning',
      change:
        dashboardData?.quotationPercentage?.percentage === 'Increased'
          ? 'positive'
          : 'negative',
      changeNumber: dashboardData?.quotationPercentage?.value || 0,
      subTitle: 'since last week',
      src: '/images/illustrations/characters/14.png', // Optional: Provide src if needed
    },
  ];

  // Calculate progress bar percentages based on dashboard data
  const totalAmt =
    (dashboardData?.paidAmt || 0) +
    (dashboardData?.partiallyPaidAmt || 0) +
    (dashboardData?.overdueAmt || 0) +
    (dashboardData?.draftedAmt || 0);

  const progressBars = [
    { label: 'Paid', value: totalAmt ? (dashboardData.paidAmt / totalAmt) * 100 : 0, color: 'success' },
    { label: 'Partially Paid', value: totalAmt ? (dashboardData.partiallyPaidAmt / totalAmt) * 100 : 0, color: 'warning' },
    { label: 'Overdue', value: totalAmt ? (dashboardData.overdueAmt / totalAmt) * 100 : 0, color: 'error' },
    { label: 'Drafted', value: totalAmt ? (dashboardData.draftedAmt / totalAmt) * 100 : 0, color: 'primary' },
  ];


  return (
    <Grid container spacing={6}>
      {/* Top Statistic Cards */}
      <Grid item xs={12} md={12} lg={12}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} sm={6} md={3} height='100%' className='self-end'>
            <CardStatWithImage
              stats={cardData[1].value}
              trend={cardData[1].change}
              title={cardData[1].title}
              trendNumber={cardData[1].changeNumber}
              chipText={cardData[1].subTitle}
              src='/images/illustrations/characters/14.png'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3} className='self-end'>
            <HorizontalWithSubtitle
              title={cardData[0].title}
              stats={Math.floor(cardData[0].value)}
              avatarIcon={cardData[0].avatarIcon}
              avatarColor={cardData[0].avatarColor}
              trend={cardData[0].change}
              trendNumber={cardData[0].changeNumber}
              subtitle={cardData[0].subTitle}
              symbol={` ${cardData[2].symbol}`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3} className='self-end'>
            <HorizontalWithSubtitle
              title={cardData[2].title}
              stats={Math.floor(cardData[0].value)}
              avatarIcon={cardData[2].avatarIcon}
              avatarColor={cardData[2].avatarColor}
              trend={cardData[2].change}
              trendNumber={cardData[2].changeNumber}
              subtitle={cardData[2].subTitle}
              symbol={` ${cardData[2].symbol}`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3} className='self-end'>
            <HorizontalWithSubtitle
              title={cardData[3].title}
              stats={cardData[3].value}
              avatarIcon={cardData[3].avatarIcon}
              avatarColor={cardData[3].avatarColor}
              trend={cardData[3].change}
              trendNumber={cardData[3].changeNumber}
              subtitle={cardData[3].subTitle}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Recent Invoices and Invoice Analytics */}
      <Grid item xs={12}>
        <Grid container spacing={6}>
          {/* Recent Invoices Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Recent Invoices"
                action={
                  <Box>
                  <IconButton onClick={() => getDetails(filterValue)}>
                    <i className="ri-refresh-line text-[22px]" />
                  </IconButton>
                  <Link href="/invoices/invoice-list" passHref>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      className="ml-2"
                    >
                      View All
                    </Button>
                  </Link>
                </Box>

                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Multi-segment Progress Bar */}
                  <Box sx={{ width: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        height: '10px',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        backgroundColor: 'grey.300',
                        padding: '0px',
                        marginBottom: '20px'
                      }}
                    >
                      {progressBars.map((bar, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: `${bar.value}%`,
                            backgroundColor: (theme) => theme.palette[bar.color].main,
                            transition: 'width 0.5s ease-in-out',
                          }}
                        />
                      ))}
                    </Box>
                    {/* Legend */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      {progressBars.map((bar, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: '10px',
                              height: '10px',
                              backgroundColor: (theme) => theme.palette[bar.color].light,
                              borderRadius: '50%',
                            }}
                          />
                          <Typography variant="body2">{bar.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Invoices Table */}
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ '& th': { fontSize: '14px' } }}>
                          <TableCell>Customer</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell className="text-center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoiceData.map((item, index) => {
                          const status = getStatusBadge(item.status);
                          return (
                            <TableRow
                              key={item._id || index}
                              sx={{
                                '& td': {
                                  '& .MuiTypography-root': {
                                    fontSize: '14px',
                                  },
                                },
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    src={item.customerId?.image || '/images/default-avatar.png'}
                                    alt={item.customerId?.name || 'Deleted Customer'}
                                  />
                                  <Link href={`/view-customer/${item.customerId?._id}`} passHref>
                                    <Typography sx={{ cursor: 'pointer' }}>
                                      {item.customerId?.name || 'Deleted Customer'}
                                    </Typography>
                                  </Link>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography className='text-[14px]'>
                                  {amountFormat(item.TotalAmount)} {currencyData}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant='body1'>
                                  {moment(item.dueDate).format('DD MMM YYYY')}
                                </Typography>
                              </TableCell>
                              <TableCell>{status}</TableCell>
                              <TableCell className="text-center">
                                <IconButton onClick={(e) => handleMenuOpen(e, item)}>
                                  <i className="ri-more-fill text-[22px]" />
                                </IconButton>

                                <Menu
                                  anchorEl={anchorEl}
                                  open={Boolean(anchorEl)}
                                  onClose={handleMenuClose}
                                  PaperProps={{
                                    elevation: 1,
                                    style: { width: '200px' },
                                  }}
                                >

                                  <MenuItem
                                    onClick={() => {
                                      handleSendInvoice(selectedInvoice._id);
                                      handleMenuClose();
                                    }}
                                  >
                                    <ListItemIcon>
                                      <SendIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Send Invoice" />
                                  </MenuItem>
                                  <MenuItem
                                    onClick={() => {
                                      handleCloneInvoice(selectedInvoice._id);
                                      handleMenuClose();
                                    }}
                                  >
                                    <ListItemIcon>
                                      <FileCopyIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Duplicate Invoice" />
                                  </MenuItem>
                                  <MenuItem
                                    onClick={() => {
                                      handleConvertToSalesReturn(selectedInvoice._id);
                                      handleMenuClose();
                                    }}
                                  >
                                    <ListItemIcon>
                                      <RefundIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Return Invoice" />
                                  </MenuItem>


                                  <Link
  href={`/invoices/invoice-view/${item._id}`}
  passHref
  legacyBehavior
>
  <MenuItem
    component="a"
    target="_blank"
    onClick={(e) => {
      e.preventDefault(); // Prevent the MenuItem's default click behavior
      window.open(`/invoices/invoice-view/${item._id}`, '_blank'); // Open in a new tab
    }}
  >
    <ListItemIcon>
      <ViewIcon fontSize="small" />
    </ListItemIcon>
    <ListItemText primary="View" />
  </MenuItem>
</Link>





                                  {

              // icon: 'far fa-eye text-[22px]',
            //   component: (
            //     <Link
            //       href={`/view-invoice/${item._id}`}
            //       target="_blank"
            //       className="dropdown-item"
            //     >
            //       <i className="far fa-eye me-2" />
            //       View
            //     </Link>
            //   )
             }
                                </Menu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Invoice Analytics Card */}
          <Grid item xs={12} md={6}>
            <SalesOverview
              series={dashboardData.series || []}

              amounts={[
                dashboardData.paidAmt,
                dashboardData.draftedAmt,
                dashboardData.overdueAmt,
                dashboardData.partiallyPaidAmt,
              ]}
              currencyData={currencyData}
              labels={dashboardData.labels || []}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={openSnackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Grid>
  );
};

export default Dashboard;
