import { useState } from 'react';
import { calculatePurchaseItemValues } from '@/utils/purchaseItemCalculations';
import { formatNewBuyItem } from '@/utils/formatNewBuyItem';

export function useItemsHandler({
  control,
  setValue,
  getValues,
  append,
  remove,
  productData,
  enqueueSnackbar,
  closeSnackbar,
  productsCloneData,
  setProductsCloneData
}) {
  const [discountMenu, setDiscountMenu] = useState({ anchorEl: null, rowIndex: null });
  const [taxMenu, setTaxMenu] = useState({ anchorEl: null, rowIndex: null });

  const updateCalculatedFields = (index, item, setValue) => {
    const calculated = calculatePurchaseItemValues(item);

    setValue(`items.${index}.rate`, calculated.rate);
    setValue(`items.${index}.discount`, calculated.discount);
    setValue(`items.${index}.tax`, calculated.tax);
    setValue(`items.${index}.amount`, calculated.amount);
    setValue(`items.${index}.taxableAmount`, calculated.taxableAmount);
  };

  const handleUpdateItemProduct = (index, productId, previousProductId) => {
    const product = productData.find(p => p._id === productId);

    if (!product) {
      setValue(`items.${index}.productId`, '');
      return;
    }

    // Update form fields with product data
    setValue(`items.${index}.productId`, productId);
    setValue(`items.${index}.name`, product.name);
    setValue(`items.${index}.units`, product.units?.name || '');
    setValue(`items.${index}.rate`, product.purchasePrice || product.sellingPrice || 0);
    setValue(`items.${index}.form_updated_rate`, product.purchasePrice || product.sellingPrice || 0);
    setValue(`items.${index}.discountType`, product.discountType || 3);
    setValue(`items.${index}.form_updated_discounttype`, product.discountType || 3);
    setValue(`items.${index}.discount`, product.discountValue || 0);
    setValue(`items.${index}.form_updated_discount`, product.discountValue || 0);
    setValue(`items.${index}.taxInfo`, product.tax || { taxRate: 0 });
    setValue(`items.${index}.form_updated_tax`, product.tax?.taxRate || 0);
    setValue(`items.${index}.isRateFormUpadted`, false);

    // Set default quantity if not set
    const currentQuantity = getValues(`items.${index}.quantity`);
    if (!currentQuantity) {
      setValue(`items.${index}.quantity`, 1);
    }

    // Update calculated fields
    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item, setValue);

    // Update available products
    const updatedProducts = productsCloneData.filter(p => p._id !== productId);
    if (previousProductId) {
      const prevProduct = productData.find(p => p._id === previousProductId);
      if (prevProduct) {
        updatedProducts.push(prevProduct);
      }
    }
    setProductsCloneData(updatedProducts);
  };

  const handleDeleteItem = (index) => {
    const item = getValues(`items.${index}`);
    if (item.productId) {
      const product = productData.find(p => p._id === item.productId);
      if (product) {
        setProductsCloneData([...productsCloneData, product]);
      }
    }
    remove(index);
  };

  const handleAddEmptyRow = () => {
    append(formatNewBuyItem());
  };

  const handleMenuItemClick = (index, discountType) => {
    setValue(`items.${index}.discountType`, discountType);
    setValue(`items.${index}.form_updated_discounttype`, discountType);
    setValue(`items.${index}.isRateFormUpadted`, true);

    if (discountType === 2) {
      setValue(`items.${index}.form_updated_discount`, 0);
    } else {
      setValue(`items.${index}.discount`, 0);
    }

    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item, setValue);
  };

  const handleTaxClick = (event, index) => {
    setTaxMenu({ anchorEl: event.currentTarget, rowIndex: index });
  };

  const handleTaxClose = () => {
    setTaxMenu({ anchorEl: null, rowIndex: null });
  };

  const handleTaxMenuItemClick = (index, tax) => {
    setValue(`items.${index}.taxInfo`, tax);
    setValue(`items.${index}.form_updated_tax`, tax.taxRate);
    setValue(`items.${index}.isRateFormUpadted`, true);

    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item, setValue);
    handleTaxClose();
  };

  return {
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick
  };
}