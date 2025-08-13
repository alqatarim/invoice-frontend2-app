// app/vendors/components/VendorFilter.jsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Button,
  Card,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
  Autocomplete,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { searchVendors } from '@/app/(dashboard)/vendors/actions';

/**
 * VendorFilter - Original UI/UX with optimized logic
 */
const VendorFilter = ({ onApplyFilters, onResetFilters, onOpenColumns }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Persistent timeout reference to avoid race conditions
  const searchTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);

    if (reason === 'input') {
      // Always clear any pending timeout first
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      // Clear options immediately if input becomes empty
      if (!newInputValue?.trim()) {
        setVendorOptions([]);
        setIsSearching(false);
        return;
      }

      // Debounced search for non-empty input
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const vendors = await searchVendors(newInputValue.trim());
          setVendorOptions(vendors || []);
        } catch (error) {
          console.error('Search error:', error);
          setVendorOptions([]);
        } finally {
          setIsSearching(false);
        }
      }, 200);
    }
  };

  const handleVendorChange = (event, newValue) => {
    setSelectedVendors(newValue);
  };

  const handleApplyFilter = () => {
    if (selectedVendors.length === 0) return;

    const filterValues = {
      vendor: selectedVendors.map(vendor => vendor._id)
    };

    onApplyFilters(filterValues);
    setOpen(false);
  };

  const handleFilterClear = () => {
    setSelectedVendors([]);
    setVendorOptions([]);
    setInputValue('');
    onResetFilters();
    setOpen(false);
  };

  // Calculate active filters
  const activeFilterCount = selectedVendors.length > 0 ? 1 : 0;

  return (
    <Card
      elevation={0}
      sx={{
        border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        borderRadius: '16px'
      }}
    >
      {/* Filter Header */}
      <div
        className="flex justify-between items-center p-3 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main
            }}
          >
            <Icon icon="tabler:filter" fontSize={20} />
          </div>
          <Typography variant="h6" className="font-semibold">
            Vendor Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              size="small"
              label={`${activeFilterCount} active`}
              color="primary"
              variant="tonal"
              className="ml-1 font-medium"
            />
          )}
        </div>

        <IconButton
          size="small"
          className="p-2 rounded-lg transition-transform duration-300 ease-in-out"
          style={{
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          <Icon icon="tabler:chevron-down" fontSize={18} />
        </IconButton>
      </div>

      <Collapse in={open}>
        <Divider />
        <div className="p-6">
          <Grid container spacing={4}>
            {/* Vendor Autocomplete */}
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                multiple
                id="vendor-autocomplete"
                options={vendorOptions}
                getOptionLabel={(option) => option.vendor_name || ''}
                value={selectedVendors}
                onChange={handleVendorChange}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                loading={isSearching}
                filterOptions={(options) => options} // Disable client-side filtering since we do server-side
                isOptionEqualToValue={(option, value) => option._id === value._id}
                clearOnBlur={false}
                selectOnFocus={true}
                handleHomeEndKeys={true}
                freeSolo={false}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option._id}>
                    <Checkbox
                      icon={<Icon icon="mdi:checkbox-blank-outline" />}
                      checkedIcon={<Icon icon="mdi:checkbox-marked" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.vendor_name}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option._id}
                      label={option.vendor_name}
                      size="small"
                      variant="tonal"
                      color="primary"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Search Vendors"
                    placeholder="Type to search vendors..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Icon icon="mdi:magnify" style={{ marginRight: 8, color: 'text.secondary' }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          {isSearching ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                )}
                sx={{
                  '& .MuiAutocomplete-popupIndicator': {
                    display: 'none' // Hide default dropdown arrow
                  }
                }}
              />
            </Grid>

            {/* Empty grid items to maintain layout consistency */}
            <Grid item xs={12} sm={6} md={4}>
              {/* Placeholder for future filters */}
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              {/* Placeholder for future filters */}
            </Grid>
          </Grid>

          {/* Action Buttons - matches invoice filter layout exactly */}
          <div className='flex justify-end gap-3 mt-6'>
            <Button
              variant="text"
              size="medium"
              startIcon={<Icon icon="material-symbols:view-column-2" width={22} />}
              onClick={onOpenColumns}
            >
              Columns
            </Button>

            <Button
              variant="outlined"
              onClick={handleFilterClear}
              size="medium"
              startIcon={<Icon icon="tabler:refresh" />}
            >
              Reset Filters
            </Button>

            <Button
              variant="contained"
              onClick={handleApplyFilter}
              disabled={selectedVendors.length === 0}
              size="medium"
              startIcon={<Icon icon="tabler:check" />}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Collapse>
    </Card>
  );
};

export default VendorFilter;