'use client'

import React, { useState } from "react";
import { Box, Button, TextField, FormGroup, FormControlLabel, Checkbox, Typography } from "@mui/material";
import { getProductList } from '@/app/(dashboard)/products/actions';

const ProductFilter = ({ setProductList, setTotalCount, setPage, page, pageSize, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Fetch products with search term
      const response = await getProductList(1, 10, value);
      const products = response?.data || [];
      setSearchResults(products);
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    }
  };

  const handleCheckboxChange = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        return prev.filter(p => p._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const handleApplyFilter = async () => {
    if (selectedProducts.length > 0) {
      try {
        const productIds = selectedProducts.map(product => product._id).join(',');
        const response = await getProductList(1, pageSize, '', productIds);
        if (response.success) {
          setProductList(response.data || []);
          setTotalCount(response.totalRecords);
          setPage(1);
          onClose();
        }
      } catch (error) {
        console.error('Error applying filter:', error);
      }
    }
  };

  const handleReset = async () => {
    setSearchTerm("");
    setSelectedProducts([]);
    setSearchResults([]);

    try {
      const response = await getProductList(1, pageSize);
      if (response.success) {
        setProductList(response.data || []);
        setTotalCount(response.totalRecords);
        setPage(1);
      }
    } catch (error) {
      console.error('Error resetting filters:', error);
    }

    onClose();
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        label="Search Products"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch(e.target.value);
        }}
        margin="normal"
      />

      <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
        <FormGroup>
          {Array.isArray(searchResults) && searchResults.map((product) => (
            <FormControlLabel
              key={product._id}
              control={
                <Checkbox
                  checked={selectedProducts.some(p => p._id === product._id)}
                  onChange={() => handleCheckboxChange(product)}
                />
              }
              label={product.name}
            />
          ))}
        </FormGroup>
        {searchTerm && (!searchResults || searchResults.length === 0) && (
          <Typography color="text.secondary">No products found</Typography>
        )}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApplyFilter}
          disabled={!searchTerm && selectedProducts.length === 0}
        >
          Apply Filter
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
          disabled={!searchTerm && selectedProducts.length === 0}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default ProductFilter;
