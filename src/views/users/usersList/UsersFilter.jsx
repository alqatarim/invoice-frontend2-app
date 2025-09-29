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
     Autocomplete,
     TextField,
     Box,
     Checkbox,
     ListItemText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Icon } from '@iconify/react';
import { userTabs } from '@/data/dataSets';

// Menu styling constants following Materio patterns
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

/**
 * Reusable multi-select autocomplete component with removable chips
 */
const AutocompleteMultiSelect = ({
     label,
     value = [],
     onChange,
     options = [],
     id
}) => {
     const handleChange = (event, newValue) => {
          // Convert to array of values for compatibility with existing code
          const values = newValue.map(item => item.value);
          onChange({
               target: {
                    value: values
               }
          });
     };

     const handleChipDelete = (valueToDelete) => {
          const newValues = value.filter(val => val !== valueToDelete);
          onChange({
               target: {
                    value: newValues
               }
          });
     };

     // Convert current values to option objects for Autocomplete
     const selectedOptions = value.map(val =>
          options.find(opt => opt.value === val) || { value: val, label: val }
     );

     return (
          <Autocomplete
               multiple
               id={id}
               options={options}
               getOptionLabel={(option) => option.label}
               value={selectedOptions}
               onChange={handleChange}
               disableCloseOnSelect
               isOptionEqualToValue={(option, value) => option.value === value.value}
               renderTags={(tagValue, getTagProps) => (
                    <div className='flex flex-wrap gap-1'>
                         {tagValue.map((option, index) => (
                              <Chip
                                   {...getTagProps({ index })}
                                   key={option.value}
                                   label={option.label}
                                   size="small"
                                   variant="tonal"
                                   color="primary"
                                   className="rounded-md cursor-pointer"
                                   onClick={() => handleChipDelete(option.value)}
                                   onDelete={() => handleChipDelete(option.value)}
                                   deleteIcon={<Icon icon="tabler:x" fontSize={14} />}
                                   sx={{
                                        margin: '1px',
                                        '&:hover': {
                                             backgroundColor: theme => theme.palette.primary.main,
                                             color: theme => theme.palette.primary.contrastText,
                                             '& .MuiChip-deleteIcon': {
                                                  color: theme => theme.palette.primary.contrastText,
                                             }
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                   }}
                              />
                         ))}
                    </div>
               )}
               renderInput={(params) => (
                    <TextField
                         {...params}
                         label={label}
                         size="small"
                         placeholder={selectedOptions.length === 0 ? `Select ${label.toLowerCase()}...` : ''}
                    />
               )}
               renderOption={(props, option, { selected }) => (
                    <MenuItem
                         {...props}
                         key={option.value}
                         sx={{
                              padding: '8px 16px',
                              minHeight: 'auto',
                              '&:hover': {
                                   backgroundColor: 'action.hover',
                              }
                         }}
                    >
                         <Checkbox
                              checked={selected}
                              size="small"
                              sx={{
                                   padding: '4px',
                                   marginRight: '8px'
                              }}
                         />
                         <ListItemText
                              primary={option.label}
                              sx={{
                                   margin: 0,
                                   '& .MuiListItemText-primary': {
                                        fontSize: '0.875rem'
                                   }
                              }}
                         />
                    </MenuItem>
               )}
               ListboxProps={{
                    style: {
                         maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                         padding: 0
                    }
               }}
               sx={{
                    '& .MuiAutocomplete-popupIndicator': {
                         transform: 'none'
                    }
               }}
          />
     );
};

/**
 * Date range picker component
 */
const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange }) => (
     <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
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
          <Grid size={{ xs: 6 }}>
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

// Enhanced UsersFilter with status button group and filters

const UsersFilter = ({
     onChange,
     onApply,
     onReset,
     roleOptions = [],
     statusOptions = [],
     values = {},
     tab = [],
     onTabChange,
     onManageColumns
}) => {
     const theme = useTheme();
     const [open, setOpen] = useState(false);
     const [localFilters, setLocalFilters] = useState({
          role: values.role || [],
          search: values.search || '',
          startDate: values.fromDate ? dayjs(values.fromDate) : null,
          endDate: values.toDate ? dayjs(values.toDate) : null,
     });

     // Sync local state with external values
     useEffect(() => {
          setLocalFilters({
               role: values.role || [],
               search: values.search || '',
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
               role: localFilters.role,
               search: localFilters.search,
               fromDate: localFilters.startDate ? dayjs(localFilters.startDate).format('YYYY-MM-DD') : '',
               toDate: localFilters.endDate ? dayjs(localFilters.endDate).format('YYYY-MM-DD') : '',
               status: tab || []
          };
          onApply(currentFilterValues);
     };

     const resetFilters = () => {
          setLocalFilters({
               role: [],
               search: '',
               startDate: null,
               endDate: null,
          });
          onReset();
     };

     // Calculate active filter count
     const activeFilterCount = useMemo(() => {
          let count = 0;
          if (localFilters.role.length > 0) count++;
          if (localFilters.search.length > 0) count++;
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
                                   User Filters
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
                         <div className="p-6 flex flex-col gap-3 ">

                              <Grid container spacing={4}>

                                   {/* Role Filter */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <AutocompleteMultiSelect
                                             id="role-select"
                                             label="Roles"
                                             value={localFilters.role}
                                             onChange={handleSelectChange('role')}
                                             options={roleOptions}
                                        />
                                   </Grid>

                                   {/* Search Filter */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             size="small"
                                             label="Search Users"
                                             placeholder="Search by name, email, or username..."
                                             value={localFilters.search}
                                             onChange={(e) => handleLocalFilterChange('search', e.target.value)}
                                             InputProps={{
                                                  startAdornment: (
                                                       <Icon icon="tabler:search" style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                                                  ),
                                             }}
                                        />
                                   </Grid>

                                   {/* Date Range Filter */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <DateRangePicker
                                             startDate={localFilters.startDate}
                                             endDate={localFilters.endDate}
                                             onStartChange={(newValue) => handleLocalFilterChange('startDate', newValue)}
                                             onEndChange={(newValue) => handleLocalFilterChange('endDate', newValue)}
                                        />
                                   </Grid>

                              </Grid>

                              <Box className='flex justify-between gap-3 items-end'>

                                   <ToggleButtonGroup
                                        color="primary"
                                        value={tab}
                                        exclusive={false}
                                        onChange={onTabChange}
                                        aria-label="user status filter"
                                   >
                                        {userTabs.map((tabObj) => (
                                             <ToggleButton
                                                  key={tabObj.value}
                                                  value={tabObj.value}
                                                  aria-label={tabObj.label}
                                                  size="medium"
                                             >
                                                  {tabObj.label}
                                             </ToggleButton>
                                        ))}
                                   </ToggleButtonGroup>

                                   <div className='flex gap-3'>
                                        <Button
                                             variant="text"
                                             size="small"
                                             startIcon={<Icon icon="material-symbols:view-column-2" />}
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
                                             size="small"
                                             startIcon={<Icon icon="tabler:refresh" />}
                                        >
                                             Reset Filters
                                        </Button>

                                        <Button
                                             variant="contained"
                                             onClick={applyFilters}
                                             size="small"
                                             startIcon={<Icon icon="tabler:check" />}
                                        >
                                             Apply Filters
                                        </Button>
                                   </div>

                              </Box>

                         </div>
                    </Collapse>
               </Card>
          </LocalizationProvider>
     );
};

export default UsersFilter;
