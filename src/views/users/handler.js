'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { resolveUserAvatarUrl } from '@/utils/defaultUserAvatar';
import { notifyNotistackFormValidationErrors } from '@/utils/notifyNotistackFormValidationErrors';
import { DEFAULT_USER_FORM_VALUES, getUserSchema } from './schema';
import {
  compileAccessRowsForSubmit,
  createEmptyAccessRow,
  userDataToAccessRows,
} from './userAccessCascade';

const getBase64 = file =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
  });

const prepareImagePayload = async file => {
  if (!file) return null;

  const base64 = await getBase64(file);

  return {
    base64,
    type: file.type,
    name: file.name,
  };
};

export const useUserHandler = ({
  mode = 'add',
  open,
  userId = null,
  onClose,
  onSave,
  initialUserData = null,
  initialRoles = [],
  initialBranches = [],
  initialLoading = false,
  initialError = null,
  initialSubmitting = false,
  onRetry,
}) => {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [userData, setUserData] = useState(null);
  const [fileImage, setFileImage] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loading = initialLoading;
  const error = initialError;
  const roles = initialRoles;
  const branches = initialBranches;
  const submitting = initialSubmitting || isSubmitting;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: isViewMode ? undefined : yupResolver(getUserSchema(isEditMode)),
    defaultValues: DEFAULT_USER_FORM_VALUES,
  });

  const watchedAccessRows = watch('accessRows');

  const branchOptions = useMemo(
    () =>
      (branches || []).map(branch => ({
        id: branch._id || branch.id,
        label: branch.name || branch.branchName || branch.storeName || branch.branchId || 'Store',
        raw: branch,
      })),
    [branches]
  );

  const resetFormState = useCallback(() => {
    reset(DEFAULT_USER_FORM_VALUES);
    setFileImage([]);
    setPreviewImage('');
    setImageRemoved(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setUserData(null);
  }, [reset]);

  const applyUserData = useCallback(
    nextUserData => {
      if (!nextUserData) {
        return;
      }

      const accessRows = userDataToAccessRows(nextUserData);
      const compiled = compileAccessRowsForSubmit(accessRows);
      const access = compiled.data || {};

      setUserData(nextUserData);
      reset({
        firstName: nextUserData.firstName || '',
        lastName: nextUserData.lastName || '',
        userName: nextUserData.userName || '',
        email: nextUserData.email || '',
        mobileNumber: nextUserData.mobileNumber || '',
        organizationalRole: access.organizationalRole || 'STORE_MEMBER',
        accessRows,
        password: '',
        confirmPassword: '',
        status: nextUserData.status || 'Active',
        gender: nextUserData.gender || '',
      });
      setPreviewImage(nextUserData.image || '');
      setFileImage([]);
      setImageRemoved(false);
    },
    [reset]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isViewMode || isEditMode) {
      if (initialUserData && typeof initialUserData === 'object') {
        applyUserData(initialUserData);
      } else if (!loading) {
        setUserData(null);
        setPreviewImage('');
        setFileImage([]);
        setImageRemoved(false);
      }

      return;
    }

    resetFormState();
  }, [applyUserData, initialUserData, isEditMode, isViewMode, loading, open, resetFormState]);

  useEffect(() => {
    if (isViewMode || !open || !Array.isArray(watchedAccessRows)) {
      return;
    }

    const organizationalRole = watchedAccessRows.find(row => row?.organizationalRole)?.organizationalRole;
    if (organizationalRole) {
      setValue('organizationalRole', organizationalRole);
    }
  }, [isViewMode, open, setValue, watchedAccessRows]);

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    disabled: isViewMode,
    accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    onDrop: acceptedFiles => {
      setFileImage(acceptedFiles);
      setImageRemoved(false);
      getBase64(acceptedFiles?.[0]).then(result => {
        setPreviewImage(result);
        setValue('image', acceptedFiles?.[0]);
      });
    },
  });

  const handleClose = useCallback(() => {
    if (submitting) {
      return;
    }

    resetFormState();
    onClose?.();
  }, [onClose, resetFormState, submitting]);

  const handleFormSubmit = useCallback(
    async formData => {
      setIsSubmitting(true);

      try {
        const compiled = compileAccessRowsForSubmit(formData.accessRows);
        if (compiled.error || !compiled.data) {
          const errorMessage = compiled.error || 'Invalid access configuration';
          closeSnackbar();
          enqueueSnackbar(errorMessage, {
            variant: 'error',
            autoHideDuration: 5000,
            preventDuplicate: true,
          });
          return { success: false, message: errorMessage };
        }

        const access = compiled.data;
        const preparedImage = await prepareImagePayload(fileImage[0]);
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          userName: formData.userName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          organizationalRole: access.organizationalRole,
          storeAssignments: access.storeAssignments,
          status: formData.status,
          gender: formData.gender,
          imageRemoved,
        };

        if (!isEditMode && formData.password) {
          payload.password = formData.password;
        }

        const result = await onSave?.({
          mode,
          userId: userId || userData?._id,
          userData: payload,
          preparedImage,
        });

        const success = result === true || result?.success;

        if (success) {
          resetFormState();
          onClose?.();
        }

        return result;
      } catch (submitError) {
        console.error(`Error ${isEditMode ? 'updating' : 'adding'} user:`, submitError);
        const errorMessage = submitError.message || 'Failed to save member';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      closeSnackbar,
      enqueueSnackbar,
      fileImage,
      imageRemoved,
      isEditMode,
      mode,
      onClose,
      onSave,
      resetFormState,
      userData?._id,
      userId,
    ]
  );

  const handleFormError = useCallback(
    formErrors => {
      notifyNotistackFormValidationErrors({
        errors: formErrors,
        closeSnackbar,
        enqueueSnackbar,
        getValues,
        itemFieldKey: 'accessRows',
        getItemLabel: (_, index) => `Role ${index + 1}`,
        delayMs: 0,
      });
    },
    [closeSnackbar, enqueueSnackbar, getValues]
  );

  const handleRemoveImage = useCallback(() => {
    setPreviewImage(
      resolveUserAvatarUrl({
        image: '',
        defaultAvatar: userData?.defaultAvatar || '',
        userId: userData?._id || '',
      })
    );
    setFileImage([]);
    setImageRemoved(true);
    setValue('image', null);
  }, [setValue, userData?._id, userData?.defaultAvatar]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const appendAccessRow = useCallback(() => {
    const rows = watchedAccessRows || [];
    const organizationalRole = rows[0]?.organizationalRole || 'STORE_MEMBER';
    setValue('accessRows', [
      ...rows,
      createEmptyAccessRow({
        organizationalRole,
        isPrimary: false,
      }),
    ]);
  }, [setValue, watchedAccessRows]);

  return {
    mode,
    control,
    handleSubmit,
    errors,
    isSubmitting: submitting,
    handleFormSubmit,
    handleFormError,
    fileImage,
    previewImage,
    imageRemoved,
    showPassword,
    showConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    getRootProps,
    getInputProps,
    handleRemoveImage,
    loading,
    error,
    handleClose,
    retryLoad: onRetry,
    roles,
    branchOptions,
    appendAccessRow,
    setValue,
    userData,
    isViewMode,
    isEditMode,
  };
};
