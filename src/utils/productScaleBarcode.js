import { parseProductDescription } from './productMeta';
import { formatDecimal } from './numberUtils';

export const SCALE_BARCODE_VALUE_WEIGHT = 'weight';
export const SCALE_BARCODE_VALUE_PRICE = 'price';

const EMBEDDED_VALUE_DIGITS = 5;

const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');

const toClampedInteger = (value, fallback) => {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(4, Math.max(0, parsed));
};

const formatQuantity = (value) => {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) return '0';

  return numericValue.toFixed(3).replace(/\.?0+$/, '');
};

const getProductUnitLabel = (product) => {
  if (typeof product?.units === 'string') return product.units;
  return product?.units?.name || product?.units?.symbol || 'units';
};

export const normalizeScaleBarcodeValueType = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return normalizedValue === SCALE_BARCODE_VALUE_PRICE
    ? SCALE_BARCODE_VALUE_PRICE
    : SCALE_BARCODE_VALUE_WEIGHT;
};

export const normalizeScaleBarcodeConfig = (value) => {
  if (!value || typeof value !== 'object') return null;

  const enabled =
    value.enabled === true
    || value.enabled === 'true'
    || value.enabled === 1
    || value.enabled === '1';

  if (!enabled) return null;

  const prefix = normalizeDigits(value.prefix);
  const pluCode = normalizeDigits(value.pluCode);
  const valueType = normalizeScaleBarcodeValueType(value.valueType);
  const decimals = toClampedInteger(
    value.decimals,
    valueType === SCALE_BARCODE_VALUE_PRICE ? 2 : 3
  );

  if (!prefix || !pluCode) return null;

  return {
    enabled: true,
    prefix,
    pluCode,
    valueType,
    decimals,
    valueDigits: EMBEDDED_VALUE_DIGITS,
  };
};

export const getProductScaleBarcodeConfig = (product) => {
  const parsedDescription = parseProductDescription(product?.productDescription || '');
  return normalizeScaleBarcodeConfig(parsedDescription?.meta?.scaleBarcode || null);
};

export const productSupportsScaleBarcode = (product) =>
  Boolean(getProductScaleBarcodeConfig(product));

export const buildScaleBarcodeSummary = (product, scaleBarcodeMeta) => {
  if (!scaleBarcodeMeta) return '';

  const unitLabel = getProductUnitLabel(product);
  if (scaleBarcodeMeta.valueType === SCALE_BARCODE_VALUE_PRICE) {
    return `Scale barcode · ${formatDecimal(scaleBarcodeMeta.totalPrice)} label · ${formatQuantity(scaleBarcodeMeta.quantity)} ${unitLabel}`;
  }

  return `Scale barcode · ${formatQuantity(scaleBarcodeMeta.quantity)} ${unitLabel}`;
};

export const decodeScaleBarcodeForProduct = (product, scannedBarcode) => {
  const config = getProductScaleBarcodeConfig(product);
  if (!config) return null;

  const barcode = String(scannedBarcode || '').trim();
  const digits = normalizeDigits(barcode);
  if (!barcode || !digits) return null;

  const barcodePrefix = `${config.prefix}${config.pluCode}`;
  if (!digits.startsWith(barcodePrefix)) return null;

  const valueDigits = digits.slice(
    barcodePrefix.length,
    barcodePrefix.length + config.valueDigits
  );

  if (valueDigits.length < config.valueDigits) return null;

  const embeddedRawValue = Number(valueDigits);
  if (!Number.isFinite(embeddedRawValue) || embeddedRawValue <= 0) return null;

  const embeddedValue = embeddedRawValue / (10 ** config.decimals);
  const unitPrice = Number(product?.sellingPrice || 0);

  let quantity = 0;
  let totalPrice = 0;

  if (config.valueType === SCALE_BARCODE_VALUE_PRICE) {
    totalPrice = embeddedValue;
    if (unitPrice <= 0) return null;
    quantity = totalPrice / unitPrice;
  } else {
    quantity = embeddedValue;
    totalPrice = quantity * unitPrice;
  }

  const normalizedQuantity = Number(quantity.toFixed(3));
  const normalizedTotalPrice = Number(totalPrice.toFixed(2));
  const normalizedRate = Number(unitPrice.toFixed(2));

  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
    return null;
  }

  const scaleBarcodeMeta = {
    barcode,
    prefix: config.prefix,
    pluCode: config.pluCode,
    valueType: config.valueType,
    decimals: config.decimals,
    embeddedDigits: valueDigits,
    embeddedValue: Number(embeddedValue.toFixed(config.decimals)),
    quantity: normalizedQuantity,
    rate: normalizedRate,
    totalPrice: normalizedTotalPrice,
  };

  return {
    ...scaleBarcodeMeta,
    summary: buildScaleBarcodeSummary(product, scaleBarcodeMeta),
  };
};

export const resolveProductBarcodeMatch = (products, scannedBarcode) => {
  const barcode = String(scannedBarcode || '').trim();
  if (!barcode) return null;

  const availableProducts = Array.isArray(products) ? products : [];
  const exactMatch = availableProducts.find(
    (product) => String(product?.barcode || '').trim() === barcode
  );

  if (exactMatch) {
    return {
      product: exactMatch,
      matchType: 'standard',
      scaleBarcodeMeta: null,
    };
  }

  for (const product of availableProducts) {
    const scaleBarcodeMeta = decodeScaleBarcodeForProduct(product, barcode);
    if (scaleBarcodeMeta) {
      return {
        product,
        matchType: 'scale',
        scaleBarcodeMeta,
      };
    }
  }

  return null;
};
