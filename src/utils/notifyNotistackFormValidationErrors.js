'use client';

const DEFAULT_ITEM_FIELD_KEY = 'items';

const defaultGetItemLabel = (item, index) => item?.name || `Item ${index + 1}`;

const INTERNAL_ITEM_FIELD_KEYS = new Set([
  'form_updated_rate',
  'form_updated_discount',
  'form_updated_discounttype',
  'form_updated_tax',
  'isRateFormUpadted',
  'key',
  'images',
  'promotionMeta',
  'promotionAutoApplied',
  'promotionSummary',
  'scaleBarcodeMeta',
  'scaleBarcodeSummary',
  'taxableAmount',
  'barcode',
  'unit',
]);

const getValidationMessage = (fieldError) => {
  const message = String(fieldError?.message || '').trim();
  if (!message) return null;

  if (
    message.includes('form_updated_')
    || message.includes('isRateFormUpadted')
    || /must be a `number` type, but the final value was: `NaN`/i.test(message)
  ) {
    return null;
  }

  return message;
};

export function notifyNotistackFormValidationErrors({
  errors,
  closeSnackbar,
  enqueueSnackbar,
  getValues,
  itemFieldKey = DEFAULT_ITEM_FIELD_KEY,
  getItemLabel = defaultGetItemLabel,
  delayMs = 200,
}) {
  closeSnackbar?.();

  setTimeout(() => {
    const errorEntries = Object.entries(errors || {});
    if (errorEntries.length === 0) return;

    const formValues = getValues();
    const itemValues = Array.isArray(formValues?.[itemFieldKey]) ? formValues[itemFieldKey] : [];

    errorEntries.forEach(([key, error]) => {
      if (key === itemFieldKey) {
        if (error?.message) {
          enqueueSnackbar(error.message, {
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: 5000,
            key: `error-${itemFieldKey}-${Date.now()}`,
          });
        }

        if (!Array.isArray(error)) return;

        error.forEach((itemError, index) => {
          if (!itemError) return;

          const itemLabel = getItemLabel(itemValues[index], index);

          Object.entries(itemError).forEach(([fieldKey, fieldError]) => {
            if (INTERNAL_ITEM_FIELD_KEYS.has(fieldKey)) return;

            const message = getValidationMessage(fieldError);
            if (!message) return;

            enqueueSnackbar(`${itemLabel}: ${message}`, {
              variant: 'error',
              preventDuplicate: true,
              autoHideDuration: 5000,
              key: `error-${itemFieldKey}-${index}-${fieldKey}-${Date.now()}`,
            });
          });
        });

        return;
      }

      if (error?.message) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true,
          autoHideDuration: 5000,
          key: `error-${key}-${Date.now()}`,
        });
      }
    });
  }, delayMs);
}
