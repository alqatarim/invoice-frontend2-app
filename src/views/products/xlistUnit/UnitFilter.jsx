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
import { getUnitList } from '@/app/(dashboard)/products/actions';
import { debounce } from '@/utils/debounce';

const UnitFilter = ({
  onClose,
  setUnitList,
  setTotalCount,
  setPage,
  page,
  pageSize,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = debounce(async (value) => {
    if (value) {
      try {
        const response = await getUnitList(1, 100, value); // Get more results for search
        if (response.success) {
          setSearchResults(response.data || []);
          setNoResults(response.data.length === 0);
        }
      } catch (error) {
        console.error('Error searching units:', error);
        setNoResults(true);
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

  const handleUnitToggle = (unit) => {
    const currentIndex = selectedUnits.findIndex(u => u._id === unit._id);
    const newSelectedUnits = [...selectedUnits];

    if (currentIndex === -1) {
      newSelectedUnits.push(unit);
    } else {
      newSelectedUnits.splice(currentIndex, 1);
    }

    setSelectedUnits(newSelectedUnits);
  };

  const handleApplyFilter = async () => {
    if (selectedUnits.length > 0) {
      try {
        const unitIds = selectedUnits.map(unit => unit._id).join(',');
        const response = await getUnitList(1, pageSize, '', unitIds);
        if (response.success) {
          setUnitList(response.data || []);
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
    setSelectedUnits([]);
    setSearchResults([]);
    setNoResults(false);

    try {
      const response = await getUnitList(1, pageSize);
      if (response.success) {
        setUnitList(response.data || []);
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
        <Typography variant="h6">Filter Units</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search Unit"
          value={searchText}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
      </Box>

      <List sx={{ maxHeight: 300, overflow: 'auto' }}>
        {searchResults.map((unit) => (
          <ListItem key={unit._id} dense button onClick={() => handleUnitToggle(unit)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={selectedUnits.some(u => u._id === unit._id)}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary={unit.name} />
          </ListItem>
        ))}
        {noResults && (
          <ListItem>
            <ListItemText primary="No units found" />
          </ListItem>
        )}
      </List>

      <Box mt={2} display="flex" gap={1}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApplyFilter}
          disabled={selectedUnits.length === 0}
        >
          Apply
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
          disabled={selectedUnits.length === 0 && !searchText}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default UnitFilter;