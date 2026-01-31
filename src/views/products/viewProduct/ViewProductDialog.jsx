import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Button,
  Grid,
  Box,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Skeleton,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';
import { taxTypes, formIcons } from '@/data/dataSets';
import { getProductById } from '@/app/(dashboard)/products/actions';
import { parseProductDescription } from '@/utils/productMeta';
import CustomAvatar from '@core/components/mui/Avatar';

const ViewProductDialog = ({ open, productId, onClose, onEdit, onError, onSuccess, variant = 'dialog' }) => {
  const theme = useTheme();
  const isDialog = variant === 'dialog';
  const [product, setProduct] = useState(null);
  const [dropdownData, setDropdownData] = useState({ units: [], categories: [], taxes: [] });
  const [loading, setLoading] = useState(false);
  const parsedDescription = parseProductDescription(product?.productDescription || '');
  const productMeta = parsedDescription.meta || {};
  const productImage = Array.isArray(product?.images) ? product?.images[0] : product?.images;


  // Fetch product data when dialog opens
  useEffect(() => {
    const fetchProduct = async () => {
      if (open && productId) {
        setLoading(true);
        try {
          const [productData, dropdown] = await Promise.all([
            getProductById(productId),

          ]);
          setProduct(productData);

        } catch (error) {
          onError?.(error.message || 'Failed to fetch product data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [open, productId, onError]);

  const handleClose = () => {
    setProduct(null);
    onClose();
  };

  const handleEditProduct = () => {
    if (product?._id && onEdit) {
      onEdit(product._id);
    }
  };





  if (isDialog && !open) return null;

  const dialogBody = (
    <>
      <DialogTitle className='px-6 pb-4'>
        <div className="flex items-center gap-2">
          <div className='bg-primary/12 text-primary bg-primaryLight w-12 h-12 rounded-full flex items-center justify-center'>
            <Icon icon="mdi:eye-outline" fontSize={26} />
          </div>
          <Typography variant="h5" className="font-semibold text-primary">
            View Product
          </Typography>
        </div>
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-0' sx={{ p: 0 }}>
        {isDialog && (
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
        )}

        {loading ? (
          <Box className="p-6">
            {/* Image Skeleton */}
            <Box className="flex justify-center mb-6">
              <Skeleton
                variant="rectangular"
                sx={{
                  width: '200px',
                  height: '200px',
                  borderRadius: 2
                }}
              />
            </Box>

            {/* Form Skeleton */}
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardHeader
                    title={
                      <div className='flex items-center gap-3'>
                        <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                          <i className='ri-box-3-line' />
                        </CustomAvatar>
                        <div>
                          <Typography variant='h6' className='font-semibold'>
                            Product Details
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Overview of the product information
                          </Typography>
                        </div>
                      </div>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box className="flex flex-col items-center gap-2">
                          <Box
                            sx={{
                              width: '100%',
                              maxWidth: { xs: '280px', sm: '320px' },
                              height: '200px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: 'grey.50',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              overflow: 'hidden'
                            }}
                          >
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={product?.name || 'Product'}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  objectPosition: 'center'
                                }}
                              />
                            ) : (
                              <Box className="flex flex-col items-center gap-2">
                                <Icon icon="mdi:image-outline" width={36} color={theme.palette.text.secondary} />
                                <Typography variant="caption" color="text.secondary">
                                  No image uploaded
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                      {/* Product Name */}
                      <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Product Type */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Category */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Unit */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Purchase Price */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Selling Price */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Discount Value */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Discount Type */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Tax */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Alert Quantity */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* SKU */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>

                      {/* Barcode */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={56} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        ) : product ? (
          <Box className="p-6">
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Product Details
                    </Typography>
                    <Grid container spacing={3}>

                      {/* Product Name */}
                      <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Product Name"
                          value={product.name || ''}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (

                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={'mdi:alphabetical-variant'}
                                width={25}
                                color={theme.palette.secondary.light}
                              />

                            ),
                          }}
                          variant="outlined"
                        />
                      </Grid>

                      {/* Product Type */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="SKU"
                          value={product.sku || ''}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="outlined"
                        />
                      </Grid>

                      {/* Category */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Type"
                          value={product.type}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === product.type)?.icon || ''}
                                width={25}
                                color={theme.palette.secondary.light}
                              />
                            ),
                          }}
                          variant="outlined"
                        />
                      </Grid>

                      {/* Unit */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Category"
                          value={product.category.name || 'N/A'}
                          InputProps={{
                            readOnly: true,

                            startAdornment: (

                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'category')?.icon || ''}
                                width={25}
                                color={theme.palette.secondary.light} />

                            ),
                          }}
                          variant="outlined"
                        />
                      </Grid>

                      {/* Purchase Price */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Unit"
                          value={product.units.name || 'N/A'}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (

                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'unit')?.icon || ''}
                                width={25}
                                color={theme.palette.secondary.light} />

                            ),
                          }}
                          variant="outlined"
                        />
                      </Grid>

                      {/* Selling Price */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Selling Price"
                          value={product.sellingPrice || '0'}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (

                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'currency')?.icon || ''}
                                width={23}
                                color={theme.palette.secondary.light} />

                            ),
                          }}
                          variant="outlined"

                        />
                      </Grid>

                      {/* Discount Value */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Discount Value"
                          value={product.discountValue || '0'}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === product.discountType)?.icon || ''}
                                width={21}
                                color={theme.palette.secondary.light}
                              />
                            ),
                          }}
                          variant="outlined"
                        />
                      </Grid>

                      {/* Discount Type */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Discount Type"
                          value={product.discountType || 'None'}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === product.discountType)?.icon || ''}
                                width={21}
                                color={theme.palette.secondary.light}
                              />
                            ),
                          }}
                          variant="outlined"
                        />
                      </Grid>

                      {/* Tax */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Tax"
                          value={product.tax.name ? `${product.tax.name} (${product.tax.taxRate}%)` : 'N/A'}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'vat')?.icon || ''}
                                width={25}
                                color={theme.palette.secondary.light}
                              />
                            ),
                          }}
                          variant="outlined"
                        />
                      </Grid>

                      {/* Alert Quantity */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Alert Quantity"
                          value={product.alertQuantity || '0'}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'alertQuantity')?.icon || ''}
                                width={23}
                                color={theme.palette.secondary.light}
                              />
                            ),
                          }}
                          variant="outlined"
                          sx={product.alertQuantity <= 10 ? {
                            '& .MuiInputBase-input': {
                              color: 'error.main',
                            }
                          } : {}}
                        />
                      </Grid>

                      {/* SKU */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="SKU"
                          value={product.sku || ''}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="outlined"
                        />
                      </Grid>

                      {/* Barcode */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Barcode"
                          value={product.barcode || 'N/A'}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'barcode')?.icon || ''}
                                width={23}
                                color={theme.palette.secondary.light}
                              />
                            ),
                          }}
                          variant="outlined"
                        />
                      </Grid>




                      {/* Description */}
                      {parsedDescription.description && (
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Description"
                            value={parsedDescription.description}
                            InputProps={{
                              readOnly: true,
                            }}
                            variant="outlined"
                            multiline
                            rows={3}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardHeader
                    title={
                      <div className='flex items-center gap-3'>
                        <CustomAvatar variant='rounded' skin='light' color='info' size={40}>
                          <i className='ri-settings-3-line' />
                        </CustomAvatar>
                        <div>
                          <Typography variant='h6' className='font-semibold'>
                            Advanced Configuration
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Variants, packaging, pricing, and tracking options
                          </Typography>
                        </div>
                      </div>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      {/* Shelf Life */}
                      {productMeta.batchInfo?.shelfLifeDays !== undefined && (
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:calendar-clock-outline" width={18} color={theme.palette.primary.main} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              Shelf Life
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Chip label={`Shelf Life: ${productMeta.batchInfo.shelfLifeDays} days`} />
                          </Box>
                        </Grid>
                      )}

                      {/* Variants */}
                      {Array.isArray(productMeta.variants) && productMeta.variants.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:layers-outline" width={18} color={theme.palette.info.main} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              Variants
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {productMeta.variants.map((variant) => (
                              <Box
                                key={variant.id || variant.name}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 1.5,
                                }}
                              >
                                <Box>
                                  <Typography fontWeight={600}>{variant.name || 'Variant'}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {variant.sku ? `SKU: ${variant.sku}` : 'No SKU'} ·{' '}
                                    {variant.sellingPrice ? `Price: ${variant.sellingPrice}` : 'No price'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {variant.attributes?.size && <Chip label={`Size: ${variant.attributes.size}`} />}
                                  {variant.attributes?.color && <Chip label={`Color: ${variant.attributes.color}`} />}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Grid>
                      )}

                      {/* Packaging Units */}
                      {Array.isArray(productMeta.packagingUnits) && productMeta.packagingUnits.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:package-variant" width={18} color={theme.palette.success.main} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              Packaging Units
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {productMeta.packagingUnits.map((unit) => (
                              <Chip
                                key={unit.id || unit.unitId}
                                label={`${unit.unitName || 'Unit'}${unit.conversionFactor ? ` · ${unit.conversionFactor}` : ''}`}
                              />
                            ))}
                          </Box>
                        </Grid>
                      )}

                      {/* Price Tiers */}
                      {Array.isArray(productMeta.priceTiers) && productMeta.priceTiers.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:tag-multiple-outline" width={18} color={theme.palette.warning.main} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              Price Tiers
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {productMeta.priceTiers.map((tier) => (
                              <Box key={tier.id || tier.name} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Chip label={tier.name || 'Tier'} />
                                {tier.minQty !== undefined && <Typography variant="caption">Min Qty: {tier.minQty}</Typography>}
                                {tier.sellingPrice !== undefined && (
                                  <Typography variant="caption">Price: {tier.sellingPrice}</Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Grid>
                      )}

                      {/* Promotions */}
                      {Array.isArray(productMeta.promotions) && productMeta.promotions.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:ticket-percent-outline" width={18} color={theme.palette.secondary.main} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              Promotions
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {productMeta.promotions.map((promo) => (
                              <Box key={promo.id || promo.name} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Chip label={promo.name || 'Promotion'} />
                                <Typography variant="caption">
                                  {promo.discountType} {promo.discountValue || 0}
                                </Typography>
                                {(promo.startDate || promo.endDate) && (
                                  <Typography variant="caption">
                                    {promo.startDate || 'Start'} → {promo.endDate || 'End'}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Grid>
                      )}

                      {/* Serial / IMEI */}
                      {(productMeta.serialTracking?.enabled ||
                        (Array.isArray(productMeta.serialTracking?.serialNumbers) &&
                          productMeta.serialTracking.serialNumbers.length > 0) ||
                        (Array.isArray(productMeta.serialTracking?.imeiNumbers) &&
                          productMeta.serialTracking.imeiNumbers.length > 0)) && (
                          <Grid size={{ xs: 12 }}>
                            <Box className="flex items-center gap-2">
                              <Icon icon="mdi:shield-key-outline" width={18} color={theme.palette.error.main} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Serial / IMEI Tracking
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {Array.isArray(productMeta.serialTracking?.serialNumbers) &&
                                productMeta.serialTracking.serialNumbers.length > 0 && (
                                  <Typography variant="caption">
                                    Serial Numbers: {productMeta.serialTracking.serialNumbers.join(', ')}
                                  </Typography>
                                )}
                              {Array.isArray(productMeta.serialTracking?.imeiNumbers) &&
                                productMeta.serialTracking.imeiNumbers.length > 0 && (
                                  <Typography variant="caption">
                                    IMEI Numbers: {productMeta.serialTracking.imeiNumbers.join(', ')}
                                  </Typography>
                                )}
                            </Box>
                          </Grid>
                        )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Product not found</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16'>
        <Button color='secondary' variant='outlined' onClick={handleClose}>
          {isDialog ? 'Close' : 'Back'}
        </Button>
        {product && onEdit && (
          <Button variant='contained' onClick={handleEditProduct}>
            Edit Product
          </Button>
        )}
      </DialogActions>
    </>
  );

  return isDialog ? (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={{
        sx: {
          mt: { xs: 4, sm: 6 },
          width: '100%',
          minWidth: { xs: '90vw', sm: '600px', md: '800px' },
          minHeight: { xs: '70vh', sm: '600px' }
        }
      }}
    >
      {dialogBody}
    </Dialog>
  ) : (
    <Box className="flex flex-col gap-4">
      {dialogBody}
    </Box>
  );
};

export default ViewProductDialog;