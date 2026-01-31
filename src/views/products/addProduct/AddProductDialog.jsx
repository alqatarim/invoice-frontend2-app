import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormHelperText,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Switch,
  Box,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Skeleton,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import IconButton from '@core/components/mui/CustomOriginalIconButton';
import CustomAvatar from '@core/components/mui/Avatar';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getDropdownData } from '@/app/(dashboard)/products/actions';
import { formIcons, taxTypes } from '@/data/dataSets';
import { useAddProductHandlers } from '@/handlers/products/addProduct';
import { getNameFromPath } from '@/utils/fileUtils';
import { buildProductDescription } from '@/utils/productMeta';

const AddProductDialog = ({ open, onClose, onSave, variant = 'dialog' }) => {
  const theme = useTheme();
  const isDialog = variant === 'dialog';
  const [dropdownData, setDropdownData] = useState({ units: [], categories: [], taxes: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createLocalId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const toNumberValue = (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };
  const splitLines = (text) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  const [batchInfo, setBatchInfo] = useState({
    shelfLifeDays: '',
  });
  const [variants, setVariants] = useState([]);
  const [variantDraft, setVariantDraft] = useState({
    id: '',
    name: '',
    size: '',
    color: '',
    sku: '',
    barcode: '',
    sellingPrice: '',
    purchasePrice: '',
    stock: '',
  });
  const [editingVariantId, setEditingVariantId] = useState(null);

  const [packagingUnitIds, setPackagingUnitIds] = useState([]);

  const [priceTiers, setPriceTiers] = useState([]);
  const [priceTierDraft, setPriceTierDraft] = useState({
    id: '',
    name: '',
    minQty: '',
    sellingPrice: '',
  });
  const [editingPriceTierId, setEditingPriceTierId] = useState(null);

  const [promotions, setPromotions] = useState([]);
  const [promotionDraft, setPromotionDraft] = useState({
    id: '',
    name: '',
    discountType: 'Percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
  });
  const [editingPromotionId, setEditingPromotionId] = useState(null);

  const [serialTracking, setSerialTracking] = useState({
    enabled: false,
    serialNumbers: [],
    imeiNumbers: [],
  });
  const [serialsInput, setSerialsInput] = useState('');
  const [imeiInput, setImeiInput] = useState('');

  const resetAdvancedFields = () => {
    setBatchInfo({ shelfLifeDays: '' });
    setVariants([]);
    setVariantDraft({
      id: '',
      name: '',
      size: '',
      color: '',
      sku: '',
      barcode: '',
      sellingPrice: '',
      purchasePrice: '',
      stock: '',
    });
    setEditingVariantId(null);
    setPackagingUnitIds([]);
    setPriceTiers([]);
    setPriceTierDraft({ id: '', name: '', minQty: '', sellingPrice: '' });
    setEditingPriceTierId(null);
    setPromotions([]);
    setPromotionDraft({
      id: '',
      name: '',
      discountType: 'Percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
    });
    setEditingPromotionId(null);
    setSerialTracking({ enabled: false, serialNumbers: [], imeiNumbers: [] });
    setSerialsInput('');
    setImeiInput('');
  };

  const buildProductMeta = () => {
    const meta = {};

    if (batchInfo.shelfLifeDays) {
      meta.batchInfo = {
        shelfLifeDays: toNumberValue(batchInfo.shelfLifeDays),
      };
    }

    if (variants.length > 0) {
      meta.variants = variants.map((variant) => {
        const fallbackName = [variant.size, variant.color].filter(Boolean).join(' / ');
        const name = variant.name?.trim() || fallbackName || 'Variant';
        return {
          id: variant.id,
          name,
          sku: variant.sku?.trim() || undefined,
          barcode: variant.barcode?.trim() || undefined,
          sellingPrice: toNumberValue(variant.sellingPrice),
          purchasePrice: toNumberValue(variant.purchasePrice),
          stock: toNumberValue(variant.stock),
          attributes: {
            size: variant.size?.trim() || undefined,
            color: variant.color?.trim() || undefined,
          },
        };
      });
    }

    if (packagingUnitIds.length > 0) {
      meta.packagingUnits = packagingUnitIds
        .map((unitId) => {
          const unit = dropdownData.units?.find((item) => item._id === unitId);
          if (!unit) return null;
          return {
            id: createLocalId(),
            unitId: unit._id,
            unitName: unit.name,
            unitSymbol: unit.symbol,
            conversionFactor: unit.conversionFactor,
            baseUnitName: unit.baseUnit?.name || undefined,
          };
        })
        .filter(Boolean);
    }

    if (priceTiers.length > 0) {
      meta.priceTiers = priceTiers.map((tier) => ({
        id: tier.id,
        name: tier.name?.trim() || 'Tier',
        minQty: toNumberValue(tier.minQty),
        sellingPrice: toNumberValue(tier.sellingPrice),
      }));
    }

    if (promotions.length > 0) {
      meta.promotions = promotions.map((promo) => ({
        id: promo.id,
        name: promo.name?.trim() || undefined,
        discountType: promo.discountType || 'Percentage',
        discountValue: toNumberValue(promo.discountValue),
        startDate: promo.startDate || undefined,
        endDate: promo.endDate || undefined,
      }));
    }

    if (
      serialTracking.enabled ||
      serialTracking.serialNumbers.length > 0 ||
      serialTracking.imeiNumbers.length > 0
    ) {
      meta.serialTracking = {
        enabled: serialTracking.enabled,
        serialNumbers: serialTracking.serialNumbers,
        imeiNumbers: serialTracking.imeiNumbers,
      };
    }

    return meta;
  };

  const handleSerialsInputChange = (value) => {
    setSerialsInput(value);
    setSerialTracking((prev) => ({
      ...prev,
      serialNumbers: splitLines(value),
    }));
  };

  const handleImeiInputChange = (value) => {
    setImeiInput(value);
    setSerialTracking((prev) => ({
      ...prev,
      imeiNumbers: splitLines(value),
    }));
  };

  const handleSaveVariant = () => {
    const payload = {
      ...variantDraft,
      id: editingVariantId || createLocalId(),
    };

    const variantName =
      payload.name?.trim() || [payload.size, payload.color].filter(Boolean).join(' / ') || 'Variant';

    const nextVariant = { ...payload, name: variantName };

    setVariants((prev) =>
      editingVariantId ? prev.map((item) => (item.id === editingVariantId ? nextVariant : item)) : [...prev, nextVariant]
    );
    setVariantDraft({
      id: '',
      name: '',
      size: '',
      color: '',
      sku: '',
      barcode: '',
      sellingPrice: '',
      purchasePrice: '',
      stock: '',
    });
    setEditingVariantId(null);
  };

  const handleEditVariant = (variant) => {
    setVariantDraft(variant);
    setEditingVariantId(variant.id);
  };

  const handleRemoveVariant = (variantId) => {
    setVariants((prev) => prev.filter((item) => item.id !== variantId));
  };

  const handleSavePriceTier = () => {
    const payload = {
      ...priceTierDraft,
      id: editingPriceTierId || createLocalId(),
      name: priceTierDraft.name?.trim() || 'Tier',
    };

    setPriceTiers((prev) =>
      editingPriceTierId ? prev.map((item) => (item.id === editingPriceTierId ? payload : item)) : [...prev, payload]
    );
    setPriceTierDraft({ id: '', name: '', minQty: '', sellingPrice: '' });
    setEditingPriceTierId(null);
  };

  const handleEditPriceTier = (tier) => {
    setPriceTierDraft(tier);
    setEditingPriceTierId(tier.id);
  };

  const handleRemovePriceTier = (tierId) => {
    setPriceTiers((prev) => prev.filter((item) => item.id !== tierId));
  };

  const handleSavePromotion = () => {
    const payload = {
      ...promotionDraft,
      id: editingPromotionId || createLocalId(),
      name: promotionDraft.name?.trim() || 'Promotion',
    };

    setPromotions((prev) =>
      editingPromotionId ? prev.map((item) => (item.id === editingPromotionId ? payload : item)) : [...prev, payload]
    );
    setPromotionDraft({
      id: '',
      name: '',
      discountType: 'Percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
    });
    setEditingPromotionId(null);
  };

  const handleEditPromotion = (promotion) => {
    setPromotionDraft(promotion);
    setEditingPromotionId(promotion.id);
  };

  const handleRemovePromotion = (promotionId) => {
    setPromotions((prev) => prev.filter((item) => item.id !== promotionId));
  };

  const handlePackagingUnitChange = (event) => {
    const { value } = event.target;
    setPackagingUnitIds(typeof value === 'string' ? value.split(',') : value);
  };

  const {
    control,
    handleSubmit,
    watch,
    errors,
    productTypes,
    discountTypes,
    isSubmitting,
    handleFormSubmit,
    reset,
    imagePreview,
    selectedFile,
    imageError,
    handleImageChange,
    handleImageError,
    handleImageDelete,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useAddProductHandlers({
    dropdownData,
    onSave: async (data, preparedImage) => {
      const metaPayload = buildProductMeta();
      const combinedDescription = buildProductDescription(data.productDescription || '', metaPayload);
      const result = await onSave({ ...data, productDescription: combinedDescription }, preparedImage);
      if (result.success) {
        reset();
        resetAdvancedFields();
        onClose();
      }
      return result;
    },
  });

  const watchDiscountType = watch('discountType');
  const watchType = watch('type');

  // Fetch dropdown data when dialog opens
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (open) {
        setLoading(true);
        try {
          const response = await getDropdownData();
          if (response.success) {
            setDropdownData(response.data || { units: [], categories: [], taxes: [] });
          } else {
            setDropdownData({ units: [], categories: [], taxes: [] });
          }
        } catch (error) {
          console.error('Failed to fetch dropdown data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDropdownData();
  }, [open]);

  const handleClose = () => {
    reset();
    setDropdownData({ units: [], categories: [], taxes: [] });
    setError(null);
    resetAdvancedFields();
    onClose();
  };

  if (isDialog && !open) return null;

  const dialogBody = (
    <>
      <DialogTitle className='px-6 pb-4'>
        <div className="flex items-center gap-2">
          <div className='bg-primary/12 text-primary bg-primaryLight w-12 h-12 rounded-full flex items-center justify-center'>
            <Icon icon="mdi:package-variant-closed" fontSize={26} />
          </div>
          <Typography variant="h5" className="font-semibold text-primary">
            Add Product
          </Typography>
        </div>
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-3 pli-0' sx={{ p: 0 }}>
        {isDialog && (
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
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
          </Box>
        ) : (
          <Box className="p-6">
            {/* Image Upload - Top Center */}
            <Box className="flex justify-center mb-6">
              <Controller
                name="images"
                control={control}
                render={({ field: { onChange } }) => (
                  <Box className="flex flex-col items-center gap-2">
                    {imagePreview ? (
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'inline-block',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.paper',
                          width: { xs: '280px', sm: '320px', md: '350px' },
                          height: '200px'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'grey.50',
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <img
                            src={imagePreview}
                            alt="Product Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center',
                              borderRadius: 'inherit',
                              display: 'block'
                            }}
                            onError={handleImageError}
                          />

                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 8,
                              left: 8,
                              right: 8,
                              display: 'flex',
                              justifyContent: 'center'
                            }}
                          >
                            <Chip
                              label={getNameFromPath(imagePreview, selectedFile)}
                              size="small"
                              color="info"
                              variant="filled"
                            />
                          </Box>

                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              display: 'flex',
                              gap: 1,
                              opacity: 1
                            }}
                          >
                            <IconButton
                              variant="contained"
                              size="small"
                              color="primary"
                              disabled={isSubmitting}
                              onClick={() => {
                                const fileInput = document.querySelector('#replace-image-input');
                                if (fileInput) {
                                  fileInput.click();
                                }
                              }}
                            >
                              <Icon icon="mdi:cloud-upload-outline" />
                              <input
                                id="replace-image-input"
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                  handleImageChange(e);
                                  const file = e.target.files[0];
                                  if (file) {
                                    onChange(file);
                                  }
                                }}
                              />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={handleImageDelete}
                              disabled={isSubmitting}
                              color="error"
                              variant="contained"
                            >
                              <Icon icon="mdi:delete-outline" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        component="label"
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          handleDrop(e);
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        sx={{
                          width: { xs: '200px', sm: '220px', md: '240px' },
                          height: '200px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          border: '2px dashed',
                          borderColor: isDragging ? 'primary.main' : 'secondary.light',
                          borderRadius: 2,
                          backgroundColor: isDragging ? 'primary.lighter' : '',
                          transition: 'all 0.2s ease-in-out',
                          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: theme.palette.primary.lightOpacity,
                            transform: 'scale(1.04)'
                          }
                        }}
                      >
                        <Icon
                          icon={isDragging ? "mdi:download" : "mdi:cloud-upload-outline"}
                          width={48}
                          color={isDragging ? theme.palette.primary.main : theme.palette.text.secondary}
                          style={{ marginBottom: 12, pointerEvents: 'none' }}
                        />
                        <Typography
                          variant="body2"
                          color={isDragging ? "primary" : "text.primary"}
                          fontWeight={500}
                          sx={{ pointerEvents: 'none' }}
                        >
                          {isDragging ? "Drop image here" : "Click or drag to Upload Image"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          className="text-center mt-1"
                          sx={{ pointerEvents: 'none' }}
                        >
                          PNG, JPG up to 5MB
                        </Typography>
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            handleImageChange(e);
                            const file = e.target.files[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                        />
                      </Box>
                    )}

                    {imageError && (
                      <Typography variant="caption" color="error" className='block text-center'>
                        <Icon icon="mdi:alert-circle" width={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {imageError}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>

            <form onSubmit={handleSubmit(handleFormSubmit)} id="add-product-form">
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
                              Define the core product information
                            </Typography>
                          </div>
                        </div>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>

                        {/* Product Name */}
                        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                          <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Product Name"
                                placeholder="Enter product name"
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                disabled={isSubmitting}
                                required
                                InputProps={{
                                  startAdornment: (


                                    <Icon
                                      style={{ marginRight: '5px' }}
                                      icon={'mdi:alphabetical-variant'}
                                      width={23}
                                      color={theme.palette.secondary.light}
                                    />
                                  ),

                                }}
                                variant="outlined"
                              />
                            )}
                          />
                        </Grid>

                        {/* Product Type */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth error={!!errors.type}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                  {...field}
                                  label="Type"
                                  disabled={isSubmitting}
                                  startAdornment={
                                    watchType && formIcons.find(icon => icon.value === watchType)?.icon && (
                                      <Icon
                                        style={{ marginRight: '5px' }}
                                        icon={formIcons.find(icon => icon.value === watchType)?.icon}
                                        width={25}
                                        color={theme.palette.secondary.light}
                                      />
                                    )
                                  }
                                >
                                  {productTypes.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                      {type.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                              </FormControl>
                            )}
                          />
                        </Grid>

                        {/* Category */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth error={!!errors.category} required>
                                <InputLabel>Category</InputLabel>
                                <Select {...field} label="Category" disabled={isSubmitting || loading}
                                  startAdornment={

                                    <Icon
                                      style={{ marginRight: '5px' }}
                                      icon={formIcons.find(icon => icon.value === 'category')?.icon || 'mdi:ruler'}
                                      width={23}
                                      color={theme.palette.secondary.light}
                                    />

                                  }

                                >
                                  {dropdownData.categories && Array.isArray(dropdownData.categories) && dropdownData.categories.length > 0 ? (
                                    dropdownData.categories.map((category) => (
                                      <MenuItem key={category._id} value={category._id}>
                                        {category.name}
                                      </MenuItem>
                                    ))
                                  ) : (
                                    <MenuItem disabled>No categories available</MenuItem>
                                  )}
                                </Select>
                                {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                              </FormControl>
                            )}
                          />
                        </Grid>

                        {/* Unit */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="units"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth error={!!errors.units} required>
                                <InputLabel>Unit</InputLabel>
                                <Select
                                  {...field}
                                  label="Unit"
                                  disabled={isSubmitting || loading}
                                  startAdornment={

                                    <Icon
                                      style={{ marginRight: '5px' }}
                                      icon={formIcons.find(icon => icon.value === 'unit')?.icon || 'mdi:ruler'}
                                      width={25}
                                      color={theme.palette.secondary.light}
                                    />

                                  }
                                >
                                  {dropdownData.units && Array.isArray(dropdownData.units) && dropdownData.units.length > 0 ? (
                                    dropdownData.units.map((unit) => (
                                      <MenuItem key={unit._id} value={unit._id}>
                                        {unit.name}
                                      </MenuItem>
                                    ))
                                  ) : (
                                    <MenuItem disabled>No units available</MenuItem>
                                  )}
                                </Select>
                                {errors.units && <FormHelperText>{errors.units.message}</FormHelperText>}
                              </FormControl>
                            )}
                          />
                        </Grid>

                        {/* Purchase Price */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="purchasePrice"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                type="number"
                                label="Purchase Price"
                                placeholder="0.00"
                                error={!!errors.purchasePrice}
                                helperText={errors.purchasePrice?.message}
                                disabled={isSubmitting}
                                required
                                InputProps={{
                                  startAdornment: (

                                    <Icon
                                      style={{ marginRight: '5px' }}
                                      icon={formIcons.find(icon => icon.value === 'currency')?.icon || 'lucide:saudi-riyal'}
                                      width={21}
                                      color={theme.palette.secondary.light}
                                    />

                                  ),
                                }}
                                variant="outlined"
                              />
                            )}
                          />
                        </Grid>

                        {/* Selling Price */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="sellingPrice"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                type="number"
                                label="Selling Price"
                                placeholder="0.00"
                                error={!!errors.sellingPrice}
                                helperText={errors.sellingPrice?.message}
                                disabled={isSubmitting}
                                required
                                InputProps={{
                                  startAdornment: (

                                    <Icon
                                      style={{ marginRight: '5px' }}
                                      icon={formIcons.find(icon => icon.value === 'currency')?.icon || 'lucide:saudi-riyal'}
                                      width={21}
                                      color={theme.palette.secondary.light}
                                    />

                                  ),
                                }}
                                variant="outlined"
                              />
                            )}
                          />
                        </Grid>

                        {/* Discount Value */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="discountValue"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                type="number"
                                label="Discount Value"
                                placeholder="0"
                                defaultValue={0}
                                error={!!errors.discountValue}
                                helperText={errors.discountValue?.message}
                                disabled={isSubmitting}
                                InputProps={{
                                  startAdornment: (


                                    <Icon
                                      style={{ marginRight: '5px' }}
                                      icon={formIcons.find(icon => icon.value === watchDiscountType)?.icon || ''}
                                      width={21}
                                      color={theme.palette.secondary.light}
                                    />
                                  )



                                }}
                                variant="outlined"
                              />
                            )}
                          />
                        </Grid>

                        {/* Discount Type */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="discountType"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth>
                                <InputLabel>Discount Type</InputLabel>
                                <Select {...field} label="Discount Type" disabled={isSubmitting}>
                                  {discountTypes.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                        <Icon
                                          style={{ marginRight: '5px' }}
                                          icon={formIcons.find(icon => icon.value === type.value)?.icon || ''}
                                          width={21}
                                          color={theme.palette.secondary.light}
                                        />
                                        {type.label}
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          />
                        </Grid>

                        {/* Tax */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="tax"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth error={!!errors.tax}>
                                <InputLabel>Tax</InputLabel>
                                <Select {...field} label="Tax" disabled={isSubmitting || loading}

                                  startAdornment={

                                    <Icon
                                      style={{ marginRight: '5px' }}
                                      icon={formIcons.find(icon => icon.value === 'vat')?.icon || ''}
                                      width={25}
                                      color={theme.palette.secondary.light}
                                    />

                                  }
                                >

                                  {dropdownData.taxes && Array.isArray(dropdownData.taxes) && dropdownData.taxes.length > 0 ? (
                                    dropdownData.taxes.map((tax) => (


                                      <MenuItem key={tax._id} value={tax._id}>


                                        {tax.name} ({tax.taxRate}%)

                                      </MenuItem>

                                    ))
                                  ) : null}

                                </Select>

                                {errors.tax && <FormHelperText>{errors.tax.message}</FormHelperText>}
                              </FormControl>
                            )}
                          />
                        </Grid>

                        {/* Alert Quantity */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="alertQuantity"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                type="number"
                                label="Alert Quantity"
                                placeholder="0"
                                error={!!errors.alertQuantity}
                                helperText={errors.alertQuantity?.message}
                                disabled={isSubmitting}
                                InputProps={{
                                  startAdornment: (


                                    <Icon
                                      style={{ marginRight: '5px' }}
                                      icon={formIcons.find(icon => icon.value === 'alertQuantity')?.icon || 'mdi:alert-circle-outline'}
                                      width={23}
                                      color={theme.palette.secondary.light}
                                    />
                                  ),
                                }}
                                variant="outlined"
                                sx={field.value <= 10 ? {
                                  '& .MuiInputBase-input': {
                                    color: 'error.main',
                                  }
                                } : {}}
                              />
                            )}
                          />
                        </Grid>

                        {/* SKU */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="sku"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="SKU"
                                placeholder="Enter SKU"
                                error={!!errors.sku}
                                helperText={errors.sku?.message}
                                disabled={isSubmitting}
                                variant="outlined"
                              />
                            )}
                          />
                        </Grid>

                        {/* Barcode */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="barcode"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Barcode"
                                placeholder="Enter barcode"
                                error={!!errors.barcode}
                                helperText={errors.barcode?.message}
                                disabled={isSubmitting}
                                InputProps={{
                                  startAdornment: (


                                    <Icon
                                      style={{ marginRight: '5px' }}
                                      icon={formIcons.find(icon => icon.value === 'barcode')?.icon || 'mdi:barcode'}
                                      width={23}
                                      color={theme.palette.secondary.light}
                                    />

                                  ),
                                }}
                                variant="outlined"
                              />
                            )}
                          />
                        </Grid>
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
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:calendar-clock-outline" width={18} color={theme.palette.primary.main} />
                            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                              Shelf Life
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Shelf Life (days)"
                            type="number"
                            placeholder="0"
                            value={batchInfo.shelfLifeDays}
                            onChange={(event) => setBatchInfo((prev) => ({ ...prev, shelfLifeDays: event.target.value }))}
                            disabled={isSubmitting}
                          />
                        </Grid>

                        {/* Variants */}
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:layers-outline" width={18} color={theme.palette.info.main} />
                            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                              Variants
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Variant Name"
                                placeholder="Size / Color"
                                value={variantDraft.name}
                                onChange={(event) => setVariantDraft((prev) => ({ ...prev, name: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Size"
                                placeholder="Large"
                                value={variantDraft.size}
                                onChange={(event) => setVariantDraft((prev) => ({ ...prev, size: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Color"
                                placeholder="Red"
                                value={variantDraft.color}
                                onChange={(event) => setVariantDraft((prev) => ({ ...prev, color: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="SKU"
                                placeholder="Variant SKU"
                                value={variantDraft.sku}
                                onChange={(event) => setVariantDraft((prev) => ({ ...prev, sku: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Barcode"
                                placeholder="Variant barcode"
                                value={variantDraft.barcode}
                                onChange={(event) => setVariantDraft((prev) => ({ ...prev, barcode: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Selling Price"
                                type="number"
                                placeholder="0.00"
                                value={variantDraft.sellingPrice}
                                onChange={(event) => setVariantDraft((prev) => ({ ...prev, sellingPrice: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Purchase Price"
                                type="number"
                                placeholder="0.00"
                                value={variantDraft.purchasePrice}
                                onChange={(event) => setVariantDraft((prev) => ({ ...prev, purchasePrice: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Stock"
                                type="number"
                                placeholder="0"
                                value={variantDraft.stock}
                                onChange={(event) => setVariantDraft((prev) => ({ ...prev, stock: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                  variant="outlined"
                                  onClick={handleSaveVariant}
                                  disabled={isSubmitting}
                                >
                                  {editingVariantId ? 'Update Variant' : 'Add Variant'}
                                </Button>
                                {editingVariantId && (
                                  <Button
                                    variant="text"
                                    onClick={() => {
                                      setVariantDraft({
                                        id: '',
                                        name: '',
                                        size: '',
                                        color: '',
                                        sku: '',
                                        barcode: '',
                                        sellingPrice: '',
                                        purchasePrice: '',
                                        stock: '',
                                      });
                                      setEditingVariantId(null);
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              {variants.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  No variants added yet.
                                </Typography>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {variants.map((variant) => (
                                    <Box
                                      key={variant.id}
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
                                          {variant.sku ? `SKU: ${variant.sku}` : 'No SKU'} · {variant.sellingPrice ? `Price: ${variant.sellingPrice}` : 'No price'}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="small" onClick={() => handleEditVariant(variant)} disabled={isSubmitting}>
                                          Edit
                                        </Button>
                                        <Button
                                          size="small"
                                          color="error"
                                          onClick={() => handleRemoveVariant(variant.id)}
                                          disabled={isSubmitting}
                                        >
                                          Delete
                                        </Button>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>

                        {/* Packaging Units */}
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:package-variant" width={18} color={theme.palette.success.main} />
                            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                              Packaging & Unit Conversions
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <FormControl fullWidth>
                            <InputLabel>Packaging Units</InputLabel>
                            <Select
                              multiple
                              value={packagingUnitIds}
                              onChange={handlePackagingUnitChange}
                              label="Packaging Units"
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((unitId) => {
                                    const unit = dropdownData.units?.find((item) => item._id === unitId);
                                    const conversion = unit?.conversionFactor ? `· ${unit.conversionFactor}` : '';
                                    return <Chip key={unitId} label={`${unit?.name || unitId} ${conversion}`} />;
                                  })}
                                </Box>
                              )}
                              disabled={isSubmitting}
                            >
                              {dropdownData.units?.map((unit) => (
                                <MenuItem key={unit._id} value={unit._id}>
                                  {unit.name} ({unit.symbol})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Price Tiers */}
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:tag-multiple-outline" width={18} color={theme.palette.warning.main} />
                            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                              Price Tiers
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Tier Name"
                                placeholder="Retail / Wholesale"
                                value={priceTierDraft.name}
                                onChange={(event) => setPriceTierDraft((prev) => ({ ...prev, name: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Minimum Quantity"
                                type="number"
                                placeholder="0"
                                value={priceTierDraft.minQty}
                                onChange={(event) => setPriceTierDraft((prev) => ({ ...prev, minQty: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Selling Price"
                                type="number"
                                placeholder="0.00"
                                value={priceTierDraft.sellingPrice}
                                onChange={(event) => setPriceTierDraft((prev) => ({ ...prev, sellingPrice: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" onClick={handleSavePriceTier} disabled={isSubmitting}>
                                  {editingPriceTierId ? 'Update Tier' : 'Add Tier'}
                                </Button>
                                {editingPriceTierId && (
                                  <Button
                                    variant="text"
                                    onClick={() => {
                                      setPriceTierDraft({ id: '', name: '', minQty: '', sellingPrice: '' });
                                      setEditingPriceTierId(null);
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              {priceTiers.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  No price tiers added yet.
                                </Typography>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {priceTiers.map((tier) => (
                                    <Box
                                      key={tier.id}
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
                                        <Typography fontWeight={600}>{tier.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {tier.minQty ? `Min Qty: ${tier.minQty}` : 'No minimum'} · {tier.sellingPrice ? `Price: ${tier.sellingPrice}` : 'No price'}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="small" onClick={() => handleEditPriceTier(tier)} disabled={isSubmitting}>
                                          Edit
                                        </Button>
                                        <Button
                                          size="small"
                                          color="error"
                                          onClick={() => handleRemovePriceTier(tier.id)}
                                          disabled={isSubmitting}
                                        >
                                          Delete
                                        </Button>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>

                        {/* Promotions */}
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:ticket-percent-outline" width={18} color={theme.palette.secondary.main} />
                            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                              Promotions
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Promotion Name"
                                placeholder="Ramadan Offer"
                                value={promotionDraft.name}
                                onChange={(event) => setPromotionDraft((prev) => ({ ...prev, name: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <FormControl fullWidth>
                                <InputLabel>Discount Type</InputLabel>
                                <Select
                                  value={promotionDraft.discountType}
                                  label="Discount Type"
                                  onChange={(event) =>
                                    setPromotionDraft((prev) => ({ ...prev, discountType: event.target.value }))
                                  }
                                  disabled={isSubmitting}
                                >
                                  <MenuItem value="Percentage">Percentage</MenuItem>
                                  <MenuItem value="Fixed">Fixed</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Discount Value"
                                type="number"
                                placeholder="0"
                                value={promotionDraft.discountValue}
                                onChange={(event) => setPromotionDraft((prev) => ({ ...prev, discountValue: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={promotionDraft.startDate}
                                onChange={(event) => setPromotionDraft((prev) => ({ ...prev, startDate: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={promotionDraft.endDate}
                                onChange={(event) => setPromotionDraft((prev) => ({ ...prev, endDate: event.target.value }))}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" onClick={handleSavePromotion} disabled={isSubmitting}>
                                  {editingPromotionId ? 'Update Promotion' : 'Add Promotion'}
                                </Button>
                                {editingPromotionId && (
                                  <Button
                                    variant="text"
                                    onClick={() => {
                                      setPromotionDraft({
                                        id: '',
                                        name: '',
                                        discountType: 'Percentage',
                                        discountValue: '',
                                        startDate: '',
                                        endDate: '',
                                      });
                                      setEditingPromotionId(null);
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              {promotions.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  No promotions added yet.
                                </Typography>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {promotions.map((promo) => (
                                    <Box
                                      key={promo.id}
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
                                        <Typography fontWeight={600}>{promo.name || 'Promotion'}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {promo.discountType} {promo.discountValue || 0} · {promo.startDate || 'Start'} → {promo.endDate || 'End'}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="small" onClick={() => handleEditPromotion(promo)} disabled={isSubmitting}>
                                          Edit
                                        </Button>
                                        <Button
                                          size="small"
                                          color="error"
                                          onClick={() => handleRemovePromotion(promo.id)}
                                          disabled={isSubmitting}
                                        >
                                          Delete
                                        </Button>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>

                        {/* Serial / IMEI Tracking */}
                        <Grid size={{ xs: 12 }}>
                          <Box className="flex items-center gap-2">
                            <Icon icon="mdi:shield-key-outline" width={18} color={theme.palette.error.main} />
                            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                              Serial / IMEI Tracking
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={serialTracking.enabled}
                                onChange={(event) => {
                                  const enabled = event.target.checked;
                                  setSerialTracking((prev) => ({
                                    enabled,
                                    serialNumbers: enabled ? prev.serialNumbers : [],
                                    imeiNumbers: enabled ? prev.imeiNumbers : [],
                                  }));
                                  if (!enabled) {
                                    setSerialsInput('');
                                    setImeiInput('');
                                  }
                                }}
                                disabled={isSubmitting}
                              />
                            }
                            label="Serialized Item"
                          />
                        </Grid>
                        {serialTracking.enabled && (
                          <>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                multiline
                                minRows={4}
                                label="Serial Numbers (one per line)"
                                placeholder="SN-001&#10;SN-002"
                                value={serialsInput}
                                onChange={(event) => handleSerialsInputChange(event.target.value)}
                                disabled={isSubmitting}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                multiline
                                minRows={4}
                                label="IMEI Numbers (one per line)"
                                placeholder="IMEI-001&#10;IMEI-002"
                                value={imeiInput}
                                onChange={(event) => handleImeiInputChange(event.target.value)}
                                disabled={isSubmitting}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </form>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16'>
        <Button
          variant='outlined'
          color='secondary'
          onClick={handleClose}
          disabled={isSubmitting}
        >
          {isDialog ? 'Cancel' : 'Back'}
        </Button>
        <Button
          type="submit"
          form="add-product-form"
          variant='contained'
          disabled={isSubmitting || loading}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Adding...' : 'Add Product'}
        </Button>
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

export default AddProductDialog;