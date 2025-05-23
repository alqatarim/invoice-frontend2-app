import React from 'react';
import {
  Drawer,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  Typography,
  FormGroup,
  Autocomplete,
  Select,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { statusOptions } from '@/data/dataSets';

/**
 * @typedef {Object} FilterField
 * @property {string} name
 * @property {string} label
 * @property {'text'|'select'|'date'|'checkbox'|'autocomplete'|'custom'} type
 * @property {Array<{ value: any, label: string }>} [options]
 * @property {boolean} [multiple]
 * @property {string} [placeholder]
 * @property {(props: any) => React.ReactNode} [render]
 */

/**
 * @typedef {Object} CustomFilterProps
 * @property {FilterField[]} fields
 * @property {{ [key: string]: any }} values
 * @property {(field: string, value: any) => void} onChange
 * @property {() => void} onApply
 * @property {() => void} onReset
 * @property {boolean} open
 * @property {() => void} onClose
 * @property {string} [title]
 * @property {string} [applyLabel]
 * @property {string} [resetLabel]
 * @property {object} [drawerProps]
 */

/**
 * Stateless, reusable filter component.
 * @param {CustomFilterProps} props
 */
function CustomFilter({
  fields = [],
  values = {},
  onChange,
  onApply,
  onReset,
  open,
  onClose,
  title = 'Filter',
  applyLabel = 'Apply',
  resetLabel = 'Reset',
  drawerProps = {},
}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} {...drawerProps}>
      <Box sx={{ width: { xs: '80vw', sm: '340px' }, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <List className="space-y-2">
          {fields.map((field, idx) => (
            <React.Fragment key={field.name}>
              <ListItem disableGutters>
                <ListItemText primary={field.label} />
              </ListItem>
              {/* Field Types */}
              {field.type === 'text' && (
                <TextField
                  fullWidth
                  margin="normal"
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={e => onChange(field.name, e.target.value)}
                  InputProps={field.placeholder?.toLowerCase().includes('search') ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  } : {}}
                />
              )}
              {field.type === 'select' && (
                <Select
                  fullWidth
                  multiple={!!field.multiple}
                  value={values[field.name] || (field.multiple ? [] : '')}
                  onChange={e => onChange(field.name, e.target.value)}
                  displayEmpty
                  sx={{ my: 1 }}
                >
                  <MenuItem value="" disabled>{field.placeholder || 'Select'}</MenuItem>
                  {field.options?.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              )}
              {field.type === 'date' && (
                <TextField
                  fullWidth
                  margin="normal"
                  type="date"
                  value={values[field.name] || ''}
                  onChange={e => onChange(field.name, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              )}
              {field.type === 'checkbox' && (
                <FormGroup>
                  {field.options?.map(opt => (
                    <FormControlLabel
                      key={opt.value}
                      control={
                        <Checkbox
                          checked={Array.isArray(values[field.name]) ? values[field.name].includes(opt.value) : false}
                          onChange={e => {
                            const prev = Array.isArray(values[field.name]) ? values[field.name] : [];
                            if (e.target.checked) {
                              onChange(field.name, [...prev, opt.value]);
                            } else {
                              onChange(field.name, prev.filter(v => v !== opt.value));
                            }
                          }}
                        />
                      }
                      label={opt.label}
                    />
                  ))}
                </FormGroup>
              )}
              {field.type === 'autocomplete' && (
                <Autocomplete
                  multiple={!!field.multiple}
                  options={field.options || []}
                  getOptionLabel={opt => opt.label || ''}
                  value={
                    field.multiple
                      ? (field.options || []).filter(opt => (values[field.name] || []).includes(opt.value))
                      : (field.options || []).find(opt => opt.value === values[field.name]) || null
                  }
                  onChange={(_, newValue) => {
                    if (field.multiple) {
                      onChange(field.name, newValue.map(opt => opt.value));
                    } else {
                      onChange(field.name, newValue ? newValue.value : '');
                    }
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder={field.placeholder}
                      margin="normal"
                    />
                  )}
                />
              )}
              {field.type === 'custom' && field.render && field.render({
                value: values[field.name],
                onChange: v => onChange(field.name, v),
                field,
                values,
              })}
              {idx < fields.length - 1 && <Divider className="my-2" />}
            </React.Fragment>
          ))}
        </List>
        <Box className="flex justify-between mt-4">
          <Button variant="contained" onClick={onApply} color="primary">
            {applyLabel}
          </Button>
          <Button variant="outlined" onClick={onReset} color="secondary">
            {resetLabel}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default CustomFilter;
