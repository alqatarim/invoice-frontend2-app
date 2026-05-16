'use client';

const DEFAULT_ITEM_FIELD_KEY = 'items';

const defaultGetItemLabel = (item, index) => item?.name || `Item ${index + 1}`;

export function notifyNotistackFormValidationErrors({
  errors,
  closeSnackbar,
  enqueueSnackbar,
  getValues,
  itemFieldKey = DEFAULT_ITEM_FIELD_KEY,
  getItemLabel = defaultGetItemLabel,
  delayMs = 200,
}) {
  closeSnackbar();

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
            key: `error-${itemFieldKey}-${Date.now()}`,
          });
        }

        if (!Array.isArray(error)) return;

        error.forEach((itemError, index) => {
          if (!itemError) return;

          const itemLabel = getItemLabel(itemValues[index], index);

          Object.entries(itemError).forEach(([fieldKey, fieldError]) => {
            if (!fieldError?.message) return;

            enqueueSnackbar(`${itemLabel}: ${fieldError.message}`, {
              variant: 'error',
              preventDuplicate: true,
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
          key: `error-${key}-${Date.now()}`,
        });
      }
    });
  }, delayMs);
}
