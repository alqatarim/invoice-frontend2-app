'use client';

import { useState } from 'react';
import {
  Drawer,
  Box,
  Card,
  Grid,
  Button,
  Checkbox,
  Typography,
  FormControlLabel,
  TextField
} from '@mui/material';
import debounce from 'lodash/debounce';

const PurchaseFilter = ({ open, onClose, setFilterCriteria, vendors = [], resetAllFilters }) => {
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
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 5 }}>
        <Typography variant="h6" sx={{ mb: 4 }}>
          Filters
        </Typography>

        <Card sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Vendor
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={searchTerm}
                placeholder="Search Vendor"
                onChange={handleVendorSearch}
                sx={{ mb: 2 }}
              />
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {filteredVendors.map((vendor) => (
                  <FormControlLabel
                    key={vendor._id}
                    control={
                      <Checkbox
                        checked={selectedVendors.includes(vendor._id)}
                        onChange={() => handleVendorToggle(vendor._id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{vendor.vendor_name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {vendor.vendor_phone}
                        </Typography>
                      </Box>
                    }
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleClearFilter}
                  disabled={selectedVendors.length === 0}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApplyFilter}
                  disabled={selectedVendors.length === 0}
                >
                  Apply Filter
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </Drawer>
  );
};

export default PurchaseFilter;