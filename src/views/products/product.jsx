'use client';

import React, { useCallback, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Switch,
  Tab,
  TextField,
  Typography,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { Icon } from '@iconify/react';
import CustomAvatar from '@core/components/mui/Avatar';
import IconButton from '@core/components/mui/CustomOriginalIconButton';
import CustomTabList from '@core/components/mui/TabList';
import ColorSwatchPicker from '@/components/custom-components/ColorSwatchPicker';
import { formIcons } from '@/data/dataSets';
import { getColorChipSx, getColorHexFromLabel } from '@/utils/colorUtils';
import { getNameFromPath } from '@/utils/fileUtils';
import { normalizeScaleBarcodeConfig } from '@/utils/productScaleBarcode';

const INNER_SECTION_SX = {
  pt: 3,
  mt: 3,
  borderTop: '1px dashed',
  borderColor: 'divider',
};

const PRODUCT_FORM_SECTION_CARD_SX = {
  width: '100%',
  minHeight: {
    xs: 560,
    sm: 560,
    md: 540,
  },
  overflow: 'visible',
};

const PRODUCT_FORM_SECTION_CONTENT_SX = {
  minHeight: 'inherit',
  p: {
    xs: 4,
    sm: 5,
  },
};

const buildSummary = (items, fallback) => items.filter(Boolean).join(' • ') || fallback;

export const createLocalId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const toNumberValue = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const splitLines = (text = '') =>
  String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

export const getDefaultScaleBarcodeConfig = () => ({
  enabled: false,
  prefix: '21',
  pluCode: '',
  valueType: 'weight',
  decimals: '3',
});

export const createEmptyVariantDraft = () => ({
  id: '',
  name: '',
  size: '',
  color: '',
  colorHex: '',
  colorHexManual: false,
  sku: '',
  barcode: '',
  sellingPrice: '',
  purchasePrice: '',
  stock: '',
});

export const createEmptyPriceTierDraft = () => ({
  id: '',
  name: '',
  minQty: '',
  sellingPrice: '',
});

export const createEmptyPromotionDraft = () => ({
  id: '',
  name: '',
  discountType: 'Percentage',
  discountValue: '',
  startDate: '',
  endDate: '',
});

export function useProductFormSections() {
  const [activeSection, setActiveSection] = useState('productDetails');

  const sections = {
    productDetails: activeSection === 'productDetails',
    variants: activeSection === 'variants',
    packaging: activeSection === 'packaging',
    pricing: activeSection === 'pricing',
    scaleBarcode: activeSection === 'scaleBarcode',
  };

  const setSectionExpanded = useCallback((sectionKey, isExpanded) => {
    if (isExpanded) {
      setActiveSection(sectionKey);
    }
  }, []);

  const resetSections = useCallback(() => {
    setActiveSection('productDetails');
  }, []);

  return {
    sections,
    activeSection,
    setActiveSection,
    setSectionExpanded,
    resetSections,
  };
}

export function useProductAdvancedForm({ units = [] } = {}) {
  const [batchInfo, setBatchInfo] = useState({ shelfLifeDays: '' });
  const [variants, setVariants] = useState([]);
  const [variantDraft, setVariantDraft] = useState(createEmptyVariantDraft);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [packagingUnitIds, setPackagingUnitIds] = useState([]);
  const [priceTiers, setPriceTiers] = useState([]);
  const [priceTierDraft, setPriceTierDraft] = useState(createEmptyPriceTierDraft);
  const [editingPriceTierId, setEditingPriceTierId] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [promotionDraft, setPromotionDraft] = useState(createEmptyPromotionDraft);
  const [editingPromotionId, setEditingPromotionId] = useState(null);
  const [serialTracking, setSerialTracking] = useState({
    enabled: false,
    serialNumbers: [],
    imeiNumbers: [],
  });
  const [serialsInput, setSerialsInput] = useState('');
  const [imeiInput, setImeiInput] = useState('');
  const [scaleBarcodeConfig, setScaleBarcodeConfig] = useState(getDefaultScaleBarcodeConfig);
  const [scaleBarcodeError, setScaleBarcodeError] = useState('');

  const resetVariantDraft = useCallback(() => {
    setVariantDraft(createEmptyVariantDraft());
    setEditingVariantId(null);
  }, []);

  const resetPriceTierDraft = useCallback(() => {
    setPriceTierDraft(createEmptyPriceTierDraft());
    setEditingPriceTierId(null);
  }, []);

  const resetPromotionDraft = useCallback(() => {
    setPromotionDraft(createEmptyPromotionDraft());
    setEditingPromotionId(null);
  }, []);

  const resetAdvancedFields = useCallback(() => {
    setBatchInfo({ shelfLifeDays: '' });
    setVariants([]);
    setPackagingUnitIds([]);
    setPriceTiers([]);
    setPromotions([]);
    setSerialTracking({ enabled: false, serialNumbers: [], imeiNumbers: [] });
    setSerialsInput('');
    setImeiInput('');
    setScaleBarcodeConfig(getDefaultScaleBarcodeConfig());
    setScaleBarcodeError('');
    resetVariantDraft();
    resetPriceTierDraft();
    resetPromotionDraft();
  }, [resetPriceTierDraft, resetPromotionDraft, resetVariantDraft]);

  const buildProductMeta = useCallback(() => {
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
            colorHex: variant.colorHex || getColorHexFromLabel(variant.color) || undefined,
          },
        };
      });
    }

    if (packagingUnitIds.length > 0) {
      meta.packagingUnits = packagingUnitIds
        .map((unitId) => {
          const unit = units.find((item) => item?._id === unitId);
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
      meta.promotions = promotions.map((promotion) => ({
        id: promotion.id,
        name: promotion.name?.trim() || undefined,
        discountType: promotion.discountType || 'Percentage',
        discountValue: toNumberValue(promotion.discountValue),
        startDate: promotion.startDate || undefined,
        endDate: promotion.endDate || undefined,
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

    const scaleBarcodeMeta = normalizeScaleBarcodeConfig(scaleBarcodeConfig);
    if (scaleBarcodeMeta) {
      meta.scaleBarcode = scaleBarcodeMeta;
    }

    return meta;
  }, [
    batchInfo.shelfLifeDays,
    packagingUnitIds,
    priceTiers,
    promotions,
    scaleBarcodeConfig,
    serialTracking,
    units,
    variants,
  ]);

  const handleSerialsInputChange = useCallback((value) => {
    setSerialsInput(value);
    setSerialTracking((prev) => ({
      ...prev,
      serialNumbers: splitLines(value),
    }));
  }, []);

  const handleImeiInputChange = useCallback((value) => {
    setImeiInput(value);
    setSerialTracking((prev) => ({
      ...prev,
      imeiNumbers: splitLines(value),
    }));
  }, []);

  const handleVariantColorChange = useCallback((value) => {
    setVariantDraft((prev) => {
      const nextDraft = { ...prev, color: value };

      if (!prev.colorHexManual) {
        nextDraft.colorHex = getColorHexFromLabel(value) || '';
      }

      return nextDraft;
    });
  }, []);

  const handleVariantColorHexPick = useCallback((value) => {
    setVariantDraft((prev) => ({
      ...prev,
      colorHex: value,
      colorHexManual: true,
    }));
  }, []);

  const handleVariantColorHexClear = useCallback(() => {
    setVariantDraft((prev) => ({
      ...prev,
      colorHex: getColorHexFromLabel(prev.color) || '',
      colorHexManual: false,
    }));
  }, []);

  const handleSaveVariant = useCallback(() => {
    const colorLabel = variantDraft.color?.trim();
    const colorHex = variantDraft.colorHexManual
      ? variantDraft.colorHex
      : getColorHexFromLabel(colorLabel);
    const payload = {
      ...variantDraft,
      id: editingVariantId || createLocalId(),
      colorHex: colorHex || '',
    };

    const variantName =
      payload.name?.trim() || [payload.size, payload.color].filter(Boolean).join(' / ') || 'Variant';

    const nextVariant = { ...payload, name: variantName };

    setVariants((prev) =>
      editingVariantId
        ? prev.map((item) => (item.id === editingVariantId ? nextVariant : item))
        : [...prev, nextVariant]
    );
    resetVariantDraft();
  }, [editingVariantId, resetVariantDraft, variantDraft]);

  const handleEditVariant = useCallback((variant) => {
    const storedColorHex = variant?.attributes?.colorHex || variant?.colorHex || '';

    setVariantDraft({
      ...createEmptyVariantDraft(),
      ...variant,
      size: variant?.attributes?.size || variant?.size || '',
      color: variant?.attributes?.color || variant?.color || '',
      colorHex: storedColorHex,
      colorHexManual: variant?.colorHexManual !== undefined ? Boolean(variant.colorHexManual) : Boolean(storedColorHex),
    });
    setEditingVariantId(variant?.id || null);
  }, []);

  const handleRemoveVariant = useCallback((variantId) => {
    setVariants((prev) => prev.filter((item) => item.id !== variantId));
  }, []);

  const handleSavePriceTier = useCallback(() => {
    const payload = {
      ...priceTierDraft,
      id: editingPriceTierId || createLocalId(),
      name: priceTierDraft.name?.trim() || 'Tier',
    };

    setPriceTiers((prev) =>
      editingPriceTierId
        ? prev.map((item) => (item.id === editingPriceTierId ? payload : item))
        : [...prev, payload]
    );
    resetPriceTierDraft();
  }, [editingPriceTierId, priceTierDraft, resetPriceTierDraft]);

  const handleEditPriceTier = useCallback((tier) => {
    setPriceTierDraft({
      ...createEmptyPriceTierDraft(),
      ...tier,
    });
    setEditingPriceTierId(tier?.id || null);
  }, []);

  const handleRemovePriceTier = useCallback((tierId) => {
    setPriceTiers((prev) => prev.filter((item) => item.id !== tierId));
  }, []);

  const handleSavePromotion = useCallback(() => {
    const payload = {
      ...promotionDraft,
      id: editingPromotionId || createLocalId(),
      name: promotionDraft.name?.trim() || 'Promotion',
    };

    setPromotions((prev) =>
      editingPromotionId
        ? prev.map((item) => (item.id === editingPromotionId ? payload : item))
        : [...prev, payload]
    );
    resetPromotionDraft();
  }, [editingPromotionId, promotionDraft, resetPromotionDraft]);

  const handleEditPromotion = useCallback((promotion) => {
    setPromotionDraft({
      ...createEmptyPromotionDraft(),
      ...promotion,
    });
    setEditingPromotionId(promotion?.id || null);
  }, []);

  const handleRemovePromotion = useCallback((promotionId) => {
    setPromotions((prev) => prev.filter((item) => item.id !== promotionId));
  }, []);

  const handlePackagingUnitChange = useCallback((event) => {
    const value = event?.target?.value;
    setPackagingUnitIds(typeof value === 'string' ? value.split(',') : value || []);
  }, []);

  const applyMetaToState = useCallback((meta = {}) => {
    const batch = meta?.batchInfo || {};
    setBatchInfo({
      shelfLifeDays: batch.shelfLifeDays !== undefined ? String(batch.shelfLifeDays) : '',
    });

    setVariants(
      Array.isArray(meta?.variants)
        ? meta.variants.map((variant) => ({
          id: variant.id || createLocalId(),
          name: variant.name || '',
          size: variant.attributes?.size || '',
          color: variant.attributes?.color || '',
          colorHex: variant.attributes?.colorHex || '',
          colorHexManual: Boolean(variant.attributes?.colorHex),
          sku: variant.sku || '',
          barcode: variant.barcode || '',
          sellingPrice: variant.sellingPrice !== undefined ? String(variant.sellingPrice) : '',
          purchasePrice: variant.purchasePrice !== undefined ? String(variant.purchasePrice) : '',
          stock: variant.stock !== undefined ? String(variant.stock) : '',
        }))
        : []
    );

    setPackagingUnitIds(
      Array.isArray(meta?.packagingUnits)
        ? meta.packagingUnits.map((unit) => unit.unitId).filter(Boolean)
        : []
    );

    setPriceTiers(
      Array.isArray(meta?.priceTiers)
        ? meta.priceTiers.map((tier) => ({
          id: tier.id || createLocalId(),
          name: tier.name || '',
          minQty: tier.minQty !== undefined ? String(tier.minQty) : '',
          sellingPrice: tier.sellingPrice !== undefined ? String(tier.sellingPrice) : '',
        }))
        : []
    );

    setPromotions(
      Array.isArray(meta?.promotions)
        ? meta.promotions.map((promotion) => ({
          id: promotion.id || createLocalId(),
          name: promotion.name || '',
          discountType: promotion.discountType || 'Percentage',
          discountValue:
            promotion.discountValue !== undefined ? String(promotion.discountValue) : '',
          startDate: promotion.startDate || '',
          endDate: promotion.endDate || '',
        }))
        : []
    );

    const serialNumbers = Array.isArray(meta?.serialTracking?.serialNumbers)
      ? meta.serialTracking.serialNumbers
      : [];
    const imeiNumbers = Array.isArray(meta?.serialTracking?.imeiNumbers)
      ? meta.serialTracking.imeiNumbers
      : [];

    setSerialTracking({
      enabled: Boolean(meta?.serialTracking?.enabled || serialNumbers.length > 0 || imeiNumbers.length > 0),
      serialNumbers,
      imeiNumbers,
    });
    setSerialsInput(serialNumbers.join('\n'));
    setImeiInput(imeiNumbers.join('\n'));

    const scaleBarcodeMeta = normalizeScaleBarcodeConfig(meta?.scaleBarcode || null);
    setScaleBarcodeConfig(
      scaleBarcodeMeta
        ? {
          enabled: true,
          prefix: scaleBarcodeMeta.prefix,
          pluCode: scaleBarcodeMeta.pluCode,
          valueType: scaleBarcodeMeta.valueType,
          decimals: String(scaleBarcodeMeta.decimals),
        }
        : getDefaultScaleBarcodeConfig()
    );
    setScaleBarcodeError('');
    resetVariantDraft();
    resetPriceTierDraft();
    resetPromotionDraft();
  }, [resetPriceTierDraft, resetPromotionDraft, resetVariantDraft]);

  return {
    batchInfo,
    setBatchInfo,
    variants,
    variantDraft,
    setVariantDraft,
    editingVariantId,
    packagingUnitIds,
    priceTiers,
    priceTierDraft,
    setPriceTierDraft,
    editingPriceTierId,
    promotions,
    promotionDraft,
    setPromotionDraft,
    editingPromotionId,
    serialTracking,
    setSerialTracking,
    serialsInput,
    imeiInput,
    scaleBarcodeConfig,
    setScaleBarcodeConfig,
    scaleBarcodeError,
    setScaleBarcodeError,
    buildProductMeta,
    resetAdvancedFields,
    applyMetaToState,
    handleSerialsInputChange,
    handleImeiInputChange,
    handleSaveVariant,
    handleEditVariant,
    handleRemoveVariant,
    handleVariantColorChange,
    handleVariantColorHexPick,
    handleVariantColorHexClear,
    handleCancelVariantEdit: resetVariantDraft,
    handlePackagingUnitChange,
    handleSavePriceTier,
    handleEditPriceTier,
    handleRemovePriceTier,
    handleCancelPriceTierEdit: resetPriceTierDraft,
    handleSavePromotion,
    handleEditPromotion,
    handleRemovePromotion,
    handleCancelPromotionEdit: resetPromotionDraft,
  };
}

export const ProductFormAccordionSection = ({
  title,
  summary = '',
  icon,
  avatarColor = 'primary',
  expanded,
  onToggle,
  children,
  compact = false,
  tabMode = false,
  sx = {},
  detailsSx = {},
}) => {
  const sectionHeader = (
    <>
      <Box className='flex w-full items-center justify-between gap-4'>
        <Box className='flex items-center gap-3'>
          {compact ? (
            <Icon icon={icon} width={18} color='currentColor' />
          ) : (
            <CustomAvatar variant='rounded' skin='light' color={avatarColor} size={40}>
              {icon.startsWith('mdi:') ? <Icon icon={icon} width={20} /> : <i className={icon} />}
            </CustomAvatar>
          )}
          <Box>
            <Typography variant={compact ? 'subtitle1' : 'h6'} className='font-semibold'>
              {title}
            </Typography>
          </Box>
        </Box>

        {summary ? (
          <Typography
            variant='caption'
            color='text.secondary'
            className='hidden text-right md:block'
            sx={{ maxWidth: compact ? 260 : 320 }}
          >
            {summary}
          </Typography>
        ) : null}
      </Box>
    </>
  );

  if (tabMode) {
    return (
      <Box sx={sx}>
        <Box sx={{ mb: 3 }}>{sectionHeader}</Box>
        <Box sx={detailsSx}>{children}</Box>
      </Box>
    );
  }

  return (
    <Accordion expanded={expanded} onChange={(_, isExpanded) => onToggle?.(isExpanded)} sx={sx}>
      <AccordionSummary>{sectionHeader}</AccordionSummary>
      <AccordionDetails sx={detailsSx}>{children}</AccordionDetails>
    </Accordion>
  );
};

export const ProductFormTabbedSections = ({ activeTab, onTabChange, tabs = [] }) => (
  <TabContext value={activeTab}>
    <Box sx={{ mb: 4 }}>
      <CustomTabList onChange={(_, value) => onTabChange(value)} variant='scrollable' scrollButtons='auto' pill='true'>
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={<Icon icon={tab.icon} width={18} />}
            iconPosition='start'
          />
        ))}
      </CustomTabList>
    </Box>
    {tabs.map((tab) => (
      <TabPanel key={tab.value} value={tab.value} className='!p-0'>
        <Card sx={PRODUCT_FORM_SECTION_CARD_SX}>
          <CardContent sx={PRODUCT_FORM_SECTION_CONTENT_SX}>
            {tab.content}
          </CardContent>
        </Card>
      </TabPanel>
    ))}
  </TabContext>
);

