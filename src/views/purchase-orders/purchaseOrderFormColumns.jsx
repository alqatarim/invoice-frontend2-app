import { Controller } from 'react-hook-form';
import {
  Box,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomOriginalIconButton from '@core/components/mui/CustomOriginalIconButton';
import DocumentProductAutocompleteCell from '@/components/shared/DocumentProductAutocompleteCell';

const normalizeQuantityInput = value => {
  const parsed = Number(String(value ?? '').replace(/,/g, '.'));
  if (!Number.isFinite(parsed)) return 0;

  return Math.floor(Math.max(0, parsed));
};

const normalizeRateInput = value => {
  const parsed = Number(String(value ?? '').replace(/,/g, '.'));
  if (!Number.isFinite(parsed)) return 0;

  return Math.max(0, Number(parsed.toFixed(4)));
};

const normalizeDiscountInput = ({ value, isPercentage = false }) => {
  const normalized = String(value ?? '').replace(/,/g, '.').replace(/^0+(?=\d)/, '');
  const parsed = Number(normalized || 0);
  const amount = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;

  return isPercentage ? Math.min(100, amount) : amount;
};

const currencyIconColor = theme => theme.vars?.palette?.text?.secondary || theme.palette.text.secondary;

export const getPurchaseOrderFormColumns = ({
  theme,
  control,
  errors,
  fields,
  watchItems,
  productData,
  productsCloneData,
  taxRates,
  discountMenu,
  setDiscountMenu,
  taxMenu,
  setValue,
  getValues,
  updateCalculatedFields,
  handleUpdateItemProduct,
  handleDeleteItem,
  handleAddEmptyRow,
  handleMenuItemClick,
  handleTaxClick,
  handleTaxClose,
  handleTaxMenuItemClick,
  disabled = false,
}) => {
  const taxOptions = Array.isArray(taxRates) ? taxRates : [];
  const allProducts = Array.isArray(productData) ? productData : [];

  const resolveProductById = productId => {
    if (!productId) return null;
    return allProducts.find(product => product._id === productId) || null;
  };

  return [
    {
      key: 'product',
      label: <Typography variant="overline" fontWeight={500}>Product</Typography>,
      width: '28%',
      align: 'left',
      renderCell: (item, index) => (
        <DocumentProductAutocompleteCell
          control={control}
          errors={errors}
          index={index}
          productData={productData}
          products={productsCloneData}
          watchItems={watchItems}
          handleUpdateItemProduct={handleUpdateItemProduct}
          disabled={disabled}
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
      renderCell: (item, index) => (
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
                    step: 1,
                    onKeyDown: event => {
                      if (event.key === '.') {
                        event.preventDefault();
                      }
                    },
                  },
                }}
                onChange={event => {
                  const quantity = normalizeQuantityInput(event.target.value);
                  setValue(`items.${index}.quantity`, quantity, { shouldValidate: true, shouldDirty: true });
                  setValue(`items.${index}.isRateFormUpadted`, true);
                  const nextItem = { ...getValues(`items.${index}`), quantity };
                  updateCalculatedFields(index, nextItem, setValue);
                }}
                error={!!errors.items?.[index]?.quantity}
              />
            </FormControl>
          )}
        />
      ),
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
                onChange={event => {
                  const rate = normalizeRateInput(event.target.value);
                  setValue(`items.${index}.rate`, rate);
                  setValue(`items.${index}.form_updated_rate`, Number(rate || 0).toFixed(4));
                  setValue(`items.${index}.isRateFormUpadted`, 'true');
                  const nextItem = { ...getValues(`items.${index}`), rate };
                  updateCalculatedFields(index, nextItem, setValue);
                }}
                error={!!errors.items?.[index]?.rate}
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
      renderCell: (item, index) => {
        const watched = watchItems?.[index] || {};
        const isPercentage = Number(watched.discountType) === 2;

        return (
          <Box className="flex flex-row items-center justify-start gap-1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CustomOriginalIconButton
              onClick={event => setDiscountMenu({ anchorEl: event.currentTarget, rowIndex: index })}
              color="primary"
              size="small"
              disabled={disabled}
            >
              {isPercentage ? (
                <Icon icon="lucide:percent" color={theme.palette.primary.light} height={18} />
              ) : (
                <Icon icon="lucide:saudi-riyal" color={theme.palette.primary.light} height={16} />
              )}
            </CustomOriginalIconButton>

            {isPercentage ? (
              <Controller
                name={`items.${index}.form_updated_discount`}
                control={control}
                render={({ field }) => {
                  const handleChange = event => {
                    const value = normalizeDiscountInput({ value: event.target.value, isPercentage: true });
                    field.onChange(value);
                    setValue(`items.${index}.isRateFormUpadted`, true);
                    const nextItem = { ...getValues(`items.${index}`), form_updated_discount: value };
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
                      disabled={disabled}
                      aria-label="Discount Percentage"
                      tabIndex={0}
                      className="[&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
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
                  const handleChange = event => {
                    const value = normalizeDiscountInput({ value: event.target.value });
                    field.onChange(value);
                    setValue(`items.${index}.form_updated_discount`, value);
                    setValue(`items.${index}.isRateFormUpadted`, true);
                    setValue(`items.${index}.discount`, value);
                    const nextItem = {
                      ...getValues(`items.${index}`),
                      discount: value,
                      form_updated_discount: value,
                    };
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
                      className="[&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
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
                disabled={disabled}
                className="flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight"
              >
                <Typography variant="overline">Percentage</Typography>
                <Box className="flex flex-row items-center gap-1">
                  <Icon icon="material-symbols:percent-rounded" width="20" color={theme.palette.primary.main} />
                </Box>
              </MenuItem>
              <MenuItem
                className="flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight"
                onClick={() => {
                  handleMenuItemClick(index, 3);
                  setDiscountMenu({ anchorEl: null, rowIndex: null });
                }}
                disabled={disabled}
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
              <Icon icon="lucide:saudi-riyal" color={currencyIconColor(theme)} width={14} />
              <Typography variant="h6" fontWeight={500} className="text-[0.85rem] whitespace-nowrap">
                {isNaN(Number(watched.amount)) ? '0.00' : Number(watched.amount).toFixed(2)}
              </Typography>
            </Box>

            <CustomOriginalIconButton
              onClick={event => handleTaxClick(event, index)}
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
              {taxOptions.map(tax => (
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
          disabled={disabled}
          onKeyDown={event => {
            if (event.key === 'Tab' && !event.shiftKey && index === fields.length - 1) {
              event.preventDefault();
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
