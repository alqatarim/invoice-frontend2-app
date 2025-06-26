'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { searchProducts } from '@/app/(dashboard)/inventory/actions';
import {
  Button,
  Card,
  Chip,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  TextField,
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { fetchWithAuth } from '@/Auth/fetchWithAuth';

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};


/**
 * Modern Autocomplete with search functionality
 */
const ProductSearchSelect = ({
  label,
  value = [],
  onChange,
  id
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.trim().length === 0) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchProducts(searchTerm);
        
        // Ensure results have the correct structure
        const formattedResults = results.map(item => ({
          _id: item._id,
          name: item.name || item.text || 'Unknown Product',
          ...item
        }));
        
        setOptions(formattedResults);
        setOpen(true); // Open dropdown when results arrive
      } catch (error) {
        console.error('Error searching products:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 500), // Increased delay for better UX
    []
  );

  // Handle input change
  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    
    if (reason === 'input') {
      debouncedSearch(newInputValue);
    }
  };

  // Handle selection
  const handleChange = (event, newValue) => {
    onChange(newValue.map(item => item._id));
  };

  return (
    <Autocomplete
      multiple
      id={id}
      open={open}
      onOpen={() => {
        if (inputValue) {
          setOpen(true);
        }
      }}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      getOptionLabel={(option) => {
        // Handle both string and object options
        if (typeof option === 'string') {
          return option;
        }
        return option.name || option.text || '';
      }}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        return option._id === value._id;
      }}
      filterOptions={(x) => x} // Disable client-side filtering
      clearOnBlur={false}
      selectOnFocus={true}
      handleHomeEndKeys={true}
      freeSolo={false}
      renderOption={(props, option, { selected }) => (
        <MenuItem {...props} key={option._id}>

<Box className='flex flex-row gap-3 items-center'>
          <Checkbox
            icon={<Icon icon="mdi:checkbox-blank-outline" />}
            checkedIcon={<Icon icon="mdi:checkbox-marked" />}
          
            checked={selected}
          />
          
            <Typography variant="body1" color='primary.main'>
              {option.name}
            </Typography>
            {option.sku && (
              <Typography variant="body2" color="text.secondary">
                SKU {option.sku}
              </Typography>
            )}
          </Box>
        </MenuItem>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option._id}
            label={option.name}
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
          label={label}
          placeholder="Type to search products..."
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
                {loading ? <CircularProgress size={20} /> : null}
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
      noOptionsText={
        loading ? "Searching..." : 
        inputValue ? "No products found" : 
        "Type to search products"
      }
      loadingText="Searching products..."
      sx={{
        width: '100%',
        '& .MuiAutocomplete-popupIndicator': {
          display: 'none' // Hide default dropdown arrow
        }
      }}
    />
  );
};

const InventoryFilter = ({
  filters,
  onFilterChange,
  onFilterApply,
  open,
  onClose,
  onManageColumns
}) => {
  const theme = useTheme();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(filters.product || []);

  useEffect(() => {
    setSelectedProducts(filters.product || []);
  }, [filters]);

  const handleSelectChange = (productIds) => {
    setSelectedProducts(productIds);
  };

  const applyFilters = () => {
    onFilterChange({ product: selectedProducts });
    if (onFilterApply) {
      onFilterApply({ product: selectedProducts });
    }
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setSelectedProducts([]);
    onFilterChange({ product: [] });
    if (onFilterApply) {
      onFilterApply({ product: [] });
    }
    setFilterOpen(false);
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedProducts.length > 0) count++;
    return count;
  }, [selectedProducts]);

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
        onClick={() => setFilterOpen(!filterOpen)}
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
            Inventory Filters
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
            transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          <Icon icon="tabler:chevron-down" fontSize={18} />
        </IconButton>
      </div>

      <Collapse in={filterOpen}>
        <Divider />
        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          <Grid container spacing={4}>
            {/* Product Filter with Search */}
            <Grid item size={{xs:12, sm:6, md:6}}>
              <ProductSearchSelect
                id="product-search-select"
                label="Search Products"
                value={selectedProducts}
                onChange={handleSelectChange}
              />
            </Grid>
          </Grid>

          <div className='flex justify-end gap-3 mt-6'>
            <Button
              variant="text"
              size="medium"
              startIcon={<Icon icon="material-symbols:view-column-2" width={22} />}
              onClick={(e) => {
                e.stopPropagation();
                onManageColumns?.();
              }}
            >
              Columns
            </Button>

            <Button
              variant="outlined"
              onClick={resetFilters}
              size="medium"
              startIcon={<Icon icon="tabler:refresh" />}
              disabled={selectedProducts.length === 0}
            >
              Reset Filters
            </Button>

            <Button
              variant="contained"
              onClick={applyFilters}
              size="medium"
              startIcon={<Icon icon="tabler:check" />}
              disabled={selectedProducts.length === 0}
            >
              Apply Filters ({selectedProducts.length})
            </Button>
          </div>
        </div>
      </Collapse>
    </Card>
  );
};

export default InventoryFilter;