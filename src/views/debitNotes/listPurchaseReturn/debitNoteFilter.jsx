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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Icon } from '@iconify/react';
import { debitNoteTabs } from '@/data/dataSets';

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

/**
 * Date range picker component
 */
const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange }) => (
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <DatePicker
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            label: 'From Date',
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }
          }
        }}
        value={startDate}
        onChange={onStartChange}
        format="DD/MM/YYYY"
      />
    </Grid>
    <Grid item xs={6}>
      <DatePicker
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            label: 'To Date',
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }
          }
        }}
        value={endDate}
        onChange={onEndChange}
        format="DD/MM/YYYY"
        minDate={startDate || undefined}
      />
    </Grid>
  </Grid>
);

const DebitNoteFilter = ({
  onChange,
  onApply,
  onReset,
  vendorOptions = [],
  debitNoteOptions = [],
  values = {},
  tab = [],
  onTabChange,
  onManageColumns
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    vendor: values.vendor || [],
    debitNoteNumber: values.debitNoteNumber || [],
    startDate: values.fromDate ? dayjs(values.fromDate) : null,
    endDate: values.toDate ? dayjs(values.toDate) : null,
  });

  // Sync local state with external values
  useEffect(() => {
    setLocalFilters({
      vendor: values.vendor || [],
      debitNoteNumber: values.debitNoteNumber || [],
      startDate: values.fromDate ? dayjs(values.fromDate) : null,
      endDate: values.toDate ? dayjs(values.toDate) : null,
    });
  }, [values]);

  // Handlers
  const handleLocalFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));

    // Map date fields to expected format
    if (field === 'startDate') {
      onChange('fromDate', value ? dayjs(value).format('YYYY-MM-DD') : '');
    } else if (field === 'endDate') {
      onChange('toDate', value ? dayjs(value).format('YYYY-MM-DD') : '');
    } else {
      onChange(field, value);
    }
  };

  const handleSelectChange = (field) => (event) => {
    const value = typeof event.target.value === 'string'
      ? event.target.value.split(',')
      : event.target.value;
    handleLocalFilterChange(field, value);
  };

  const applyFilters = () => {
    const currentFilterValues = {
      vendor: localFilters.vendor,
      debitNoteNumber: localFilters.debitNoteNumber,
      fromDate: localFilters.startDate ? dayjs(localFilters.startDate).format('YYYY-MM-DD') : '',
      toDate: localFilters.endDate ? dayjs(localFilters.endDate).format('YYYY-MM-DD') : '',
      status: tab || []
    };
    onApply(currentFilterValues);
  };

  const resetFilters = () => {
    setLocalFilters({
      vendor: [],
      debitNoteNumber: [],
      startDate: null,
      endDate: null,
    });
    onReset();
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.vendor.length > 0) count++;
    if (localFilters.debitNoteNumber.length > 0) count++;
    if (localFilters.startDate) count++;
    if (localFilters.endDate) count++;
    if (tab?.length > 0 && !tab.includes('ALL')) count++;
    return count;
  }, [localFilters, tab]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            Debit Note Filters
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
            {/* Status Filter Section */}
            <Grid item xs={12}>
              <ToggleButtonGroup
                color="primary"
                value={tab}
                exclusive={false}
                onChange={onTabChange}
                aria-label="debit note status filter"
              >
                {debitNoteTabs?.map((tabObj) => (
                  <ToggleButton
                    key={tabObj.value}
                    value={tabObj.value}
                    aria-label={tabObj.label}
                    size="medium"
                  >
                    {tabObj.label}
                  </ToggleButton>
                )) || []}
              </ToggleButtonGroup>
            </Grid>

            {/* Vendor Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <MultiSelectDropdown
                id="vendor-select"
                label="Vendors"
                value={localFilters.vendor}
                onChange={handleSelectChange('vendor')}
                options={vendorOptions}
              />
            </Grid>

            {/* Debit Note Number Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <MultiSelectDropdown
                id="debit-note-select"
                label="Debit Note Numbers"
                value={localFilters.debitNoteNumber}
                onChange={handleSelectChange('debitNoteNumber')}
                options={debitNoteOptions}
              />
            </Grid>

            {/* Date Range Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <DateRangePicker
                startDate={localFilters.startDate}
                endDate={localFilters.endDate}
                onStartChange={(newValue) => handleLocalFilterChange('startDate', newValue)}
                onEndChange={(newValue) => handleLocalFilterChange('endDate', newValue)}
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
                onManageColumns();
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
    </LocalizationProvider>
  );
};

export default DebitNoteFilter;