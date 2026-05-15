'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { discountTypes, productTypes } from '@/data/dataSets';
import { getDropdownData, getProductById } from '@/app/(dashboard)/products/actions';
import { validateProductImage } from '@/utils/fileUtils';
import { buildProductDescription, parseProductDescription } from '@/utils/productMeta';
import { normalizeScaleBarcodeConfig } from '@/utils/productScaleBarcode';
import { useProductAdvancedForm, useProductFormSections } from '@/views/products/product';

const editProductSchema = yup.object().shape({
  type: yup.string().required('Type is required'),
  name: yup.string().required('Product name is required').min(2, 'Product name must be at least 2 characters'),
  category: yup.string().required('Category is required'),
  sellingPrice: yup.number().required('Selling price is required').positive('Selling price must be positive'),
  purchasePrice: yup.number().required('Purchase price is required').positive('Purchase price must be positive'),
  discountValue: yup.number().min(0, 'Discount value must be non-negative'),
  discountType: yup.mixed(),
  units: yup.string().required('Unit is required'),
  barcode: yup.string(),
  alertQuantity: yup.number().min(0, 'Alert quantity must be non-negative'),
  tax: yup.string(),
  productDescription: yup.string(),
});

const emptyDropdownData = { units: [], categories: [], taxes: [] };
const defaultFormValues = {
  type: 'product',
  name: '',
  sku: '',
  category: '',
  sellingPrice: '',
  purchasePrice: '',
  discountValue: 0,
  discountType: 2,
  units: '',
  barcode: '',
  alertQuantity: '',
  tax: '',
  productDescription: '',
};

