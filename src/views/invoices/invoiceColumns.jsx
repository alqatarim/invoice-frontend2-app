import React from 'react';
import { Controller } from 'react-hook-form';
import {
  TextField,
  MenuItem,
  FormControl,
  Typography,
  IconButton,
  Box,
  Menu,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomOriginalIconButton from '@core/components/mui/CustomOriginalIconButton';
import ProductAutocomplete from '@/components/shared/ProductAutocomplete';
import { productSupportsScaleBarcode } from '@/utils/productScaleBarcode';

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

export const getInvoiceFormColumns = ({
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
  handleDeleteItem,
  handleAddEmptyRow,
  handleMenuItemClick,
  handleTaxClick,
  handleTaxClose,
  handleTaxMenuItemClick,
  fields,
  autoFocusFirstProductCell = false,
  disabled = false,
}) => {
  const sourceProducts = Array.isArray(productData) && productData.length
    ? productData
    : Array.isArray(productsCloneData)
      ? productsCloneData
      : [];
  const selectedProductIds = new Set(
    (Array.isArray(watchItems) ? watchItems : [])
      .map(item => item?.productId)
      .filter(Boolean)
  );
  const availableProducts = sourceProducts.filter(product => !selectedProductIds.has(product?._id));
  const allProducts = sourceProducts;
  const taxOptions = Array.isArray(taxRates) ? taxRates : [];

  const resolveProductById = (productId) => {
    if (!productId) return null;
    return allProducts.find((product) => product._id === productId) || null;
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
                ? {
                  _id: watched.productId,
                  name: watched.name || '',
                  sku: watched.sku || '',
                  category: watched.category || null,
                }
                : null);

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <ProductAutocomplete
                  availableProducts={availableProducts}
                  allProducts={allProducts}
                  selectedProduct={selectedProduct}
                  disabled={disabled}
                  autoFocus={autoFocusFirstProductCell && index === 0}
                  error={!!errors.items?.[index]?.productId}
                  onChange={newValue => {
                    if (!newValue?._id) {
                      field.onChange('');
                      return;
                    }

                    field.onChange(newValue._id);
                    handleUpdateItemProduct(index, newValue._id, field.value);
                  }}
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
      )
    },
    {
      key: 'sku',
      label: <Typography variant="overline" fontWeight={500} >SKU</Typography>,
      width: '10%',
      align: 'center',
      hideBelow: 'md',
      renderCell: (_, index) => {
        const watched = watchItems?.[index] || {};
        const product = resolveProductById(watched.productId);
        const sku = watched.sku || product?.sku || '—';
        return (
          <Typography variant="body1" color="text.primary" className="text-[0.85rem] whitespace-nowrap">
            {sku}
          </Typography>
        );
      }
    },
    {
      key: 'quantity',
      label: <Typography variant="overline" fontWeight={500} >Qty</Typography>,
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
                  placeholder="Quantity"
                  disabled={disabled}
                  className="[&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
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
                    setValue(`items.${index}.quantity`, quantity, { shouldValidate: true, shouldDirty: true });
                    setValue(`items.${index}.isRateFormUpadted`, true);
                    const nextItem = getValues(`items.${index}`);
                    updateCalculatedFields(index, { ...nextItem, quantity }, setValue);
                  }}
                  error={!!errors.items?.[index]?.quantity}
                />
              </FormControl>
            )}
          />
        );
      }
    },
    {
      key: 'rate',
      label: <Typography variant="overline" fontWeight={500} >Rate</Typography>,
      width: '12%',
      align: 'center',
      hideBelow: 'md',
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
                placeholder="Rate"
                size="small"
                disabled={disabled}
                className="min-w-[90px] [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
                slotProps={{
                  input: {
                    sx: { paddingLeft: '8px' },
                    startAdornment: (
                      <Icon icon="lucide:saudi-riyal" width={20} color={theme.palette.secondary.main} />
                    ),
                  },
                  htmlInput: {
                    className: 'text-[0.85rem]',
                    sx: { paddingLeft: '4px' },
                    min: 0,
                    step: 0.01,
                  },
                }}
                onChange={(event) => {
                  const watched = watchItems?.[index] || {};
                  const rate = normalizeRateInput(event.target.value);
                  if (watched.scaleBarcodeSummary) {
                    handleClearScaleBarcode(index);
                  }
                  setValue(`items.${index}.rate`, rate);
                  setValue(`items.${index}.form_updated_rate`, Number(rate || 0).toFixed(4));
                  setValue(`items.${index}.isRateFormUpadted`, 'true');
                  const nextItem = getValues(`items.${index}`);
                  updateCalculatedFields(index, nextItem, setValue);
                }}
                error={!!errors.items?.[index]?.rate}
              />
            </FormControl>
          )}
        />
      )
    },
    {
      key: 'discount',
      label: <Typography variant="overline" fontWeight={500} >Discount</Typography>,
      width: '18%',
      align: 'center',
      hideBelow: 'md',
      renderCell: (item, index) => {
        const watched = watchItems[index] || {};
        return (
          <Box
            className='flex flex-row items-center justify-start gap-1'
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* <CustomIconButton
              variant="tonal"
              onClick={(event) => setDiscountMenu({ anchorEl: event.currentTarget, rowIndex: index })}
              color="primary"
              skin="lightest"
              size="small"
              className="min-w-[32px] min-h-[36px] px-2 py-0"
            >
              {Number(watched.discountType) === 2 ? (
                <Icon icon="lucide:percent" color={theme.palette.primary.light} width={19} />
              ) : Number(watched.discountType) === 3 ? (
                <Icon icon="lucide:saudi-riyal" color={theme.palette.primary.light} width={19} />
              ) : ''}
            </CustomIconButton> */}



            <CustomOriginalIconButton
              // variant=""
              onClick={(event) => setDiscountMenu({ anchorEl: event.currentTarget, rowIndex: index })}
              color="primary"
              // skin="lightest"
              size="small"
              disabled={disabled}
            // className="min-w-[32px] min-h-[36px] px-2 py-0"
            >
              {Number(watched.discountType) === 2 ? (
                <Icon icon="lucide:percent" color={theme.palette.primary.light} height={18} />
              ) : Number(watched.discountType) === 3 ? (
                <Icon icon="lucide:saudi-riyal" color={theme.palette.primary.light} height={16} />
              ) : ''}
            </CustomOriginalIconButton>



            {Number(watched.discountType) === 2 ? (
              <Controller
                fullWidth
                // sx={{ flex: 1 }}
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
                      // sx={{ flex: 1 }}
                      placeholder="Discount (%)"
                      disabled={disabled}
                      aria-label="Discount Percentage"
                      tabIndex={0}
                      className=" [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
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
                      sx={{ flex: 1 }}
                      placeholder="Discount"
                      disabled={disabled}
                      aria-label="Discount Fixed Amount"
                      tabIndex={0}
                      className=" [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
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
              anchorEl={discountMenu.anchorEl}
              open={discountMenu.rowIndex === index && Boolean(discountMenu.anchorEl)}
              onClose={() => setDiscountMenu({ anchorEl: null, rowIndex: null })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } }}
              className='[&_.MuiMenuItem-root]:py-1'
            >
              <MenuItem
                onClick={() => {
                  handleMenuItemClick(index, 2);
                  setDiscountMenu({ anchorEl: null, rowIndex: null });
                }}
                disabled={disabled}
                className='flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight'
              >
                <Typography variant="overline">Percentage</Typography>
                <Box className='flex flex-row items-center gap-1'>
                  <Icon icon="material-symbols:percent-rounded" width="20" color={theme.palette.primary.main} />
                </Box>
              </MenuItem>
              <MenuItem
                className='flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight'
                onClick={() => {
                  handleMenuItemClick(index, 3);
                  setDiscountMenu({ anchorEl: null, rowIndex: null });
                }}
                disabled={disabled}
              >
                <Typography variant="overline">Fixed Amount</Typography>
                <Box className='flex flex-row items-center gap-1'>
                  <Icon icon="lucide:saudi-riyal" width="20" color={theme.palette.primary.main} />
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        );
      }
    },
    {
      key: 'amount',
      label: <Typography variant="overline" fontWeight={500} >Total</Typography>,
      width: '16%',
      align: 'center',
      renderCell: (item, index) => {
        const watched = watchItems[index] || {};
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
              <Icon
                icon="lucide:saudi-riyal"
                color={theme.vars?.palette?.text?.secondary || theme.palette.text.secondary}
                width={14}
              />
              <Typography variant="h6" fontWeight={500} className="text-[0.85rem] whitespace-nowrap">
                {isNaN(Number(watched.amount)) ? '0.00' : Number(watched.amount).toFixed(2)}
              </Typography>
            </Box>

            <CustomOriginalIconButton
              onClick={(event) => handleTaxClick(event, index)}
              color="primary"
              size="small"
              disabled={disabled}
              sx={{
                borderRadius: 999,
                px: 0.75,
                py: 0.25,
              }}
            >
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
                  disabled={disabled}
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
      }
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
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === 'Tab' && !event.shiftKey && index === fields.length - 1) {
              event.preventDefault();
              handleAddEmptyRow();
            }
          }}
          tabIndex={0}
        >
          <Icon icon="ic:twotone-delete" width={20} color={theme.palette.error.main} />
        </IconButton>
      )
    },
  ];
};