export const ProductFormSectionTitle = ({ title }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
      {title}
    </Typography>

  </Box>
);

export const ProductDetailsSection = ({
  control,
  errors,
  theme,
  watchName,
  watchType,
  watchCategory,
  watchWarrantyEnabled,
  watchDiscountType,
  productTypes,
  discountTypes,
  dropdownData,
  loading,
  isSubmitting,
  expanded,
  onToggle,
  tabMode = false,
}) => {
  const typeLabel = productTypes.find((type) => type.value === watchType)?.label;
  const categoryLabel = dropdownData.categories?.find((category) => category._id === watchCategory)?.name;
  const detailsSummary = [watchName?.trim() || 'New product', typeLabel, categoryLabel]
    .filter(Boolean)
    .join(' • ');

  return (
    <ProductFormAccordionSection
      title='Product Details'
      summary={detailsSummary}
      icon='ri-box-3-line'
      avatarColor='primary'
      expanded={expanded}
      onToggle={onToggle}
      tabMode={tabMode}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label='Product Name'
                placeholder='Enter product name'
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon='mdi:alphabetical-variant'
                      width={23}
                      color={theme.palette.secondary.light}
                    />
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='type'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.type)}>
                <InputLabel>Type</InputLabel>
                <Select
                  {...field}
                  label='Type'
                  disabled={isSubmitting}
                  startAdornment={
                    watchType &&
                    formIcons.find((icon) => icon.value === watchType)?.icon && (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={formIcons.find((icon) => icon.value === watchType)?.icon}
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

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='category'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={Boolean(errors.category)}>
                <InputLabel>Category</InputLabel>
                <Select
                  {...field}
                  label='Category'
                  disabled={isSubmitting || loading}
                  startAdornment={
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={formIcons.find((icon) => icon.value === 'category')?.icon || 'mdi:ruler'}
                      width={23}
                      color={theme.palette.secondary.light}
                    />
                  }
                >
                  {Array.isArray(dropdownData.categories) && dropdownData.categories.length > 0 ? (
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

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='units'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={Boolean(errors.units)}>
                <InputLabel>Unit</InputLabel>
                <Select
                  {...field}
                  label='Unit'
                  disabled={isSubmitting || loading}
                  startAdornment={
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={formIcons.find((icon) => icon.value === 'unit')?.icon || 'mdi:ruler'}
                      width={25}
                      color={theme.palette.secondary.light}
                    />
                  }
                >
                  {Array.isArray(dropdownData.units) && dropdownData.units.length > 0 ? (
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

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='purchasePrice'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                type='number'
                label='Purchase Price'
                placeholder='0.00'
                error={Boolean(errors.purchasePrice)}
                helperText={errors.purchasePrice?.message}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={formIcons.find((icon) => icon.value === 'currency')?.icon || 'lucide:saudi-riyal'}
                      width={21}
                      color={theme.palette.secondary.light}
                    />
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='sellingPrice'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                type='number'
                label='Selling Price'
                placeholder='0.00'
                error={Boolean(errors.sellingPrice)}
                helperText={errors.sellingPrice?.message}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={formIcons.find((icon) => icon.value === 'currency')?.icon || 'lucide:saudi-riyal'}
                      width={21}
                      color={theme.palette.secondary.light}
                    />
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='discountValue'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='number'
                label='Discount Value'
                placeholder='0'
                error={Boolean(errors.discountValue)}
                helperText={errors.discountValue?.message}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={formIcons.find((icon) => icon.value === watchDiscountType)?.icon || ''}
                      width={21}
                      color={theme.palette.secondary.light}
                    />
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='discountType'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select {...field} label='Discount Type' disabled={isSubmitting}>
                  {discountTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon
                          style={{ marginRight: '5px' }}
                          icon={formIcons.find((icon) => icon.value === type.value)?.icon || ''}
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

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='tax'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.tax)}>
                <InputLabel>Tax</InputLabel>
                <Select
                  {...field}
                  label='Tax'
                  disabled={isSubmitting || loading}
                  startAdornment={
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={formIcons.find((icon) => icon.value === 'vat')?.icon || ''}
                      width={25}
                      color={theme.palette.secondary.light}
                    />
                  }
                >
                  {Array.isArray(dropdownData.taxes) &&
                    dropdownData.taxes.map((tax) => (
                      <MenuItem key={tax._id} value={tax._id}>
                        {tax.name} ({tax.taxRate}%)
                      </MenuItem>
                    ))}
                </Select>
                {errors.tax && <FormHelperText>{errors.tax.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='warrantyEnabled'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(field.value)}
                    onChange={event => field.onChange(event.target.checked)}
                    disabled={isSubmitting || loading}
                  />
                }
                label='Warranty enabled'
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='warrantyPolicyId'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.warrantyPolicyId)} disabled={!watchWarrantyEnabled}>
                <InputLabel>Warranty Policy</InputLabel>
                <Select
                  {...field}
                  label='Warranty Policy'
                  disabled={isSubmitting || loading || !watchWarrantyEnabled}
                  startAdornment={
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon='ri-shield-check-line'
                      width={23}
                      color={theme.palette.secondary.light}
                    />
                  }
                >
                  <MenuItem value=''>No policy</MenuItem>
                  {Array.isArray(dropdownData.warrantyPolicies) &&
                    dropdownData.warrantyPolicies.map(policy => (
                      <MenuItem key={policy._id} value={policy._id}>
                        {policy.name} ({policy.duration?.value || 0} {policy.duration?.unit || 'months'})
                      </MenuItem>
                    ))}
                </Select>
                {errors.warrantyPolicyId && <FormHelperText>{errors.warrantyPolicyId.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='alertQuantity'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='number'
                label='Alert Quantity'
                placeholder='0'
                error={Boolean(errors.alertQuantity)}
                helperText={errors.alertQuantity?.message}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={
                        formIcons.find((icon) => icon.value === 'alertQuantity')?.icon ||
                        'mdi:alert-circle-outline'
                      }
                      width={23}
                      color={theme.palette.secondary.light}
                    />
                  ),
                }}
                sx={
                  field.value <= 10
                    ? {
                      '& .MuiInputBase-input': {
                        color: 'error.main',
                      },
                    }
                    : {}
                }
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='sku'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='SKU'
                placeholder='Enter SKU'
                error={Boolean(errors.sku)}
                helperText={errors.sku?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name='barcode'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Barcode'
                placeholder='Enter barcode'
                error={Boolean(errors.barcode)}
                helperText={errors.barcode?.message}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={formIcons.find((icon) => icon.value === 'barcode')?.icon || 'mdi:barcode'}
                      width={23}
                      color={theme.palette.secondary.light}
                    />
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </ProductFormAccordionSection>
  );
};

export const ProductVariantsSection = ({
  advanced,
  disabled = false,
  expanded,
  onToggle,
  tabMode = false,
}) => {
  const editPreviewHex =
    advanced.variantDraft.colorHex || getColorHexFromLabel(advanced.variantDraft.color) || '#ffffff';

  const variantsSummary = buildSummary(
    [
      advanced.variants.length ? `${advanced.variants.length} variant(s)` : null,
      advanced.editingVariantId ? 'Editing variant' : null,
    ],
    'No variants added'
  );

  const variantsList =
    advanced.variants.length === 0 ? (
      <Typography variant='body2' color='text.secondary'>
        No variants added yet.
      </Typography>
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {advanced.variants.map((variant) => (
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
              {variant.size || variant.color ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {variant.size ? <Chip size='small' variant='outlined' label={variant.size} /> : null}
                  {variant.color ? (
                    <Chip
                      size='small'
                      variant='outlined'
                      label={variant.color}
                      sx={getColorChipSx(variant.colorHex || variant.color, { fontSize: '0.72rem' })}
                    />
                  ) : null}
                </Box>
              ) : null}
              <Typography variant='caption' color='text.secondary'>
                {variant.sku ? `SKU: ${variant.sku}` : 'No SKU'} ·{' '}
                {variant.sellingPrice ? `Price: ${variant.sellingPrice}` : 'No price'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size='small' disabled={disabled} onClick={() => advanced.handleEditVariant(variant)}>
                Edit
              </Button>
              <Button
                size='small'
                color='error'
                disabled={disabled}
                onClick={() => advanced.handleRemoveVariant(variant.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    );

  return (
    <ProductFormAccordionSection
      title='Variants'
      summary={variantsSummary}
      icon='mdi:layers-outline'
      avatarColor='success'
      expanded={expanded}
      onToggle={onToggle}
      tabMode={tabMode}
    >
      <ProductFormSectionTitle
        title='Variant Setup'
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label='Variant Name'
            placeholder='Size / Color'
            value={advanced.variantDraft.name}
            onChange={(event) =>
              advanced.setVariantDraft((prev) => ({ ...prev, name: event.target.value }))
            }
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label='Size'
            placeholder='Large'
            value={advanced.variantDraft.size}
            onChange={(event) =>
              advanced.setVariantDraft((prev) => ({ ...prev, size: event.target.value }))
            }
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label='Color'
            placeholder='Ruby Red'
            value={advanced.variantDraft.color}
            onChange={(event) => advanced.handleVariantColorChange(event.target.value)}
            disabled={disabled}
            helperText={advanced.variantDraft.colorHex ? `Swatch: ${advanced.variantDraft.colorHex}` : ' '}
            InputProps={{
              startAdornment: (
                <ColorSwatchPicker
                  value={advanced.variantDraft.colorHex}
                  fallbackValue={editPreviewHex}
                  manual={advanced.variantDraft.colorHexManual}
                  disabled={disabled}
                  onApply={advanced.handleVariantColorHexPick}
                  onClear={advanced.handleVariantColorHexClear}
                />
              ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label='SKU'
            placeholder='Variant SKU'
            value={advanced.variantDraft.sku}
            onChange={(event) =>
              advanced.setVariantDraft((prev) => ({ ...prev, sku: event.target.value }))
            }
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label='Barcode'
            placeholder='Variant barcode'
            value={advanced.variantDraft.barcode}
            onChange={(event) =>
              advanced.setVariantDraft((prev) => ({ ...prev, barcode: event.target.value }))
            }
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            type='number'
            label='Selling Price'
            placeholder='0.00'
            value={advanced.variantDraft.sellingPrice}
            onChange={(event) =>
              advanced.setVariantDraft((prev) => ({
                ...prev,
                sellingPrice: event.target.value,
              }))
            }
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            type='number'
            label='Purchase Price'
            placeholder='0.00'
            value={advanced.variantDraft.purchasePrice}
            onChange={(event) =>
              advanced.setVariantDraft((prev) => ({
                ...prev,
                purchasePrice: event.target.value,
              }))
            }
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            type='number'
            label='Stock'
            placeholder='0'
            value={advanced.variantDraft.stock}
            onChange={(event) =>
              advanced.setVariantDraft((prev) => ({ ...prev, stock: event.target.value }))
            }
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant='outlined' onClick={advanced.handleSaveVariant} disabled={disabled}>
              {advanced.editingVariantId ? 'Update Variant' : 'Add Variant'}
            </Button>
            {advanced.editingVariantId ? (
              <Button variant='text' onClick={advanced.handleCancelVariantEdit} disabled={disabled}>
                Cancel
              </Button>
            ) : null}
          </Box>
        </Grid>
        <Grid size={{ xs: 12 }}>{variantsList}</Grid>
      </Grid>
    </ProductFormAccordionSection>
  );
};

export const ProductPackagingConfigurationSection = ({
  advanced,
  dropdownData,
  disabled = false,
  expanded,
  onToggle,
  tabMode = false,
}) => {
  const packagingSummary = buildSummary(
    [
      advanced.batchInfo.shelfLifeDays ? `${advanced.batchInfo.shelfLifeDays} day shelf life` : null,
      advanced.packagingUnitIds.length ? `${advanced.packagingUnitIds.length} packaging unit(s)` : null,
      advanced.serialTracking.enabled ? 'Serial tracking on' : null,
    ],
    'Shelf life, packaging, and tracking settings'
  );

  const selectedPackagingUnits = advanced.packagingUnitIds.map((unitId) => {
    const unit = dropdownData.units?.find((item) => item._id === unitId);
    const conversion = unit?.conversionFactor ? ` · ${unit.conversionFactor}` : '';

    return <Chip key={unitId} size='small' label={`${unit?.name || unitId}${conversion}`} />;
  });

  return (
    <ProductFormAccordionSection
      title='Packaging'
      summary={packagingSummary}
      icon='mdi:package-variant-closed'
      avatarColor='info'
      expanded={expanded}
      onToggle={onToggle}
      tabMode={tabMode}
    >
      <Box>
        <ProductFormSectionTitle
          title='Shelf Life'
        />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type='number'
              label='Shelf Life (days)'
              placeholder='0'
              value={advanced.batchInfo.shelfLifeDays}
              onChange={(event) =>
                advanced.setBatchInfo((prev) => ({ ...prev, shelfLifeDays: event.target.value }))
              }
              disabled={disabled}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={INNER_SECTION_SX}>
        <ProductFormSectionTitle
          title='Packaging & Unit Conversions'
        />
        <FormControl fullWidth>
          <InputLabel>Packaging Units</InputLabel>
          <Select
            multiple
            label='Packaging Units'
            value={advanced.packagingUnitIds}
            onChange={advanced.handlePackagingUnitChange}
            renderValue={() => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selectedPackagingUnits}</Box>
            )}
            disabled={disabled}
          >
            {dropdownData.units?.map((unit) => (
              <MenuItem key={unit._id} value={unit._id}>
                {unit.name} ({unit.symbol})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={INNER_SECTION_SX}>
        <ProductFormSectionTitle
          title='Serial / IMEI Tracking'
        />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={advanced.serialTracking.enabled}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    advanced.setSerialTracking((prev) => ({
                      enabled,
                      serialNumbers: enabled ? prev.serialNumbers : [],
                      imeiNumbers: enabled ? prev.imeiNumbers : [],
                    }));

                    if (!enabled) {
                      advanced.handleSerialsInputChange('');
                      advanced.handleImeiInputChange('');
                    }
                  }}
                  disabled={disabled}
                />
              }
              label='Serialized Item'
            />
          </Grid>
          {advanced.serialTracking.enabled ? (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label='Serial Numbers (one per line)'
                  placeholder={'SN-001\nSN-002'}
                  value={advanced.serialsInput}
                  onChange={(event) => advanced.handleSerialsInputChange(event.target.value)}
                  disabled={disabled}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label='IMEI Numbers (one per line)'
                  placeholder={'IMEI-001\nIMEI-002'}
                  value={advanced.imeiInput}
                  onChange={(event) => advanced.handleImeiInputChange(event.target.value)}
                  disabled={disabled}
                />
              </Grid>
            </>
          ) : null}
        </Grid>
      </Box>
    </ProductFormAccordionSection>
  );
};

export const ProductPricingConfigurationSection = ({
  advanced,
  disabled = false,
  expanded,
  onToggle,
  tabMode = false,
}) => {
  const pricingSummary = buildSummary(
    [
      advanced.priceTiers.length ? `${advanced.priceTiers.length} price tier(s)` : null,
      advanced.promotions.length ? `${advanced.promotions.length} promotion(s)` : null,
    ],
    'No pricing rules added'
  );

  const priceTiersList =
    advanced.priceTiers.length === 0 ? (
      <Typography variant='body2' color='text.secondary'>
        No price tiers added yet.
      </Typography>
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {advanced.priceTiers.map((tier) => (
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
              <Typography variant='caption' color='text.secondary'>
                {tier.minQty ? `Min Qty: ${tier.minQty}` : 'No minimum'} ·{' '}
                {tier.sellingPrice ? `Price: ${tier.sellingPrice}` : 'No price'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size='small' disabled={disabled} onClick={() => advanced.handleEditPriceTier(tier)}>
                Edit
              </Button>
              <Button
                size='small'
                color='error'
                disabled={disabled}
                onClick={() => advanced.handleRemovePriceTier(tier.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    );

  const promotionsList =
    advanced.promotions.length === 0 ? (
      <Typography variant='body2' color='text.secondary'>
        No promotions added yet.
      </Typography>
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {advanced.promotions.map((promotion) => (
          <Box
            key={promotion.id}
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
              <Typography fontWeight={600}>{promotion.name || 'Promotion'}</Typography>
              <Typography variant='caption' color='text.secondary'>
                {promotion.discountType} {promotion.discountValue || 0} · {promotion.startDate || 'Start'}
                {' -> '}
                {promotion.endDate || 'End'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size='small' disabled={disabled} onClick={() => advanced.handleEditPromotion(promotion)}>
                Edit
              </Button>
              <Button
                size='small'
                color='error'
                disabled={disabled}
                onClick={() => advanced.handleRemovePromotion(promotion.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    );

  return (
    <ProductFormAccordionSection
      title='Pricing & Promotions'
      summary={pricingSummary}
      icon='mdi:cash-multiple'
      avatarColor='warning'
      expanded={expanded}
      onToggle={onToggle}
      tabMode={tabMode}
    >
      <Box>
        <ProductFormSectionTitle
          title='Price Tiers'
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label='Tier Name'
              placeholder='Retail / Wholesale'
              value={advanced.priceTierDraft.name}
              onChange={(event) =>
                advanced.setPriceTierDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type='number'
              label='Minimum Quantity'
              placeholder='0'
              value={advanced.priceTierDraft.minQty}
              onChange={(event) =>
                advanced.setPriceTierDraft((prev) => ({ ...prev, minQty: event.target.value }))
              }
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type='number'
              label='Selling Price'
              placeholder='0.00'
              value={advanced.priceTierDraft.sellingPrice}
              onChange={(event) =>
                advanced.setPriceTierDraft((prev) => ({
                  ...prev,
                  sellingPrice: event.target.value,
                }))
              }
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='outlined' onClick={advanced.handleSavePriceTier} disabled={disabled}>
                {advanced.editingPriceTierId ? 'Update Tier' : 'Add Tier'}
              </Button>
              {advanced.editingPriceTierId ? (
                <Button variant='text' onClick={advanced.handleCancelPriceTierEdit} disabled={disabled}>
                  Cancel
                </Button>
              ) : null}
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>{priceTiersList}</Grid>
        </Grid>
      </Box>

      <Box sx={INNER_SECTION_SX}>
        <ProductFormSectionTitle
          title='Promotions'
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label='Promotion Name'
              placeholder='Ramadan Offer'
              value={advanced.promotionDraft.name}
              onChange={(event) =>
                advanced.setPromotionDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Discount Type</InputLabel>
              <Select
                label='Discount Type'
                value={advanced.promotionDraft.discountType}
                onChange={(event) =>
                  advanced.setPromotionDraft((prev) => ({
                    ...prev,
                    discountType: event.target.value,
                  }))
                }
                disabled={disabled}
              >
                <MenuItem value='Percentage'>Percentage</MenuItem>
                <MenuItem value='Fixed'>Fixed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type='number'
              label='Discount Value'
              placeholder='0'
              value={advanced.promotionDraft.discountValue}
              onChange={(event) =>
                advanced.setPromotionDraft((prev) => ({
                  ...prev,
                  discountValue: event.target.value,
                }))
              }
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type='date'
              label='Start Date'
              InputLabelProps={{ shrink: true }}
              value={advanced.promotionDraft.startDate}
              onChange={(event) =>
                advanced.setPromotionDraft((prev) => ({ ...prev, startDate: event.target.value }))
              }
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type='date'
              label='End Date'
              InputLabelProps={{ shrink: true }}
              value={advanced.promotionDraft.endDate}
              onChange={(event) =>
                advanced.setPromotionDraft((prev) => ({ ...prev, endDate: event.target.value }))
              }
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='outlined' onClick={advanced.handleSavePromotion} disabled={disabled}>
                {advanced.editingPromotionId ? 'Update Promotion' : 'Add Promotion'}
              </Button>
              {advanced.editingPromotionId ? (
                <Button variant='text' onClick={advanced.handleCancelPromotionEdit} disabled={disabled}>
                  Cancel
                </Button>
              ) : null}
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>{promotionsList}</Grid>
        </Grid>
      </Box>
    </ProductFormAccordionSection>
  );
};

export const ProductScaleBarcodeSection = ({
  advanced,
  disabled = false,
  expanded,
  onToggle,
  tabMode = false,
}) => {
  const scaleBarcodeSummary = advanced.scaleBarcodeConfig.enabled ? 'Enabled' : 'Disabled';

  return (
    <ProductFormAccordionSection
      title='Scale Barcode / Weighted Item'
      summary={scaleBarcodeSummary}
      icon='mdi:scale-bathroom'
      avatarColor='secondary'
      expanded={expanded}
      onToggle={onToggle}
      tabMode={tabMode}
    >
      <ProductFormSectionTitle
        title='Barcode Setup'
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Switch
                checked={advanced.scaleBarcodeConfig.enabled}
                onChange={(event) => {
                  const enabled = event.target.checked;
                  advanced.setScaleBarcodeConfig((prev) => ({
                    ...prev,
                    enabled,
                  }));
                  advanced.setScaleBarcodeError('');
                }}
                disabled={disabled}
              />
            }
            label='Enable scale barcode decoding for this product'
          />
        </Grid>
        {advanced.scaleBarcodeConfig.enabled ? (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label='Barcode Prefix'
                placeholder='21'
                value={advanced.scaleBarcodeConfig.prefix}
                onChange={(event) => {
                  advanced.setScaleBarcodeConfig((prev) => ({
                    ...prev,
                    prefix: event.target.value.replace(/\D/g, ''),
                  }));
                  advanced.setScaleBarcodeError('');
                }}
                disabled={disabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label='PLU / Item Code'
                placeholder='12345'
                value={advanced.scaleBarcodeConfig.pluCode}
                onChange={(event) => {
                  advanced.setScaleBarcodeConfig((prev) => ({
                    ...prev,
                    pluCode: event.target.value.replace(/\D/g, ''),
                  }));
                  advanced.setScaleBarcodeError('');
                }}
                disabled={disabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Encoded Value</InputLabel>
                <Select
                  value={advanced.scaleBarcodeConfig.valueType}
                  label='Encoded Value'
                  onChange={(event) => {
                    const valueType = event.target.value;
                    advanced.setScaleBarcodeConfig((prev) => ({
                      ...prev,
                      valueType,
                      decimals: valueType === 'price' ? '2' : '3',
                    }));
                    advanced.setScaleBarcodeError('');
                  }}
                  disabled={disabled}
                >
                  <MenuItem value='weight'>Weight</MenuItem>
                  <MenuItem value='price'>Label Price</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type='number'
                label='Embedded Decimals'
                placeholder={advanced.scaleBarcodeConfig.valueType === 'price' ? '2' : '3'}
                value={advanced.scaleBarcodeConfig.decimals}
                onChange={(event) => {
                  advanced.setScaleBarcodeConfig((prev) => ({
                    ...prev,
                    decimals: event.target.value.replace(/\D/g, ''),
                  }));
                  advanced.setScaleBarcodeError('');
                }}
                disabled={disabled}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormHelperText error={Boolean(advanced.scaleBarcodeError)}>
                {advanced.scaleBarcodeError ||
                  'Format expected: prefix + PLU + 5 encoded digits + check digit. Example: 21 12345 00750 X.'}
              </FormHelperText>
            </Grid>
          </>
        ) : (
          <Grid size={{ xs: 12 }}>
            <Typography variant='body2' color='text.secondary'>
              Enable this for products sold by scale labels where the barcode encodes weight or label price.
            </Typography>
          </Grid>
        )}
      </Grid>
    </ProductFormAccordionSection>
  );
};

export const ProductImageUploadField = ({
  control,
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
  isSubmitting,
  theme,
  alt = 'Product Preview',
  inputIdPrefix = 'product-image',
}) => {
  const replaceInputId = `${inputIdPrefix}-replace`;

  return (
    <Box className='mb-6 flex justify-center'>
      <Controller
        name='images'
        control={control}
        render={({ field: { onChange } }) => (
          <Box className='flex flex-col items-center gap-2'>
            {imagePreview ? (
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  overflow: 'hidden',
                  width: { xs: '280px', sm: '320px', md: '350px' },
                  height: '200px',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.50',
                  }}
                >
                  <img
                    src={imagePreview}
                    alt={alt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      borderRadius: 'inherit',
                      display: 'block',
                    }}
                    onError={handleImageError}
                  />

                  <Box
                    sx={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      left: 8,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Chip
                      label={getNameFromPath(imagePreview, selectedFile)}
                      size='small'
                      color='info'
                      variant='filled'
                    />
                  </Box>

                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <IconButton
                      variant='contained'
                      size='small'
                      color='primary'
                      disabled={isSubmitting}
                      onClick={() => document.getElementById(replaceInputId)?.click()}
                    >
                      <Icon icon='mdi:cloud-upload-outline' />
                      <input
                        id={replaceInputId}
                        type='file'
                        hidden
                        accept='image/*'
                        onChange={(event) => {
                          handleImageChange(event);
                          const file = event.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                      />
                    </IconButton>

                    <IconButton
                      size='small'
                      color='error'
                      variant='contained'
                      disabled={isSubmitting}
                      onClick={handleImageDelete}
                    >
                      <Icon icon='mdi:delete-outline' />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                component='label'
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(event) => {
                  handleDrop(event);
                  const file = event.dataTransfer.files?.[0];
                  if (file) {
                    onChange(file);
                  }
                }}
                sx={{
                  width: { xs: '180px', sm: '180px', md: '200px' },
                  height: '180px',
                  display: 'flex',
                  cursor: 'pointer',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'secondary.light',
                  borderRadius: 2,
                  backgroundColor: isDragging ? 'primary.lighter' : '',
                  transition: 'all 0.2s ease-in-out',
                  transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: theme.palette.primary.lightOpacity,
                    transform: 'scale(1.04)',
                  },
                }}
              >
                <Icon
                  icon={isDragging ? 'mdi:download' : 'mdi:cloud-upload-outline'}
                  width={48}
                  color={isDragging ? theme.palette.primary.main : theme.palette.text.secondary}
                  style={{ marginBottom: 12, pointerEvents: 'none' }}
                />
                <Typography
                  variant='body2'
                  color={isDragging ? 'primary' : 'text.primary'}
                  fontWeight={500}
                  sx={{ pointerEvents: 'none' }}
                >
                  {isDragging ? 'Drop image here' : 'Click or drag to Upload Image'}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  className='mt-1 text-center'
                  sx={{ pointerEvents: 'none' }}
                >
                  PNG, JPG up to 5MB
                </Typography>
                <input
                  type='file'
                  hidden
                  accept='image/*'
                  onChange={(event) => {
                    handleImageChange(event);
                    const file = event.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                />
              </Box>
            )}

            {imageError ? (
              <Typography variant='caption' color='error' className='block text-center'>
                <Icon
                  icon='mdi:alert-circle'
                  width={16}
                  style={{ marginRight: 4, verticalAlign: 'middle' }}
                />
                {imageError}
              </Typography>
            ) : null}
          </Box>
        )}
      />
    </Box>
  );
};

export const ProductFormLoadingState = () => (
  <Box className='p-6'>
    <Box className='mb-6 flex justify-center'>
      <Skeleton
        variant='rectangular'
        sx={{
          width: '200px',
          height: '200px',
          borderRadius: 2,
        }}
      />
    </Box>

    <Grid container spacing={4}>
      {Array.from({ length: 12 }).map((_, index) => (
        <Grid
          key={index}
          size={{
            xs: 12,
            sm: index === 0 ? 12 : 6,
            md: 4,
          }}
        >
          <Skeleton variant='rounded' height={56} />
        </Grid>
      ))}
    </Grid>
  </Box>
);