export default function useEditProductViewHandler({
  productId,
  initialProductData = null,
  initialDropdownData = emptyDropdownData,
  onClose,
  onSave,
}) {
  const [productData, setProductData] = useState(initialProductData);
  const [dropdownData, setDropdownData] = useState(initialDropdownData || emptyDropdownData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialProductData?.images || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const sectionState = useProductFormSections();
  const {
    sections,
    setSectionExpanded,
    resetSections,
  } = sectionState;

  const advanced = useProductAdvancedForm({
    units: dropdownData.units || [],
  });
  const {
    applyMetaToState,
    resetAdvancedFields,
    scaleBarcodeConfig,
    scaleBarcodeError,
    setScaleBarcodeError,
    buildProductMeta,
  } = advanced;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editProductSchema),
    defaultValues: defaultFormValues,
  });

  const applyProductToForm = useCallback((nextProductData) => {
    const parsed = parseProductDescription(nextProductData?.productDescription || '');

    setImagePreview(nextProductData?.images || null);
    setSelectedFile(null);
    setImageError('');

    reset({
      type: nextProductData?.type || 'product',
      name: nextProductData?.name || '',
      sku: nextProductData?.sku || '',
      category: nextProductData?.category?._id || nextProductData?.category || '',
      sellingPrice: nextProductData?.sellingPrice || '',
      purchasePrice: nextProductData?.purchasePrice || '',
      discountValue: nextProductData?.discountValue || 0,
      discountType: nextProductData?.discountType || 2,
      units: nextProductData?.units?._id || nextProductData?.units || '',
      barcode: nextProductData?.barcode || '',
      alertQuantity: nextProductData?.alertQuantity || '',
      tax: nextProductData?.tax?._id || nextProductData?.tax || '',
      productDescription: parsed.description || '',
    });

    applyMetaToState(parsed.meta || {});
  }, [applyMetaToState, reset]);

  const resetViewState = useCallback(() => {
    reset(defaultFormValues);
    setProductData(null);
    setDropdownData(initialDropdownData || emptyDropdownData);
    setError(null);
    setImagePreview(null);
    setSelectedFile(null);
    setImageError('');
    setIsDragging(false);
    resetAdvancedFields();
    resetSections();
  }, [initialDropdownData, reset, resetAdvancedFields, resetSections]);

  const handleClose = useCallback(() => {
    resetViewState();
    onClose();
  }, [onClose, resetViewState]);

  const fetchData = useCallback(async () => {
    if (!productId) return;

    const canUseInitialProduct = initialProductData && initialProductData._id === productId;
    const canUseInitialDropdowns =
      (initialDropdownData?.units || []).length > 0 ||
      (initialDropdownData?.categories || []).length > 0 ||
      (initialDropdownData?.taxes || []).length > 0;

    if (canUseInitialProduct && canUseInitialDropdowns) {
      setProductData(initialProductData);
      setDropdownData(initialDropdownData);
      setError(null);
      applyProductToForm(initialProductData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productPromise = canUseInitialProduct
        ? Promise.resolve(initialProductData)
        : getProductById(productId);
      const dropdownPromise = getDropdownData();

      const [productResponse, dropdownResponse] = await Promise.all([productPromise, dropdownPromise]);

      if (!productResponse || typeof productResponse !== 'object') {
        throw new Error('Invalid product data received');
      }

      setProductData(productResponse);
      applyProductToForm(productResponse);

      if (dropdownResponse?.success) {
        setDropdownData(dropdownResponse.data || emptyDropdownData);
      } else {
        setDropdownData(emptyDropdownData);
      }
    } catch (fetchError) {
      console.error('Failed to fetch data:', fetchError);
      setError(fetchError.message || 'Failed to load product data');
      setProductData(null);
    } finally {
      setLoading(false);
    }
  }, [applyProductToForm, initialDropdownData, initialProductData, productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (Object.keys(errors).length > 0 && !sections.productDetails) {
      setSectionExpanded('productDetails', true);
    }
  }, [errors, sections.productDetails, setSectionExpanded]);

  useEffect(() => {
    if (scaleBarcodeError) {
      setSectionExpanded('scaleBarcode', true);
    }
  }, [scaleBarcodeError, setSectionExpanded]);

  const handleImageChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = await validateProductImage(file);
    if (validation.isValid) {
      setImagePreview(validation.preview);
      setSelectedFile(file);
      setImageError('');
      return;
    }

    setImageError(validation.error);
    setImagePreview(productData?.images || null);
    setSelectedFile(null);
  }, [productData]);

  const handleImageError = useCallback(() => {
    setImagePreview(null);
    setImageError('');
  }, []);

  const handleImageDelete = useCallback(() => {
    setImagePreview(null);
    setSelectedFile(null);
    setImageError('');
  }, []);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please drop an image file (PNG, JPG, etc.)');
      return;
    }

    const validation = await validateProductImage(file);
    if (validation.isValid) {
      setImagePreview(validation.preview);
      setSelectedFile(file);
      setImageError('');
      return;
    }

    setImageError(validation.error);
    setImagePreview(productData?.images || null);
    setSelectedFile(null);
  }, [productData]);

  const prepareImagePayload = useCallback(async () => {
    if (!selectedFile) return null;

    const reader = new FileReader();
    const base64 = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(selectedFile);
    });

    return {
      base64,
      type: selectedFile.type,
      name: selectedFile.name,
    };
  }, [selectedFile]);

  const handleFormSubmit = useCallback(async (data) => {
    setIsSubmitting(true);

    try {
      const scaleBarcodeMeta = normalizeScaleBarcodeConfig(scaleBarcodeConfig);
      if (scaleBarcodeConfig.enabled && !scaleBarcodeMeta) {
        setScaleBarcodeError(
          'Enter both a barcode prefix and PLU code before saving scale barcode settings.'
        );
        return { success: false };
      }

      const preparedImage = await prepareImagePayload();
      const { images, ...productPayload } = data;
      const metaPayload = buildProductMeta();
      const productDescription = buildProductDescription(productPayload.productDescription || '', metaPayload);
      const result = await onSave(productId, { ...productPayload, productDescription }, preparedImage);

      if (result?.success) {
        handleClose();
      }

      return result;
    } catch (submitError) {
      console.error('Error updating product:', submitError);
      return { success: false, message: submitError.message || 'Failed to update product' };
    } finally {
      setIsSubmitting(false);
    }
  }, [buildProductMeta, handleClose, onSave, prepareImagePayload, productId, scaleBarcodeConfig, setScaleBarcodeError]);

  return {
    title: 'Edit Product',
    submitButtonLabel: 'Update',
    loading,
    error,
    productData,
    dropdownData,
    control,
    handleSubmit,
    errors,
    watch,
    productTypes,
    discountTypes,
    isSubmitting,
    handleFormSubmit,
    handleClose,
    retryLoad: fetchData,
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
    advanced,
    sectionState,
  };
}
