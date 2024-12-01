'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { getCategoryList } from '@/app/(dashboard)/products/actions';
import { debounce } from '@/utils/debounce';

const CategoryFilter = ({
  onClose,
  setCategoryList,
  setTotalCount,
  setPage,
  page,
  pageSize,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = debounce(async (value) => {
    if (value) {
      try {
        const response = await getCategoryList(1, 100, value); // Get more results for search
        if (response.success) {
          setSearchResults(response.data || []);
          setNoResults(response.data.length === 0);
        } else {
          setNoResults(true);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching categories:', error);
        setNoResults(true);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setNoResults(false);
    }
  }, 300);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    handleSearch(value);
  };

  const handleCategoryToggle = (category) => {
    const currentIndex = selectedCategories.findIndex(c => c._id === category._id);
    const newSelectedCategories = [...selectedCategories];

    if (currentIndex === -1) {
      newSelectedCategories.push(category);
    } else {
      newSelectedCategories.splice(currentIndex, 1);
    }

    setSelectedCategories(newSelectedCategories);
  };

  const handleApplyFilter = async () => {
    if (selectedCategories.length > 0) {
      try {
        const categoryIds = selectedCategories.map(category => category._id).join(',');
        const response = await getCategoryList(1, pageSize, '', categoryIds);
        if (response.success) {
          setCategoryList(response.data || []);
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
    setSearchText('');
    setSelectedCategories([]);
    setSearchResults([]);
    setNoResults(false);

    try {
      const response = await getCategoryList(1, pageSize);
      if (response.success) {
        setCategoryList(response.data || []);
        setTotalCount(response.totalRecords);
        setPage(1);
      }
    } catch (error) {
      console.error('Error resetting filters:', error);
    }

    onClose();
  };

  return (
    <Box sx={{ width: 300, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Filter Categories</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search Category"
          value={searchText}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
      </Box>

      <List sx={{ maxHeight: 300, overflow: 'auto' }}>
        {searchResults.map((category) => (
          <ListItem key={category._id} dense button onClick={() => handleCategoryToggle(category)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={selectedCategories.some(c => c._id === category._id)}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
        {noResults && (
          <ListItem>
            <ListItemText primary="No categories found" />
          </ListItem>
        )}
      </List>

      <Box mt={2} display="flex" gap={1}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApplyFilter}
          disabled={selectedCategories.length === 0}
        >
          Apply
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
          disabled={selectedCategories.length === 0 && !searchText}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default CategoryFilter;