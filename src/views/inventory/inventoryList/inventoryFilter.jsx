'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
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
} from '@mui/material';
import { Icon } from '@iconify/react';
import { searchProducts } from '@/app/(dashboard)/inventory/actions';

/**
 * Reusable multi-select dropdown component
 */
const MultiSelectDropdown = ({
  label,
  value = [],
  onChange,
  options = [],
  id
}) => (
  <FormControl fullWidth size="small">
    <InputLabel id={`${id}-label`}>{label}</InputLabel>
    <Select
      labelId={`${id}-label`}
      id={id}
      multiple
      value={value}
      onChange={onChange}
      input={<OutlinedInput label={label} />}
      renderValue={(selected) => (
        <div className="flex flex-row flex-wrap gap-1">
          {selected.map((val) => {
            const option = options.find(opt => opt.value === val);
            return (
              <Chip
                key={val}
                label={option?.label || val}
                size="small"
                variant="tonal"
                color="primary"
                className="rounded-md"
              />
            );
          })}
        </div>
      )}
      MenuProps={{
        PaperProps: {
          style: { maxHeight: 224, width: 280 }
        }
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        }
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const InventoryFilter = ({
  filters,
  onFilterChange,
  open,
  onClose,
  onManageColumns
}) => {
  const theme = useTheme();
  const [filterOpen, setFilterOpen] = useState(false);
  const [productSearchText, setProductSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(filters.product || []);

  useEffect(() => {
    setSelectedProducts(filters.product || []);
  }, [filters]);

  const handleProductSearch = async (e) => {
    const searchTerm = e.target.value;
    setProductSearchText(searchTerm);

    if (searchTerm.length > 0) {
      try {
        const results = await searchProducts(searchTerm);
        setSearchResults(results.map(product => ({
          value: product._id,
          label: product.name
        })));
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectChange = (field) => (event) => {
    const value = typeof event.target.value === 'string'
      ? event.target.value.split(',')
      : event.target.value;

    if (field === 'product') {
      setSelectedProducts(value);
    }
    onFilterChange({ [field]: value });
  };

  const applyFilters = () => {
    onFilterChange({ product: selectedProducts });
    onClose();
  };

  const resetFilters = () => {
    setProductSearchText('');
    setSearchResults([]);
    setSelectedProducts([]);
    onFilterChange({});
    onClose();
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
        <div className="p-6">
          <Grid container spacing={4}>
            {/* Product Filter */}
            <Grid item xs={12} sm={6} md={6}>
              <MultiSelectDropdown
                id="product-select"
                label="Products"
                value={selectedProducts}
                onChange={handleSelectChange('product')}
                options={searchResults}
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
            >
              Reset Filters
            </Button>

            <Button
              variant="contained"
              onClick={applyFilters}
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

export default InventoryFilter;