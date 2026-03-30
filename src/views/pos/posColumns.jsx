import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Autocomplete,
  Box,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomOriginalIconButton from '@core/components/mui/CustomOriginalIconButton';
import { productSupportsScaleBarcode } from '@/utils/productScaleBarcode';

const getProductCategoryLabel = (product) => {
  if (!product) return '—';
  if (typeof product.category === 'string') return product.category;
  return product.category?.name || product.category?.title || '—';
};

const normalizeQuantityInput = (value, allowDecimals = false) => {
  const parsed = Number(String(value ?? '').replace(/,/g, '.'));
  if (!Number.isFinite(parsed)) return 0;

  const normalizedValue = Math.max(0, parsed);
  return allowDecimals
    ? Number(normalizedValue.toFixed(3))
    : Math.floor(normalizedValue);
};

const normalizeRateInput = (value) => {
  const parsed = Number(String(value ?? '').replace(/,/g, '.'));
  if (!Number.isFinite(parsed)) return 0;

  return Math.max(0, Number(parsed.toFixed(4)));
};

export const getPosColumns = ({
  control,
  errors,
  setValue,
  getValues,
  watchItems,
  productData,
  productsCloneData,
  discountMenu,
  setDiscountMenu,
  taxMenu,
  taxRates,
  theme,
  updateCalculatedFields,
  handleUpdateItemProduct,
  handleClearAppliedPromotion,
  handleClearScaleBarcode,
  handleMenuItemClick,
  handleTaxClick,
  handleTaxClose,
  handleTaxMenuItemClick,
  handleDeleteItem,
  handleAddEmptyRow,
  fields,
}) => {
  const availableProducts = Array.isArray(productsCloneData) ? productsCloneData : [];
  const allProducts = Array.isArray(productData) ? productData : [];
  const taxOptions = Array.isArray(taxRates) ? taxRates : [];

  const resolveProductById = (productId) => {
    if (!productId) return null;
    return allProducts.find((p) => p._id === productId) || null;
  };

  return [
    {
      key: 'product',
      label: <Typography variant="overline" fontWeight={500}>Product</Typography>,
      width: '28%',
      align: 'left',
      renderCell: (item, index) => (
        <Controller
          name={`items.${index}.productId`}
          control={control}
          render={({ field }) => {
            const watched = watchItems?.[index] || {};
            const selectedProduct =
              resolveProductById(field.value) ||
              (watched.productId
                ? { _id: watched.productId, name: watched.name || '', sku: watched.sku || '', category: watched.category || null }
                : null);
            const options = selectedProduct
              ? [selectedProduct, ...availableProducts.filter((p) => p._id !== selectedProduct._id)]
              : availableProducts;

            const gridCols = 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 0.75fr)';

            const ListboxComponent = React.forwardRef(function PosListbox(props, ref) {
              const { children, sx, ...other } = props;
              return (
                <Box component="ul" ref={ref} {...other} sx={[{ m: 0, p: 0, listStyle: 'none' }, sx]}>
                  <Box
                    component="li"
                    role="presentation"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: gridCols,
                      columnGap: 2,
                      px: 6,
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      bgcolor: theme.palette.background.default,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    }}
                  >
                    <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>Name</Typography>
                    <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>Category</Typography>
                    <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>SKU</Typography>
                  </Box>
                  {children}
                </Box>
              );
            });

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Autocomplete
                  fullWidth
                  options={options}
                  value={selectedProduct}
                  getOptionLabel={(o) => o?.name || ''}
                  filterOptions={(opts, { inputValue }) => {
                    const s = inputValue.trim().toLowerCase();
                    if (!s) return opts;
                    return opts.filter((o) =>
                      [o?.name, o?.sku, getProductCategoryLabel(o)].some((v) => String(v || '').toLowerCase().includes(s))
                    );
                  }}
                  onChange={(_, newValue) => {
                    if (!newValue?._id) { field.onChange(''); return; }
                    field.onChange(newValue._id);
                    handleUpdateItemProduct(index, newValue._id, field.value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Search product..."
                      autoFocus={index === 0}
                      error={!!errors.items?.[index]?.productId}
                      helperText={errors.items?.[index]?.productId?.message}
                      inputProps={{ ...params.inputProps, className: `${params.inputProps?.className ?? ''} text-[0.85rem]` }}
                    />
                  )}
                  renderOption={(props, option, { index: oi }) => {
                  const { key, ...rest } = props;
                  return (
                    <Box
                      key={key}
                      component="li"
                      {...rest}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: gridCols,
                        columnGap: 2,
                        px: 6,
                        py: 0.9,
                        minHeight: 38,
                        backgroundColor: oi % 2 ? alpha(theme.palette.primary.main, 0.015) : 'transparent',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        '&:last-of-type': { borderBottom: 'none' },
                        '&:hover': { backgroundColor: theme.palette.secondary.lightestOpacity },
                        '&[data-focus="true"]': { backgroundColor: theme.palette.primary.main },
                        '&[aria-selected="true"]': { backgroundColor: theme.palette.primary.lightOpacity },
                      }}
                    >
                      <Typography noWrap sx={{ fontSize: '0.8rem' }}>{option.name}</Typography>
                      <Typography noWrap sx={{ fontSize: '0.8rem' }}>{getProductCategoryLabel(option)}</Typography>
                      <Typography noWrap sx={{ fontSize: '0.8rem' }}>{option.sku || '—'}</Typography>
                    </Box>
                  );
                  }}
                  noOptionsText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, px: 1 }}>
                      <Icon icon="mdi:package-variant-closed" width={22} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">No products found</Typography>
                    </Box>
                  }
                  slots={{ listbox: ListboxComponent }}
                  PaperProps={{
                    sx: { borderRadius: '12px', boxShadow: theme.shadows[8], border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, mt: 1, overflow: 'hidden' },
                  }}
                  slotProps={{
                    popper: { placement: 'bottom-start', sx: { width: 'auto !important', minWidth: 520, maxWidth: 'min(760px, calc(100vw - 32px))' } },
                    listbox: { sx: { maxHeight: 320, py: 0 } },
                  }}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  disableClearable
                  autoHighlight
                />
                {watched.promotionAutoApplied && watched.promotionSummary ? (
                  <Typography variant="caption" color="success.main" sx={{ lineHeight: 1.2, pl: 0.5 }}>
                    {watched.promotionSummary}
                  </Typography>
                ) : null}
                {watched.scaleBarcodeSummary ? (
                  <Typography variant="caption" color="info.main" sx={{ lineHeight: 1.2, pl: 0.5 }}>
                    {watched.scaleBarcodeSummary}
                  </Typography>
                ) : null}
              </Box>
            );
          }}
        />
      ),
    },
    {
      key: 'sku',
      label: <Typography variant="overline" fontWeight={500}>SKU</Typography>,
      width: '10%',
      align: 'center',
      renderCell: (_, index) => {
        const watched = watchItems?.[index] || {};
        const product = resolveProductById(watched.productId);
        const sku = watched.sku || product?.sku || '—';

        return (
          <Typography variant="body1" color="text.primary" className="text-[0.85rem] whitespace-nowrap">
            {sku}
          </Typography>
        );
      },
    },
    {
      key: 'quantity',
      label: <Typography variant="overline" fontWeight={500}>Qty</Typography>,
      width: '10%',
      align: 'center',
      renderCell: (item, index) => {
        const watched = watchItems?.[index] || {};
        const product = resolveProductById(watched.productId);
        const allowDecimalQuantity = Boolean(
          watched.scaleBarcodeSummary || productSupportsScaleBarcode(product)
        );

        return (
          <Controller
            name={`items.${index}.quantity`}
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.items?.[index]?.quantity} fullWidth>
                <TextField
                  {...field}
                  type="number"
                  variant="outlined"
                  size="small"
                  placeholder="Qty"
                  className="[&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden"
                  slotProps={{
                    htmlInput: {
                      className: 'text-[0.85rem]',
                      min: 0,
                      step: allowDecimalQuantity ? 0.001 : 1,
                      onKeyDown: (event) => {
                        if (!allowDecimalQuantity && event.key === '.') {
                          event.preventDefault();
                        }
                      },
                    },
                  }}
                  onChange={(event) => {
                    const quantity = normalizeQuantityInput(
                      event.target.value,
                      allowDecimalQuantity
                    );
                    if (watched.scaleBarcodeSummary) {
                      handleClearScaleBarcode(index);
                    }
                    setValue(`items.${index}.quantity`, quantity, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setValue(`items.${index}.isRateFormUpadted`, true);
                    const nextItem = getValues(`items.${index}`);
                    updateCalculatedFields(index, { ...nextItem, quantity }, setValue);
                  }}
                  error={!!errors.items?.[index]?.quantity}
                  helperText={errors.items?.[index]?.quantity?.message}
                />
              </FormControl>
            )}
          />
        );
      },
    },
    {
      key: 'rate',
      label: <Typography variant="overline" fontWeight={500}>Rate</Typography>,
      width: '12%',
      align: 'center',
      renderCell: (item, index) => (
        <Controller
          name={`items.${index}.rate`}
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.items?.[index]?.rate} size="small" fullWidth>
              <TextField
                {...field}
                type="number"
                variant="outlined"
                size="small"
                placeholder="Rate"
                className="[&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden"
                slotProps={{
                  input: {
                    sx: { paddingLeft: '8px' },
                    startAdornment: <Icon icon="lucide:saudi-riyal" width={18} color={theme.palette.secondary.main} />,
                  },
                  htmlInput: { className: 'text-[0.85rem]', sx: { paddingLeft: '4px' }, min: 0, step: 0.01 },
                }}
                onChange={(e) => {
                  const watched = watchItems?.[index] || {};
                  const rate = normalizeRateInput(e.target.value);
                  if (watched.scaleBarcodeSummary) {
                    handleClearScaleBarcode(index);
                  }
                  setValue(`items.${index}.rate`, rate, { shouldValidate: true, shouldDirty: true });
                  setValue(`items.${index}.form_updated_rate`, Number(rate || 0).toFixed(4));
                  setValue(`items.${index}.isRateFormUpadted`, 'true');
                  const nextItem = getValues(`items.${index}`);
                  updateCalculatedFields(index, nextItem, setValue);
                }}
                error={!!errors.items?.[index]?.rate}
                helperText={errors.items?.[index]?.rate?.message}
              />
            </FormControl>
          )}
        />
      ),
    },
    {
      key: 'discount',
      label: <Typography variant="overline" fontWeight={500}>Discount</Typography>,
      width: '18%',
      align: 'center',
      renderCell: (_, index) => {
        const watched = watchItems?.[index] || {};

        return (
          <Box
            className="flex flex-row items-center justify-start gap-1"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <CustomOriginalIconButton
              onClick={(event) => setDiscountMenu({ anchorEl: event.currentTarget, rowIndex: index })}
              color="primary"
              size="small"
            >
              {Number(watched.discountType) === 2 ? (
                <Icon icon="lucide:percent" color={theme.palette.primary.light} height={18} />
              ) : Number(watched.discountType) === 3 ? (
                <Icon icon="lucide:saudi-riyal" color={theme.palette.primary.light} height={16} />
              ) : (
                <Icon icon="ri-discount-percent-line" color={theme.palette.primary.light} height={18} />
              )}
            </CustomOriginalIconButton>

            {Number(watched.discountType) === 2 ? (
              <Controller
                name={`items.${index}.form_updated_discount`}
                control={control}
                render={({ field }) => {
                  const handleChange = (event) => {
                    const raw = String(event.target.value ?? '');
                    const normalized = raw.replace(/^0+(?=\d)/, '');
                    let value = Number(normalized || 0);
                    value = Math.min(100, Math.max(0, value));
                    handleClearAppliedPromotion(index);
                    field.onChange(value);
                    setValue(`items.${index}.isRateFormUpadted`, true);
                    const nextItem = getValues(`items.${index}`);
                    updateCalculatedFields(index, nextItem, setValue);
                  };

                  return (
                    <TextField
                      {...field}
                      value={field.value}
                      type="number"
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="Discount (%)"
                      aria-label="Discount Percentage"
                      className="[&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden"
                      slotProps={{
                        htmlInput: {
                          className: 'text-[0.85rem]',
                          min: 0,
                          max: 100,
                          step: 1,
                          sx: { paddingLeft: '8px' },
                        },
                        input: {
                          sx: { paddingRight: '8px' },
                          endAdornment: Number(watched.discount) > 0 ? (
                            <Box
                              className="flex flex-row items-center gap-0"
                              sx={{ justifyContent: 'flex-end', pl: 0.5, whiteSpace: 'nowrap' }}
                            >
                              <Icon icon="lucide:saudi-riyal" width={13} color={theme.palette.secondary.main} />
                              <Typography variant="subtitle2" color="secondary.main">
                                {Number(watched.discount).toFixed(0)}
                              </Typography>
                            </Box>
                          ) : null,
                        },
                      }}
                      onChange={handleChange}
                      error={!!errors.items?.[index]?.form_updated_discount}
                    />
                  );
                }}
              />
            ) : (
              <Controller
                name={`items.${index}.discount`}
                control={control}
                render={({ field }) => {
                  const handleChange = (event) => {
                    const raw = String(event.target.value ?? '');
                    const normalized = raw.replace(/^0+(?=\d)/, '');
                    let value = Number(normalized || 0);
                    value = Math.max(0, value);
                    handleClearAppliedPromotion(index);
                    field.onChange(value);
                    setValue(`items.${index}.form_updated_discount`, value);
                    setValue(`items.${index}.isRateFormUpadted`, true);
                    setValue(`items.${index}.discount`, value);
                    const nextItem = getValues(`items.${index}`);
                    updateCalculatedFields(index, nextItem, setValue);
                  };

                  return (
                    <TextField
                      {...field}
                      value={field.value}
                      type="number"
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="Discount"
                      aria-label="Discount Fixed Amount"
                      className="[&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden"
                      slotProps={{
                        htmlInput: {
                          className: 'text-[0.85rem]',
                          min: 0,
                          step: 1,
                          sx: { paddingLeft: '8px' },
                        },
                      }}
                      onChange={handleChange}
                      error={!!errors.items?.[index]?.discount}
                    />
                  );
                }}
              />
            )}

            <Menu
              anchorEl={discountMenu?.anchorEl}
              open={discountMenu?.rowIndex === index && Boolean(discountMenu?.anchorEl)}
              onClose={() => setDiscountMenu({ anchorEl: null, rowIndex: null })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } }}
              className="[&_.MuiMenuItem-root]:py-1"
            >
              <MenuItem
                onClick={() => {
                  handleMenuItemClick(index, 2);
                  setDiscountMenu({ anchorEl: null, rowIndex: null });
                }}
                className="flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight"
              >
                <Typography variant="overline">Percentage</Typography>
                <Box className="flex flex-row items-center gap-1">
                  <Icon icon="material-symbols:percent-rounded" width="20" color={theme.palette.primary.main} />
                </Box>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuItemClick(index, 3);
                  setDiscountMenu({ anchorEl: null, rowIndex: null });
                }}
                className="flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight"
              >
                <Typography variant="overline">Fixed Amount</Typography>
                <Box className="flex flex-row items-center gap-1">
                  <Icon icon="lucide:saudi-riyal" width="20" color={theme.palette.primary.main} />
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        );
      },
    },
    {
      key: 'amount',
      label: <Typography variant="overline" fontWeight={500}>Total</Typography>,
      width: '16%',
      align: 'center',
      renderCell: (item, index) => {
        const watched = watchItems?.[index] || {};
        const vatRate =
          watched.taxInfo && typeof watched.taxInfo === 'object'
            ? Number(watched.taxInfo.taxRate || 0)
            : 0;
        const vatAmount = Number(watched.tax || 0);

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              minWidth: 0,
            }}
          >
            <Box className="flex flex-row items-center gap-0.5">
              <Icon icon="lucide:saudi-riyal" color={theme.palette.secondary.light} width={14} />
              <Typography variant="h6" fontWeight={500} className="text-[0.85rem] whitespace-nowrap">
                {isNaN(Number(watched.amount)) ? '0.00' : Number(watched.amount).toFixed(2)}
              </Typography>
            </Box>

            <CustomOriginalIconButton
              onClick={(event) => handleTaxClick(event, index)}
              color="primary"
              size="small"
              sx={{
                borderRadius: 999,
                px: 0.75,
                py: 0.25,
                // bgcolor: alpha(theme.palette.primary.main, 0.06),
              }}
            >

              {/* <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: 'nowrap', lineHeight: 1.2 }}
              >
                VAT {vatRate}%: {Number.isFinite(vatAmount) ? vatAmount.toFixed(2) : '0.00'}
              </Typography> */}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: 'nowrap', fontStyle: 'italic', lineHeight: 1.2, fontWeight: 500, fontSize: '0.7rem' }}
              >
                (VAT {Number.isFinite(vatAmount) ? vatAmount.toFixed(2) : '0.00'})
              </Typography>
            </CustomOriginalIconButton>

            <Menu
              anchorEl={taxMenu?.anchorEl}
              open={taxMenu?.rowIndex === index && Boolean(taxMenu?.anchorEl)}
              onClose={handleTaxClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {taxOptions.map((tax) => (
                <MenuItem
                  key={tax._id}
                  onClick={() => handleTaxMenuItemClick(index, tax)}
                  sx={{
                    py: 1,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Box className="flex flex-row items-center justify-between w-[8em]">
                    <Typography variant="body2">{tax.name}</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        px: 1,
                        py: 0.5,
                        borderRadius: '4px',
                      }}
                    >
                      {tax.taxRate}%
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      width: '6%',
      align: 'center',
      renderCell: (item, index) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDeleteItem(index)}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey && index === fields.length - 1) {
              e.preventDefault();
              handleAddEmptyRow();
            }
          }}
          tabIndex={0}
        >
          <Icon icon="ic:twotone-delete" width={20} color={theme.palette.error.main} />
        </IconButton>
      ),
    },
  ];
};
