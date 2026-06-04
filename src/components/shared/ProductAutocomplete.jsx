import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

const OPTION_GRID_COLUMNS = 'minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 0.75fr)';

export const getProductCategoryLabel = product => {
  if (!product) return '—';
  if (typeof product.category === 'string') return product.category;
  return product.category?.name || product.category?.title || '—';
};

const dedupeProductsById = (products = []) => {
  const seen = new Set();

  return products.filter(product => {
    const id = product?._id;
    if (!id || seen.has(String(id))) return false;
    seen.add(String(id));
    return true;
  });
};

const productMatchesSearch = (option, search) => {
  if (!search) return true;

  const name = option?.name || '';
  const sku = option?.sku || '';
  const category = getProductCategoryLabel(option);

  return [name, sku, category]
    .filter(Boolean)
    .some(value => String(value).toLowerCase().includes(search));
};

const normalizeSearch = value => String(value || '').trim().toLowerCase();

const ProductOptionsListbox = React.forwardRef(function ProductOptionsListbox(listboxProps, ref) {
  const theme = useTheme();
  const { children, sx, onMouseDown, ...other } = listboxProps;

  return (
    <Box
      component="ul"
      ref={ref}
      {...other}
      onMouseDown={event => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      sx={[{ m: 0, p: 0, listStyle: 'none' }, sx]}
    >
      <Box
        component="li"
        role="presentation"
        sx={{
          display: 'grid',
          gridTemplateColumns: OPTION_GRID_COLUMNS,
          columnGap: 2,
          alignItems: 'center',
          px: 6,
          py: 2.5,
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: theme.vars.palette.background.default,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
          Name
        </Typography>
        <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
          Category
        </Typography>
        <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
          SKU
        </Typography>
      </Box>
      {children}
    </Box>
  );
});

export default function ProductAutocomplete({
  availableProducts = [],
  allProducts = [],
  selectedProduct = null,
  onChange,
  disabled = false,
  autoFocus = false,
  error = false,
  preventBlurOnMouseDown = false,
}) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState(selectedProduct?.name || '');

  useEffect(() => {
    setInputValue(selectedProduct?.name || '');
  }, [selectedProduct?._id, selectedProduct?.name]);

  const optionPool = useMemo(() => {
    const selectableIds = new Set(
      availableProducts.map(product => String(product?._id || '')).filter(Boolean)
    );

    if (selectedProduct?._id) {
      selectableIds.add(String(selectedProduct._id));
    }

    const pool = allProducts.length
      ? allProducts.filter(product => selectableIds.has(String(product?._id || '')))
      : availableProducts;

    return dedupeProductsById(pool);
  }, [allProducts, availableProducts, selectedProduct?._id]);

  const filteredOptions = useMemo(() => {
    const search = normalizeSearch(inputValue);
    if (!search) return optionPool;

    return optionPool.filter(option => productMatchesSearch(option, search));
  }, [inputValue, optionPool]);

  const handleOptionMouseDown = preventBlurOnMouseDown
    ? event => event.preventDefault()
    : undefined;

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      options={filteredOptions}
      value={selectedProduct}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        if (!['input', 'clear', 'reset'].includes(reason)) return;
        setInputValue(newInputValue);
      }}
      getOptionLabel={option => option?.name || ''}
      getOptionKey={option => String(option?._id || option?.id || option?.sku || option?.name || '')}
      filterOptions={(options, { inputValue: muiInputValue }) => {
        const search = normalizeSearch(muiInputValue || inputValue);
        if (!search) return options;

        return options.filter(option => productMatchesSearch(option, search));
      }}
      filterSelectedOptions
      onChange={(_, newValue) => {
        if (!newValue?._id) {
          setInputValue('');
          onChange?.(null);
          return;
        }

        setInputValue(newValue.name || '');
        onChange?.(newValue);
      }}
      renderInput={params => {
        const htmlInputProps = {
          ...params.inputProps,
          ...params.slotProps?.htmlInput,
          onChange: event => {
            setInputValue(event.target.value);
            params.inputProps?.onChange?.(event);
            params.slotProps?.htmlInput?.onChange?.(event);
          },
          className: `${params.inputProps?.className ?? ''} ${params.slotProps?.htmlInput?.className ?? ''} text-[0.85rem]`,
        };

        return (
          <TextField
            {...params}
            size="small"
            placeholder="Select Product"
            autoFocus={autoFocus}
            error={error}
            inputProps={htmlInputProps}
            slotProps={{
              ...params.slotProps,
              htmlInput: htmlInputProps,
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'secondary.light',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'secondary.main',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          />
        );
      }}
      renderOption={(props, option, { index: optionIndex }) => {
        const { key, onMouseDown, ...optionProps } = props;
        const optionKey = String(option?._id || option?.id || key);
        const zebraBg = optionIndex % 2 ? alpha(theme.palette.primary.main, 0.015) : 'transparent';

        return (
          <Box
            key={optionKey}
            component="li"
            {...optionProps}
            onMouseDown={event => {
              handleOptionMouseDown?.(event);
              onMouseDown?.(event);
            }}
            sx={{
              display: 'grid',
              gridTemplateColumns: OPTION_GRID_COLUMNS,
              columnGap: 2,
              alignItems: 'center',
              px: 6,
              py: 0.9,
              minHeight: 38,
              backgroundColor: zebraBg,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              transition: 'background-color 120ms ease',
              '&:last-of-type': { borderBottom: 'none' },
              '&:hover': {
                backgroundColor: theme.palette.secondary.lightestOpacity,
              },
              '&[data-focus="true"]': {
                backgroundColor: theme.palette.primary.main,
              },
              '&[aria-selected="true"]': {
                backgroundColor: theme.palette.primary.lightOpacity,
              },
              '&[aria-selected="true"][data-focus="true"]': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <Typography variant="h6" noWrap sx={{ minWidth: 0, fontSize: '0.8rem' }}>
              {option.name}
            </Typography>
            <Typography variant="h6" noWrap sx={{ minWidth: 0, fontSize: '0.8rem' }}>
              {getProductCategoryLabel(option)}
            </Typography>
            <Typography variant="h6" noWrap sx={{ minWidth: 0, fontSize: '0.8rem' }}>
              {option.sku || '—'}
            </Typography>
          </Box>
        );
      }}
      noOptionsText={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, px: 1 }}>
          <Icon icon="mdi:package-variant-closed" width={22} color={theme.palette.text.secondary} />
          <Typography variant="body2" color="text.secondary">
            No products found
          </Typography>
        </Box>
      }
      slots={{ listbox: ProductOptionsListbox }}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: theme.shadows[8],
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          mt: 1,
          overflow: 'hidden',
        },
      }}
      slotProps={{
        popper: {
          placement: 'bottom-start',
          sx: {
            width: 'auto !important',
            minWidth: 520,
            maxWidth: 'min(760px, calc(100vw - 32px))',
          },
        },
        listbox: {
          sx: {
            maxHeight: 320,
            py: 0,
          },
        },
      }}
      isOptionEqualToValue={(option, value) => String(option._id) === String(value._id)}
      disableClearable
      autoHighlight
      openOnFocus
    />
  );
}
