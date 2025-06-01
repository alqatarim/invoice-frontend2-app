'use client'

import { useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { addDebitNote, getDebitNoteNumber } from '@/app/(dashboard)/debitNotes/actions';

/**
 * Main handler for Purchase Return add functionality
 */
export function usePurchaseReturnAddHandlers({ 
  vendors = [], 
  products = [], 
  taxRates = [], 
  banks = [], 
  signatures = [] 
}) {
  const router = useRouter();
  const signatureRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    debit_note_id: '',
    vendorId: '',
    purchaseOrderDate: dayjs(),
    dueDate: dayjs().add(30, 'day'),
    referenceNo: '',
    items: [],
    taxableAmount: 0,
    totalDiscount: 0,
    vat: 0,
    TotalAmount: 0,
    bank: null,
    notes: '',
    termsAndCondition: '',
    roundOff: false,
    sign_type: 'eSignature',
    signatureId: '',
    signatureName: '',
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Generate debit note number on mount
  const generateDebitNoteNumber = useCallback(async () => {
    try {
      const response = await getDebitNoteNumber();
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          debit_note_id: response.data.debitNoteNumber
        }));
      }
    } catch (error) {
      console.error('Error generating debit note number:', error);
      toast.error('Failed to generate debit note number');
    }
  }, []);

  // Form field handlers
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Item management
  const handleAddItem = useCallback((product) => {
    const newItem = {
      productId: product._id,
      name: product.name,
      quantity: 1,
      unit: product.units?.name || 'pcs',
      rate: product.purchasePrice || 0,
      discount: 0,
      discountType: 1, // fixed
      tax: product.tax?.taxRate || 0,
      taxInfo: product.tax || null,
      amount: product.purchasePrice || 0
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    // Close product dialog
    setProductDialogOpen(false);
  }, []);

  const handleRemoveItem = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  const handleItemChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        isRateFormUpadted: field === 'rate' ? true : newItems[index].isRateFormUpadted,
        form_updated_rate: field === 'rate' ? value : newItems[index].form_updated_rate,
        form_updated_discount: field === 'discount' ? value : newItems[index].form_updated_discount,
        form_updated_discounttype: field === 'discountType' ? value : newItems[index].form_updated_discounttype,
        form_updated_tax: field === 'tax' ? value : newItems[index].form_updated_tax,
      };
      
      // Recalculate item amount
      const item = newItems[index];
      const quantity = Number(item.quantity) || 1;
      const baseRate = item.isRateFormUpadted ? item.form_updated_rate : item.rate;
      const rate = parseFloat((baseRate * quantity).toFixed(2));

      // Calculate discount
      const discountType = item.isRateFormUpadted ? item.form_updated_discounttype : item.discountType;
      const discountValue = item.isRateFormUpadted ? item.form_updated_discount : item.discount;
      
      let calculatedDiscount;
      if (parseInt(discountType) === 2) { // percentage
        calculatedDiscount = parseFloat((rate * (discountValue / 100)).toFixed(2));
      } else { // fixed
        calculatedDiscount = parseFloat(Number(discountValue).toFixed(2));
      }

      // Calculate tax
      const taxRate = item.isRateFormUpadted ? item.form_updated_tax : (item.taxInfo?.taxRate || item.tax || 0);
      const discountedAmount = parseFloat((rate - calculatedDiscount).toFixed(2));
      const tax = parseFloat((discountedAmount * (taxRate / 100)).toFixed(2));

      // Calculate final amount
      const amount = parseFloat((discountedAmount + tax).toFixed(2));

      newItems[index].amount = amount;

      return {
        ...prev,
        items: newItems
      };
    });
  }, []);

  // Calculations
  const calculations = useMemo(() => {
    const items = formData.items || [];
    
    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 1;
      const rate = item.isRateFormUpadted ? item.form_updated_rate : item.rate;
      return sum + (rate * quantity);
    }, 0);

    const totalDiscount = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 1;
      const rate = item.isRateFormUpadted ? item.form_updated_rate : item.rate;
      const baseAmount = rate * quantity;
      const discountType = item.isRateFormUpadted ? item.form_updated_discounttype : item.discountType;
      const discountValue = item.isRateFormUpadted ? item.form_updated_discount : item.discount;
      
      if (parseInt(discountType) === 2) { // percentage
        return sum + (baseAmount * (discountValue / 100));
      } else { // fixed
        return sum + Number(discountValue);
      }
    }, 0);

    const taxableAmount = subtotal - totalDiscount;
    
    const totalTax = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 1;
      const rate = item.isRateFormUpadted ? item.form_updated_rate : item.rate;
      const baseAmount = rate * quantity;
      const discountType = item.isRateFormUpadted ? item.form_updated_discounttype : item.discountType;
      const discountValue = item.isRateFormUpadted ? item.form_updated_discount : item.discount;
      
      let itemDiscount;
      if (parseInt(discountType) === 2) { // percentage
        itemDiscount = baseAmount * (discountValue / 100);
      } else { // fixed
        itemDiscount = Number(discountValue);
      }
      
      const taxRate = item.isRateFormUpadted ? item.form_updated_tax : (item.taxInfo?.taxRate || item.tax || 0);
      const discountedAmount = baseAmount - itemDiscount;
      return sum + (discountedAmount * (taxRate / 100));
    }, 0);

    const totalAmount = taxableAmount + totalTax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
  }, [formData.items]);

  // Update form with calculations
  const updateCalculations = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      taxableAmount: calculations.taxableAmount,
      totalDiscount: calculations.totalDiscount,
      vat: calculations.totalTax,
      TotalAmount: calculations.totalAmount
    }));
  }, [calculations]);

  // Signature handling
  const handleSignatureClear = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  }, []);

  const getSignatureData = useCallback(() => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      return signatureRef.current.toDataURL();
    }
    return null;
  }, []);

  // Form submission
  const handleSubmit = useCallback(async (validatedData) => {
    setIsSubmitting(true);
    
    try {
      // Get signature if eSignature is selected
      let signatureURL = null;
      if (formData.sign_type === 'eSignature') {
        signatureURL = getSignatureData();
        if (!signatureURL) {
          toast.error('Please provide a signature');
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        ...validatedData,
        items: formData.items,
        taxableAmount: calculations.taxableAmount,
        totalDiscount: calculations.totalDiscount,
        vat: calculations.totalTax,
        TotalAmount: calculations.totalAmount,
        purchaseOrderDate: formData.purchaseOrderDate.toISOString(),
        dueDate: formData.dueDate.toISOString(),
      };

      const response = await addDebitNote(submissionData, signatureURL);

      if (response.success) {
        toast.success('Purchase return created successfully');
        router.push('/debitNotes/purchaseReturn-list');
      } else {
        throw new Error(response.message || 'Failed to create purchase return');
      }
    } catch (error) {
      console.error('Error creating purchase return:', error);
      toast.error(error.message || 'Failed to create purchase return');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, calculations, getSignatureData, router]);

  // Dialog handlers
  const handleProductDialogOpen = useCallback(() => {
    setProductDialogOpen(true);
  }, []);

  const handleProductDialogClose = useCallback(() => {
    setProductDialogOpen(false);
    setSelectedProducts([]);
  }, []);

  const handleBankDialogOpen = useCallback(() => {
    setBankDialogOpen(true);
  }, []);

  const handleBankDialogClose = useCallback(() => {
    setBankDialogOpen(false);
  }, []);

  return {
    // State
    formData,
    isSubmitting,
    productDialogOpen,
    bankDialogOpen,
    signatureDialogOpen,
    selectedProducts,
    calculations,
    signatureRef,

    // Handlers
    handleFieldChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleSubmit,
    handleSignatureClear,
    generateDebitNoteNumber,
    updateCalculations,

    // Dialog handlers
    handleProductDialogOpen,
    handleProductDialogClose,
    handleBankDialogOpen,
    handleBankDialogClose,
    setSignatureDialogOpen,
    setSelectedProducts,

    // Data
    vendors,
    products,
    taxRates,
    banks,
    signatures,
  };
}