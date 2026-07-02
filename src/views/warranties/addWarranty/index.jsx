'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import AddWarranty from './AddWarranty';
import { createWarranty, getWarrantyCreationOptions } from '@/app/(dashboard)/warranties/actions';

const EMPTY_OPTIONS = {
  products: [],
  policies: [],
  customers: [],
};

const AddWarrantyIndex = ({ open, onClose, onCreated }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const onError = useCallback(message => {
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: true,
    });
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!open) return;

    let ignore = false;

    const loadOptions = async () => {
      setOptionsLoading(true);
      const response = await getWarrantyCreationOptions();

      if (ignore) return;

      setOptionsLoading(false);

      if (!response.success) {
        onError(response.message || 'Failed to load warranty form options');
        setOptions(EMPTY_OPTIONS);
        return;
      }

      setOptions(response.data || EMPTY_OPTIONS);
    };

    loadOptions();

    return () => {
      ignore = true;
    };
  }, [onError, open]);

  const onSuccess = useCallback(message => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 3000,
    });
  }, [enqueueSnackbar]);

  const handleSave = useCallback(async data => {
    const loadingKey = enqueueSnackbar('Creating warranty...', {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      const response = await createWarranty(data);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to create warranty';
        onError(message);
        return { success: false, message };
      }

      onSuccess(response.message || 'Warranty created successfully');
      onCreated?.(response.data);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to create warranty';
      closeSnackbar(loadingKey);
      onError(message);
      return { success: false, message };
    }
  }, [closeSnackbar, enqueueSnackbar, onCreated, onError, onSuccess]);

  return (
    <AddWarranty
      open={open}
      onClose={onClose}
      onSave={handleSave}
      onError={onError}
      options={options}
      optionsLoading={optionsLoading}
    />
  );
};

export default AddWarrantyIndex;
