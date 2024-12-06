import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  InputAdornment,
  FormGroup,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { searchProducts } from '@/app/(dashboard)/inventory/actions';

const InventoryFilter = ({ filters, onFilterChange, open, onClose }) => {
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
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleApply = () => {
    const newFilters = {
      product: selectedProducts,
    };
    onFilterChange(newFilters);
    onClose();
  };

  const handleReset = () => {
    setProductSearchText('');
    setSearchResults([]);
    setSelectedProducts([]);
    onFilterChange({});
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '80vw', sm: '300px' }, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filter Inventory
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Product
        </Typography>
        <TextField
          placeholder="Search Product"
          value={productSearchText}
          onChange={handleProductSearch}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
          <FormGroup>
            {searchResults.map((product) => (
              <FormControlLabel
                key={product._id}
                control={
                  <Checkbox
                    checked={selectedProducts.includes(product._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product._id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                      }
                    }}
                  />
                }
                label={product.name}
              />
            ))}
          </FormGroup>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" onClick={handleApply}>
            Apply
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default InventoryFilter;