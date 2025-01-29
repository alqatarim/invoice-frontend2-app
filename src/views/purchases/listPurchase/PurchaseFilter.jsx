'use client';

import { useState } from 'react';
import {
  Drawer,
  Box,
  Card,
  Button,
  Checkbox,
  Typography,
  FormControlLabel,
  TextField,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
} from '@mui/material';
import CustomIconButton from '@core/components/mui/IconButton'
import debounce from 'lodash/debounce';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const PurchaseFilter = ({ open, onClose, setFilterCriteria, vendors = [], resetAllFilters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState(vendors);

  // Debounced search function
  const debouncedSearch = debounce((searchValue) => {
    const filtered = vendors.filter(vendor =>
      vendor.vendor_name.toLowerCase().includes(searchValue.toLowerCase()) ||
      vendor.vendor_phone?.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredVendors(filtered);
  }, 300);

  const handleVendorSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleVendorToggle = (vendorId) => {
    const currentIndex = selectedVendors.indexOf(vendorId);
    const newSelectedVendors = [...selectedVendors];

    if (currentIndex === -1) {
      newSelectedVendors.push(vendorId);
    } else {
      newSelectedVendors.splice(currentIndex, 1);
    }

    setSelectedVendors(newSelectedVendors);
  };

  const handleApplyFilter = () => {
    setFilterCriteria(prev => ({
      ...prev,
      vendors: selectedVendors
    }));
    onClose();
  };

  const handleClearFilter = () => {
    setSelectedVendors([]);
    resetAllFilters();
    onClose();
  };

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 300 },
          // backgroundColor: theme.palette.background.paper,
          // borderLeft: `1px solid ${theme.palette.divider}`
        }
      }}
    >
      <Box
        className='p-5'
        gap={3}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Icon icon='mdi:filter-variant' fontSize={20} />
            <Typography variant='h6' sx={{ ml: 2, fontSize: '1.125rem', fontWeight: 600 }}>
              Filters
            </Typography>
          </Box>

          <CustomIconButton

            onClick={onClose}

          >
            <Icon icon='mdi:close' fontSize={20} />


          </CustomIconButton>
        </Box>

        {/* Search Field */}
        <Box sx={{ pt:1 }}>
          <TextField
            fullWidth
            size='small'
            value={searchTerm}
            placeholder='Search vendors'
            onChange={handleVendorSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='mdi:magnify' fontSize={20} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position='end'>
                  <CustomIconButton
                    onClick={() => {
                      setSearchTerm('');
                      setFilteredVendors(vendors);
                    }}


                    size='small'
                    color='error'

                  >
                    <Icon icon='mdi:clear-bold' fontSize={20} />


                  </CustomIconButton>
                </InputAdornment>
              ),
              sx: {
                height: 40,
                '&.MuiInputBase-root': {
                  borderRadius: 1
                }
              }
            }}
          />
        </Box>

        {/* Vendor List */}
        <Box sx={{ flexGrow: 1}}>
          <List>
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <Box key={vendor._id}>
                  <ListItem
                    onClick={() => handleVendorToggle(vendor._id)}
                    disablePadding
                    sx={{
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox

                        checked={selectedVendors.includes(vendor._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleVendorToggle(vendor._id);
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {vendor.vendor_name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant='caption' color='textSecondary'>
                          {vendor.vendor_phone}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))
            ) : (
              <Box sx={{
                py: 10,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column'
              }}>
                <Icon icon='line-md:person-search' fontSize={90}
                color={alpha(theme.palette.secondary.light, 0.2)}


                />
                <Typography
                  variant='body1'
                  sx={{ mt: 2, color: alpha(theme.palette.secondary.main, 0.8) }}
                >
                  No vendors found
                </Typography>
              </Box>
            )}
          </List>



        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            px: 4,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

          }}
        >
          <Button
            color='secondary'
            variant='outlined'
            onClick={handleClearFilter}
            disabled={selectedVendors.length === 0}
            startIcon={<Icon icon='mdi:refresh' fontSize={20} />}
            sx={{ minWidth: 100 }}
          >
            Clear
          </Button>
          <Button
            variant='contained'
            onClick={handleApplyFilter}
            disabled={selectedVendors.length === 0}
            startIcon={<Icon icon='mdi:filter-check' fontSize={20} />}
            sx={{ minWidth: 100 }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default PurchaseFilter;