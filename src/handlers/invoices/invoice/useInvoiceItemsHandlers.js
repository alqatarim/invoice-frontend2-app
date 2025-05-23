import { useState } from 'react';
import { calculateItemValues } from '@/utils/itemCalculations';
import { formatInvoiceItem } from '@/utils/formatNewSellItem';
export function useInvoiceItemsHandlers({ control, setValue, getValues, append, remove, productData, enqueueSnackbar, closeSnackbar, setProductsCloneData }) {
  // Discount menu state
  const [discountMenu, setDiscountMenu] = useState({ anchorEl: null, rowIndex: null });
  // Tax menu state
  const [taxMenu, setTaxMenu] = useState({ anchorEl: null, rowIndex: null });

  // Helper to update all calculated fields for an item row
  const updateCalculatedFields = (index, values) => {
    const computed = calculateItemValues(values);
    setValue(`items.${index}.rate`, computed.rate);
    setValue(`items.${index}.discount`, computed.discount);
    setValue(`items.${index}.tax`, computed.tax);
    setValue(`items.${index}.amount`, computed.amount);
    setValue(`items.${index}.taxableAmount`, computed.taxableAmount);
  };

  // Discount menu handlers
  const handleMenuOpen = (event, index) => {
    setDiscountMenu({ anchorEl: event.currentTarget, rowIndex: index });
  };
  const handleMenuClose = () => {
    setDiscountMenu({ anchorEl: null, rowIndex: null });
  };
  const handleMenuItemClick = (index, newValue) => {
    if (newValue !== null) {
      setValue(`items.${index}.discountType`, newValue);
      setValue(`items.${index}.form_updated_discounttype`, newValue);
      setValue(`items.${index}.isRateFormUpadted`, true);
      const item = getValues(`items.${index}`);
      updateCalculatedFields(index, item);
    }
    handleMenuClose();
  };

  // Tax menu handlers
  const handleTaxClick = (event, index) => {
    setTaxMenu({ anchorEl: event.currentTarget, rowIndex: index });
  };
  const handleTaxClose = () => {
    setTaxMenu({ anchorEl: null, rowIndex: null });
  };
  const handleTaxMenuItemClick = (index, tax) => {
    setValue(`items.${index}.taxInfo`, tax);
    setValue(`items.${index}.tax`, Number(tax.taxRate || 0));
    setValue(`items.${index}.form_updated_tax`, Number(tax.taxRate || 0));
    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item);
    handleTaxClose();
  };

  // Product update handler
  const handleUpdateItemProduct = (index, productId, previousProductId) => {
    if (!productId) {
      closeSnackbar();
      enqueueSnackbar('Please select a product', { variant: 'error' });
      return;
    }
    const product = productData.find((p) => p._id === productId);
    if (!product) {
      closeSnackbar();
      enqueueSnackbar('Invalid product selected', { variant: 'error' });
      return;
    }
    const newData = formatInvoiceItem(product);
    if (!newData) {
      closeSnackbar();
      enqueueSnackbar('Error formatting product data', { variant: 'error' });
      return;
    }
    Object.keys(newData).forEach(key => {
      setValue(`items.${index}.${key}`, newData[key]);
    });
    if (setProductsCloneData) {
      setProductsCloneData(prev => {
        let updatedProducts = [...prev];
        if (previousProductId) {
          const previousProduct = productData.find(p => p._id === previousProductId);
          if (previousProduct) {
            updatedProducts.push(previousProduct);
          }
        }
        return updatedProducts.filter(p => p._id !== productId);
      });
    }
  };

  // Delete item handler
  const handleDeleteItem = (index) => {
    const currentItems = getValues('items');
    const deletedItem = currentItems[index];
    remove(index);
    if (deletedItem && deletedItem.productId && setProductsCloneData) {
      const product = productData.find((p) => p._id === deletedItem.productId);
      if (product) {
        setProductsCloneData((prev) => [...prev, product]);
      }
    }
  };

  // Add empty row handler
  const handleAddEmptyRow = () => {
    append({
      productId: '',
      name: '',
      units: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 2,
      tax: 0,
      taxInfo: {
        _id: '',
        name: '',
        taxRate: 0
      },
      amount: 0,
      taxableAmount: 0,
      key: Date.now(),
      isRateFormUpadted: false,
      form_updated_rate: '',
      form_updated_discount: '',
      form_updated_discounttype: '',
      form_updated_tax: ''
    });
  };

  return {
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    updateCalculatedFields,
    handleMenuOpen,
    handleMenuClose,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow
  };
}