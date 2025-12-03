import React from 'react';
import { Controller } from 'react-hook-form';
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  IconButton,
  Box,
  Menu,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';

/**
 * Edit Invoice table column definitions
 */
export const getEditInvoiceColumns = ({
  control,
  errors,
  setValue,
  getValues,
  watchItems,
  productsCloneData,
  discountMenu,
  setDiscountMenu,
  taxMenu,
  taxRates,
  theme,
  updateCalculatedFields,
  handleUpdateItemProduct,
  handleDeleteItem,
  handleAddEmptyRow,
  handleMenuItemClick,
  handleTaxClick,
  handleTaxClose,
  handleTaxMenuItemClick,
  fields
}) => [
    {
      key: 'product',
      label: 'Product/Service',
      width: '24%',
      minWidth: '200px',
      align: 'center',
      renderCell: (item, index) => (
        <Controller
          name={`items.${index}.productId`}
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.items?.[index]?.productId}>
              <Select
                className={`py-0.5 min-h-[0] [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&.MuiOutlinedInput-input]:py-0.3 px-2.5`}
                size='small'
                sx={{ '& .MuiOutlinedInput-input': { py: 0.3, pl: 2.5 } }}
                {...field}
                displayEmpty
                value={field.value || ''}
                onChange={(e) => {
                  const productId = e.target.value;
                  const previousProductId = field.value;
                  handleUpdateItemProduct(index, productId, previousProductId);
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Select Product
                      </Typography>
                    );
                  }
                  return (
                    <Box className='flex flex-col gap-0' sx={{ overflow: 'hidden' }}>
                      <Typography variant="body1" color="text.primary" className='whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]'>
                        {watchItems[index].name}
                      </Typography>
                      <Typography variant="caption" fontSize={12} color='text.secondary'>
                        Unit: {watchItems[index].units}
                      </Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="" disabled>
                  Select Product
                </MenuItem>
                {productsCloneData.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      width: '12%',
      minWidth: '100px',
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
                className="[&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
                inputProps={{
                  min: 1,
                  step: 1,
                  onKeyDown: (e) => { if (e.key === '.') e.preventDefault(); }
                }}
                onChange={e => {
                  const raw = e.target.value;
                  const quantity = Math.max(0, Math.floor(Number(raw)));
                  setValue(`items.${index}.quantity`, quantity, { shouldValidate: true, shouldDirty: true });
                  setValue(`items.${index}.isRateFormUpadted`, true);
                  const item = getValues(`items.${index}`);
                  updateCalculatedFields(index, { ...item, quantity }, setValue);
                }}
                error={!!errors.items?.[index]?.quantity}
              />
            </FormControl>
          )}
        />
      )
    },
    {
      key: 'rate',
      label: 'Rate',
      width: '19%',
      minWidth: '120px',
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
                className="min-w-[80px] w-full [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
                InputProps={{
                  sx: { paddingLeft: '8px' },
                  startAdornment: (
                    <Icon icon="lucide:saudi-riyal" width={22} color={theme.palette.secondary.main} />
                  ),
                }}
                inputProps={{
                  sx: { paddingLeft: '4px' },
                  min: 0,
                  step: 1,
                  onKeyDown: (e) => { if (e.key === '.') e.preventDefault(); }
                }}
                onChange={e => {
                  const rate = Number(e.target.value);
                  setValue(`items.${index}.rate`, rate);
                  setValue(`items.${index}.form_updated_rate`, (Number(rate) / Number(watchItems[index].quantity)).toFixed(4))
                  setValue(`items.${index}.form_updated_discount`, Number(watchItems[index].discount))
                  setValue(`items.${index}.form_updated_discounttype`, Number(watchItems[index].discountType))
                  setValue(`items.${index}.isRateFormUpadted`, 'true')
                  const item = getValues(`items.${index}`);
                  updateCalculatedFields(index, item, setValue);
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
      label: 'Discount',
      width: '19%',
      minWidth: '160px',
      align: 'center',
      renderCell: (item, index) => {
        const watched = watchItems[index] || {};
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CustomIconButton
              variant="tonal"
              onClick={e => setDiscountMenu({ anchorEl: e.currentTarget, rowIndex: index })}
              color="primary"
              skin="lightest"
              size="small"
              className="min-w-[32px] min-h-[36px] px-2 py-0"
            >
              {Number(watched.discountType) === 2 ? (
                <Icon icon="lucide:percent" color={theme.palette.primary.light} width={19} />
              ) : Number(watched.discountType) === 3 ? (
                <Icon icon="lucide:saudi-riyal" color={theme.palette.primary.light} width={30} />
              ) : ''}
            </CustomIconButton>

            {Number(watched.discountType) === 2 ? (
              <Controller
                name={`items.${index}.form_updated_discount`}
                control={control}
                render={({ field }) => {
                  const handleChange = (e) => {
                    let value = Number(e.target.value);
                    value = Math.min(100, value);
                    field.onChange(value);
                    setValue(`items.${index}.isRateFormUpadted`, true);
                    const item = getValues(`items.${index}`);
                    updateCalculatedFields(index, item, setValue)
                  };
                  return (
                    <TextField
                      {...field}
                      value={field.value}
                      type="number"
                      variant="outlined"
                      size="small"
                      placeholder="Discount (%)"
                      aria-label="Discount Percentage"
                      tabIndex={0}
                      className="min-w-[90px] w-full [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
                      inputProps={{
                        min: 0,
                        max: 100,
                        step: 1,
                        sx: { paddingLeft: '8px' },
                      }}
                      InputProps={{
                        sx: { paddingRight: '8px' },
                        endAdornment: Number(watched.discount) > 0 ? (
                          <Box className='flex flex-row items-center gap-0'>
                            <Icon icon="lucide:saudi-riyal" width={14} color={theme.palette.secondary.main} />
                            <Typography variant="subtitle2" color="secondary.main">
                              {Number(watched.discount).toFixed(2)}
                            </Typography>
                          </Box>
                        ) : null
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
                  const handleChange = (e) => {
                    let value = Number(e.target.value);
                    field.onChange(value);
                    setValue(`items.${index}.form_updated_discount`, value);
                    setValue(`items.${index}.isRateFormUpadted`, true);
                    setValue(`items.${index}.discount`, value);
                    const item = getValues(`items.${index}`);
                    updateCalculatedFields(index, item, setValue);
                  };
                  return (
                    <TextField
                      {...field}
                      value={field.value}
                      type="number"
                      variant="outlined"
                      size="small"
                      placeholder="Discount"
                      aria-label="Discount Fixed Amount"
                      tabIndex={0}
                      className="min-w-[90px] w-full [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
                      inputProps={{
                        min: 0,
                        step: 1,
                        sx: { paddingLeft: '8px' },
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
      key: 'vat',
      label: 'VAT',
      width: '16%',
      minWidth: '120px',
      align: 'center',
      renderCell: (item, index) => {
        const watched = watchItems[index] || {};
        return (
          <Box className='flex flex-row items-center gap-2 h-[36px]'>
            <CustomIconButton
              variant="tonal"
              onClick={(e) => handleTaxClick(e, index)}
              color="primary"
              skin="lightest"
              size="small"
              className='flex flex-row items-center gap-0.5 px-1'
            >
              <Typography variant="button" fontSize={13} color="primary.light">
                {watched.taxInfo && typeof watched.taxInfo === 'object' ? (watched.taxInfo.taxRate || 0) : 0}%
              </Typography>
              <Icon icon="garden:chevron-down-fill-12" color={theme.palette.primary.light} width={11} />
            </CustomIconButton>
            <Box className='flex flex-row items-center gap-0.5'>
              <Icon icon="lucide:saudi-riyal" color={theme.palette.secondary.light} width={18} />
              <Typography variant='body1'>
                {isNaN(Number(watched.tax)) ? '0.00' : Number(watched.tax).toFixed(2)}
              </Typography>
            </Box>
            <Menu
              anchorEl={taxMenu.anchorEl}
              open={taxMenu.rowIndex === index && Boolean(taxMenu.anchorEl)}
              onClose={handleTaxClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {taxRates.map((tax) => (
                <MenuItem
                  key={tax._id}
                  onClick={() => handleTaxMenuItemClick(index, tax)}
                  sx={{
                    py: 1,
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  <Box className='flex flex-row items-center justify-between w-[8em]'>
                    <Typography variant="body2">{tax.name}</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        px: 1,
                        py: 0.5,
                        borderRadius: '4px'
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
      key: 'amount',
      label: 'Amount',
      width: '13%',
      minWidth: '100px',
      align: 'center',
      renderCell: (item, index) => {
        const watched = watchItems[index] || {};
        return (
          <Box className='flex flex-row items-center gap-0.5'>
            <Icon icon="lucide:saudi-riyal" color={theme.palette.secondary.light} width={18} />
            <Typography variant="body1" className='font-medium whitespace-nowrap'>
              {isNaN(Number(watched.amount)) ? '0.00' : Number(watched.amount).toFixed(2)}
            </Typography>
          </Box>
        );
      }
    },
    {
      key: 'actions',
      label: '',
      width: '4%',
      minWidth: '60px',
      align: 'center',
      renderCell: (item, index) => (
        <IconButton
          size="small"
          color="error"
          // className="bg-errorLighter rounded-full [&:hover]:bg-errorLighter"
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
      )
    },
  ];
