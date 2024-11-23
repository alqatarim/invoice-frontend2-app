'use client'

import React, { useState, useEffect } from "react";
import { TextField, Button, Checkbox, FormControlLabel, Typography, Box, IconButton } from "@mui/material";
import { debounce } from "lodash";
import { getProductList, resetProductList } from "@/app/(dashboard)/products/actions"; // Import the API functions
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

const ProductFilter = ({ setProductList, setTotalCount, setPage, page, pagesize }) => {
  const [key, setKey] = useState([]);
  const [noData, setNoData] = useState(false);
  const [searchText, setSearchText] = useState({ value: "", asset: [] });
  const [searchInputValue, setSearchInputValue] = useState("");

  useEffect(() => {
    if (searchText.asset.length) {
      setKey([]);
    }
  }, [searchText]);

  const onSearchChange = async (val) => {
    if (val !== "") {
      try {
        const response = await getProductList(1, pagesize, val); // Use getProductList with search term
        if (response.length > 0) {
          setNoData(false);
          setSearchText({ value: val, asset: response });
        } else {
          setSearchText({ value: val, asset: [] });
          setNoData(true);
        }
      } catch {
        setNoData(true);
      }
    } else {
      resetList();
    }
  };

  const resetList = async () => {
    const response = await resetProductList(1, pagesize); // Fetch the complete product list
    setProductList(response || []);
    setTotalCount(response.length); // Assuming response has a length property
  };

  const handleCheckboxChange = (event, id) => {
    const { checked } = event.target;
    setKey((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const handleApplyFilter = async () => {
    const response = await getProductList(page, pagesize, key.join(",")); // Fetch filtered products
    setProductList(response || []);
    setTotalCount(response.length); // Assuming response has a length property
    setPage(1);
  };

  const handleFilterClear = () => {
    setKey([]);
    setSearchText({ value: "", asset: [] });
    setNoData(false);
    setSearchInputValue("");
    resetList();
  };

  const onSearchProcessChange = debounce(onSearchChange, 200);

  return (
    <Box>
      <Typography variant="h6">Filter</Typography>
      <TextField
        label="Search Product"
        variant="outlined"
        fullWidth
        value={searchInputValue}
        onChange={(e) => {
          const val = e.target.value.toLowerCase();
          setSearchInputValue(val);
          onSearchProcessChange(val);
        }}
        InputProps={{
          endAdornment: (
            <IconButton>
              <SearchIcon />
            </IconButton>
          ),
        }}
      />
      <Box>
        {searchText.asset.map((item, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={key.includes(item._id)}
                onChange={(e) => handleCheckboxChange(e, item._id)}
              />
            }
            label={item.name}
          />
        ))}
        {noData && <Typography>No products found!</Typography>}
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleApplyFilter}
        disabled={key.length === 0}
      >
        Apply
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleFilterClear}
        startIcon={<ClearIcon />}
      >
        Reset
      </Button>
    </Box>
  );
};

export default ProductFilter;
