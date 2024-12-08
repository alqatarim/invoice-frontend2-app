'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { PurchaseOrderSchema } from '../addOrder/PurchaseOrderSchema';
import SignaturePad from '@/components/SignaturePad';
import dayjs from 'dayjs';

const EditPurchaseOrder = ({ initialData, dropdownData, onSave }) => {
  const router = useRouter();
  const [items, setItems] = useState(initialData.items || []);
  const [selectedProducts, setSelectedProducts] = useState(
    initialData.items?.map(item => item.productId) || []
  );
  const [signatureData, setSignatureData] = useState(initialData.signatureData || null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(PurchaseOrderSchema),
    defaultValues: {
      vendorId: { value: initialData.vendorId, label: initialData.vendorInfo?.vendor_name },
      purchaseOrderDate: dayjs(initialData.purchaseOrderDate),
      dueDate: dayjs(initialData.dueDate),
      referenceNo: initialData.referenceNo,
      items: initialData.items,
      bank: initialData.bank ? { value: initialData.bank._id, label: initialData.bank.bankName } : null,
      notes: initialData.notes,
      termsAndCondition: initialData.termsAndCondition,
      sign_type: initialData.sign_type || 'eSignature',
      signatureName: initialData.signatureName,
      signatureId: initialData.signatureId ? { value: initialData.signatureId, label: 'Saved Signature' } : null
    }
  });

  // Reuse the same helper functions from AddPurchaseOrder
  const calculateTotals = (items) => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const amount = item.quantity * item.rate;
      subtotal += amount;
      totalTax += (amount * (item.tax || 0)) / 100;
      totalDiscount += (amount * (item.discount || 0)) / 100;
    });

    return {
      subtotal,
      totalTax,
      totalDiscount,
      total: subtotal + totalTax - totalDiscount
    };
  };

  const handleAddItem = () => {
    setItems([...items, {
      productId: '',
      quantity: 1,
      rate: 0,
      tax: 0,
      discount: 0
    }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    const removedProduct = newItems[index].productId;
    newItems.splice(index, 1);
    setItems(newItems);
    setValue('items', newItems);
    setSelectedProducts(selectedProducts.filter(id => id !== removedProduct));
  };

  const handleProductChange = (index, productId) => {
    const product = dropdownData.products.find(p => p._id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        productId: product._id,
        rate: product.sellingPrice,
        tax: product.tax?.taxRate || 0
      };
      setItems(newItems);
      setValue(`items.${index}`, newItems[index]);
      setSelectedProducts([...selectedProducts, product._id]);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append basic fields
      formData.append('vendorId', data.vendorId.value);
      formData.append('purchaseOrderDate', data.purchaseOrderDate.toISOString());
      formData.append('dueDate', data.dueDate.toISOString());
      formData.append('referenceNo', data.referenceNo || '');

      // Append items
      data.items.forEach((item, index) => {
        Object.keys(item).forEach(key => {
          formData.append(`items[${index}][${key}]`, item[key]);
        });
      });

      // Append other fields
      if (data.bank?.value) {
        formData.append('bank', data.bank.value);
      }
      formData.append('notes', data.notes || '');
      formData.append('termsAndCondition', data.termsAndCondition || '');
      formData.append('sign_type', data.sign_type);

      if (data.sign_type === 'eSignature') {
        formData.append('signatureName', data.signatureName);
        formData.append('signatureData', signatureData || initialData.signatureData);
      } else {
        formData.append('signatureId', data.signatureId.value);
      }

      const response = await onSave(formData);
      if (response.success) {
        toast.success('Purchase order updated successfully');
        router.push('/purchase-orders/order-list');
      } else {
        toast.error(response.message || 'Error updating purchase order');
      }
    } catch (error) {
      toast.error('Error updating purchase order');
      console.error(error);
    }
  };

  // Render the same form structure as AddPurchaseOrder
  // Just change the submit button text to "Update Purchase Order"
  return (
    <Box className="flex flex-col gap-4 p-4">
      <Typography variant="h5" color="primary">
        Edit Purchase Order
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Reuse the same form structure as AddPurchaseOrder */}
        {/* Just change the submit button text */}
        <Card>
          <CardContent>
            {/* Copy the form content from AddPurchaseOrder */}
            {/* Change only the submit button text */}
            <Box className="mt-6 flex justify-end gap-2">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => router.push('/purchase-orders/order-list')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Update Purchase Order
              </Button>
            </Box>
          </CardContent>
        </Card>
      </form>
    </Box>
  );
};

export default EditPurchaseOrder;