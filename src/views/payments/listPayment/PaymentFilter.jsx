'use client';

import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Drawer,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  IconButton
} from '@mui/material';
import CustomAvatar from '@core/components/mui/Avatar'
import { Icon } from '@iconify/react';
import { searchCustomers } from '@/app/(dashboard)/payments/actions';
import { debounce } from '@/utils/debounce';
import { useTheme, alpha } from '@mui/material/styles';
const PaymentFilter = ({
  show,
  setShow,
  setPayments,
  page,
  pageSize,
  setTotalRecords,
  setPage,
  onFilter,
  getPaymentsList,
  selectedCustomers,
  setSelectedCustomers,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchText, setSearchText] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState([]);
  const theme = useTheme();

  const handleSearchCustomers = async (value) => {
    if (!value) {
      setCustomerResults([]);
      setNoResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchCustomers(value);
      if (response.success) {
        setCustomerResults(response.data);
        setNoResults(response.data.length === 0);
      } else {
        setCustomerResults([]);
        setNoResults(true);
        enqueueSnackbar('Error searching customers', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomerResults([]);
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = debounce(handleSearchCustomers, 300);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleCustomerSelect = (customer) => {
    const isSelected = selectedCustomers.includes(customer._id);

    // Update selectedCustomers array
    setSelectedCustomers(prev => {
      if (isSelected) {
        return prev.filter(id => id !== customer._id);
      } else {
        return [...prev, customer._id];
      }
    });

    // Update selectedCustomerDetails array
    setSelectedCustomerDetails(prev => {
      if (isSelected) {
        // Remove customer from details when unselected
        return prev.filter(c => c._id !== customer._id);
      } else {
        // Add customer to details when selected
        return [...prev, customer];
      }
    });
  };

  const getDisplayedCustomers = () => {
    // Start with search results
    const displayList = [...customerResults];

    // Only add selected customers that aren't already in the search results
    selectedCustomerDetails.forEach(customer => {
      // Only keep showing customers that are currently selected
      // and aren't already in the display list
      if (selectedCustomers.includes(customer._id) &&
          !displayList.some(c => c._id === customer._id)) {
        displayList.push(customer);
      }
    });

    return displayList;
  };

  const handleApplyFilter = async () => {
    if (selectedCustomers.length === 0) return;

    try {
      const response = await getPaymentsList(1, pageSize, {
        customer: selectedCustomers
      });

      if (response.success) {
        setPayments(response.data);
        setTotalRecords(response.totalRecords);
        setShow(false);
        onFilter?.(true);
        setPage(1);
      } else {
        enqueueSnackbar('Error applying filter', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error applying filter:', error);
      enqueueSnackbar('Error applying filter', { variant: 'error' });
    }
  };

  const handleClearFilter = async () => {
    setSelectedCustomers([]);
    setSelectedCustomerDetails([]);
    setNoResults(false);
    setPage(1);
    onFilter?.(false);

    try {
      const response = await getPaymentsList(1, pageSize);
      if (response && response.success) {
        setPayments(response.data);
        setTotalRecords(response.totalRecords);
        setShow(false);
      }
    } catch (error) {
      console.error('Error clearing filter:', error);
      enqueueSnackbar('Error clearing filter', { variant: 'error' });
    }
  };

  useEffect(() => {
    customerResults.forEach(customer => {
      if (selectedCustomers.includes(customer._id)) {
        setSelectedCustomerDetails(prev => {
          if (!prev.some(c => c._id === customer._id)) {
            return [...prev, customer];
          }
          return prev;
        });
      }
    });
  }, [customerResults, selectedCustomers]);

  return (
    <Drawer
      anchor='right'
      open={show}
      onClose={() => setShow(false)}
      PaperProps={{
          //  sx: { width: 380 }
        sx: {
          width: { xs: '100%', sm: 380, md: 380, lg: 380 },
          boxShadow: theme => theme.shadows[9]
        }
      }}
      // SlideProps={{
      //   sx: { transition: 'all 0.3s ease-in-out' }
      // }}
    >
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme => theme.palette.background.paper
      }}>
        {/* Header */}
        <Box sx={{
          p: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: theme => `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant='h5' sx={{ fontWeight: 600, color: 'primary.main' }}>
            Payment Filters
          </Typography>
          <IconButton
            onClick={() => setShow(false)}
            sx={{
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'rotate(90deg)',
                color: 'primary.main'
              }
            }}
          >
            <Icon icon='tabler:x' fontSize={20} />
          </IconButton>
        </Box>

        {/* Filter Content */}
        <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
          <Typography
            variant='subtitle1'
            sx={{
              mb: 3,
              fontWeight: 500,
              color: 'text.primary',
              letterSpacing: '0.15px'
            }}
          >
            Customer Selection
          </Typography>

          <TextField
            fullWidth
            size='medium'
            value={searchText}
            onChange={handleSearchChange}
            placeholder='Search customers by name'
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.2s ease',
                '&:hover, &.Mui-focused': {
                  '& fieldset': { borderColor: 'primary.main' }
                },
                borderRadius: 1
              }
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ color: 'text.secondary', mr: 1, display: 'flex', alignItems: 'center' }}>
                  <Icon icon='tabler:search' fontSize={20} />
                </Box>
              ),
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>


                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchText('');
                        setCustomerResults([]);
                        setNoResults(false);
                      }}
                      sx={{
                        color: 'text.secondary',
                        ml: 0.5,
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'primary.soft'
                        }
                      }}
                    >
                      <Icon icon='tabler:x' fontSize={18} />
                    </IconButton>

                </Box>
              )
            }}
          />

          <Box sx={{ mt: 2, mb: 3 }}>
            {selectedCustomers.length > 0 && (
              <Typography
                variant='body2'
                sx={{ mb: 2, color: 'primary.main', fontWeight: 500 }}
              >
                {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
              </Typography>
            )}

            <Box sx={{
              maxHeight: '300px',
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': { width: 5 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'primary.light',
                borderRadius: 10
              }
            }}>
              {getDisplayedCustomers().map((customer) => (
                <Box
                  key={customer._id}
                  sx={{
                    mb: 1,
                    p: 2,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    bgcolor: selectedCustomers.includes(customer._id) ?
                      'primary.soft' : 'background.paper',
                    border: theme => `1px solid ${
                      selectedCustomers.includes(customer._id) ?
                      theme.palette.primary.main : theme.palette.divider
                    }`,
                    '&:hover': {
                      bgcolor: selectedCustomers.includes(customer._id) ?
                        'primary.soft' : 'action.hover',
                    }
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCustomers.includes(customer._id)}
                        onChange={() => handleCustomerSelect(customer)}
                        sx={{
                          color: 'primary.main',
                          '&.Mui-checked': {
                            color: 'primary.main',
                          }
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant='body1'
                        sx={{
                          fontWeight: selectedCustomers.includes(customer._id) ? 600 : 400,
                          color: selectedCustomers.includes(customer._id) ?
                            'primary.main' : 'text.primary'
                        }}
                      >
                        {customer.name}
                      </Typography>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Box>
              ))}

              {noResults && getDisplayedCustomers().length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    borderRadius: 1,
                    // bgcolor: 'background.default'
                  }}
                >
              <Icon  icon='tabler:users' fontSize={90} style={{ mb: 2, color: theme.palette.secondary.lightOpacity }}/>
                  <Typography variant='body1' sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    No customers found
                  </Typography>
                </Box>
              )}

              {!searchText && customerResults.length === 0 && !noResults && !isLoading && getDisplayedCustomers().length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    borderRadius: 1,
                    // bgcolor: 'secondary.lighterOpacity'
                  }}
                >




                    <Icon  icon='tabler:users' fontSize={90} style={{ mb: 2, color: theme.palette.secondary.lightOpacity }}/>


                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{
          p: 4,
          display: 'flex',
          gap: 2,

        }}>
          <Button
            fullWidth
            variant='contained'
            onClick={handleApplyFilter}
            disabled={selectedCustomers.length === 0}

            sx={{
              py: 2,
              boxShadow: theme => theme.shadows[3],
              '&:hover': {
                boxShadow: theme => theme.shadows[4],
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            Apply
          </Button>
          <Button
            fullWidth
            variant='outlined'
            onClick={handleClearFilter}
            disabled={selectedCustomers.length === 0}

            sx={{
              py: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.soft',
                borderColor: 'primary.dark',
              }
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default PaymentFilter;
