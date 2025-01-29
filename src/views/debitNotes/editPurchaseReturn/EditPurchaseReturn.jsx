'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomIconButtonTwo from '@core/components/mui/CustomIconButtonTwo';

// MUI Components
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Skeleton,
  Divider,
  Modal,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';

// MUI Icons
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// MUI Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Other Dependencies
import SignaturePad from 'react-signature-canvas';
import dayjs from 'dayjs';

// Local Imports
import { EditPurchaseReturnSchema } from './EditPurchaseReturnSchema';

// Calculation Functions
function calculateItemValues(item) {
  if (!item) return { rate: 0, discountValue: 0, tax: 0, amount: 0 };

  const quantity = Number(item.quantity) || 1;
  const purchasePrice = Number(parseFloat(item.purchasePrice || item.rate).toFixed(2)) || 0;
  const rate = parseFloat((purchasePrice * quantity).toFixed(2));
  let discountValue = 0;

  // Calculate discount based on type
  if (parseInt(item.discountType) === 2) { // percentage discount
    discountValue = parseFloat(((Number(item.discount) / 100) * rate).toFixed(2));
  } else { // fixed discount
    discountValue = parseFloat(Number(item.discount || 0).toFixed(2));
  }

  // Calculate tax
  const taxRate = Number(item.taxInfo?.taxRate || item.tax || 0);
  const discountedAmount = parseFloat((rate - discountValue).toFixed(2));
  const tax = parseFloat(((taxRate / 100) * discountedAmount).toFixed(2));

  // Calculate final amount
  const amount = parseFloat((discountedAmount + tax).toFixed(2));

  return {
    rate,
    tax,
    discountValue,
    amount
  };
}

function calculateTotals(items) {
  let subtotal = 0;
  let totalDiscount = 0;
  let vat = 0;
  let total = 0;

  items.forEach((item) => {
    subtotal += Number(item.rate) || 0;
    totalDiscount += Number(item.discount) || 0;
    vat += Number(item.tax) || 0;
    total += Number(item.amount) || 0;
  });

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

const EditPurchaseReturn = ({
  debitNoteData,
  products,
  vendors,
  taxRates,
  banks,
  signatures,
  onSave
}) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [items, setItems] = useState(debitNoteData?.items || []);
  const signaturePadRef = useRef(null);
  const [signType, setSignType] = useState(debitNoteData?.sign_type || 'eSignature');
  const [signatureDataURL, setSignatureDataURL] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(
    debitNoteData?.sign_type === 'manualSignature' ? debitNoteData?.signatureId?.signatureImage : null
  );
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [snackbars, setSnackbars] = useState([]);

  // Initialize productsCloneData excluding products already in the debit note
  const [productsCloneData, setProductsCloneData] = useState(() => {
    try {
      if (!Array.isArray(products)) return [];
      if (!Array.isArray(debitNoteData?.items)) return [...products];

      const existingProductIds = new Set(debitNoteData.items.map(item => item.productId));
      return products.filter(product => !existingProductIds.has(product._id));
    } catch (error) {
      console.error('Error initializing productsCloneData:', error);
      return [];
    }
  });

  // Initialize form with existing debit note data
  const { control, handleSubmit, watch, setValue, trigger, formState: { errors }, register } = useForm({
    resolver: yupResolver(EditPurchaseReturnSchema),
    mode: 'onChange',
    defaultValues: {
      debitNoteId: debitNoteData?.debitNoteId || '',
      vendorId: debitNoteData?.vendorId?._id || '',
      debitNoteDate: dayjs(debitNoteData?.debitNoteDate),
      dueDate: dayjs(debitNoteData?.dueDate),
      referenceNo: debitNoteData?.referenceNo || '',
      bank: debitNoteData?.bank?._id || '',
      notes: debitNoteData?.notes || '',
      termsAndCondition: debitNoteData?.termsAndCondition || '',
      sign_type: debitNoteData?.sign_type || '',
      signatureId: debitNoteData?.signatureId?._id || '',
      items: debitNoteData?.items || []
    }
  });

  // Initialize totals from existing debit note data
  const [totals, setTotals] = useState(() => {
    if (!debitNoteData?.items) return { subtotal: 0, totalDiscount: 0, vat: 0, total: 0 };
    return calculateTotals(debitNoteData.items);
  });

  // Handle adding new product to debit note
  const handleProductChange = (productId) => {
    try {
      if (!productId) return;

      const selectedProduct = products.find(product => product._id === productId);
      if (!selectedProduct) return;

      const newItem = {
        key: Date.now(),
        productId: selectedProduct._id,
        name: selectedProduct.name,
        quantity: 1,
        rate: selectedProduct.sellingPrice,
        purchasePrice: selectedProduct.sellingPrice,
        discount: 0,
        discountType: 2,
        tax: selectedProduct.tax?.taxRate || 0,
        taxInfo: selectedProduct.tax,
        amount: selectedProduct.sellingPrice,
        units: selectedProduct.units,
        unit: selectedProduct.unit
      };

      setItems(prev => [...prev, newItem]);
      setSelectedProduct('');
      setProductsCloneData(prev => prev.filter(p => p._id !== productId));
      setTotals(calculateTotals([...items, newItem]));

    } catch (error) {
      console.error('Error handling product change:', error);
      setSnackbars(prev => [...prev, {
        id: Date.now(),
        message: 'Error adding product. Please try again.',
        severity: 'error'
      }]);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const isFormValid = await trigger();
      if (!isFormValid) {
        console.error('Form validation failed:', errors);
        return;
      }

      setIsLoading(true);

      // Prepare signature data
      let signatureData = null;
      if (signType === 'eSignature' && signaturePadRef.current) {
        signatureData = signaturePadRef.current.toDataURL();
      } else if (signType === 'manualSignature') {
        signatureData = selectedSignature;
      }

      // Prepare the final data
      const finalData = {
        _id: debitNoteData._id,
        debitNoteId: data.debitNoteId,
        vendorId: data.vendorId,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          rate: item.rate,
          discount: item.discount,
          discountType: item.discountType,
          tax: item.tax,
          taxInfo: item.taxInfo,
          amount: item.amount,
          units: item.units,
          unit: item.unit
        })),
        debitNoteDate: data.debitNoteDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        referenceNo: data.referenceNo,
        bank: data.bank,
        notes: data.notes,
        termsAndCondition: data.termsAndCondition,
        sign_type: signType,
        signatureId: data.signatureId,
        totalAmount: totals.total
      };

      const response = await onSave(finalData, signatureData);

      if (response.success) {
        router.push('/debitNotes/purchaseReturn-list');
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbars(prev => [...prev, {
        id: Date.now(),
        message: error.message || 'Error saving debit note',
        severity: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item deletion
  const handleDeleteItem = (itemToDelete) => {
    setItems(prev => prev.filter(item => item.key !== itemToDelete.key));
    if (itemToDelete.productId) {
      const productToAdd = products.find(p => p._id === itemToDelete.productId);
      if (productToAdd) {
        setProductsCloneData(prev => [...prev, productToAdd]);
      }
    }
    setTotals(calculateTotals(items.filter(item => item.key !== itemToDelete.key)));
  };

  // Handle item edit
  const handleEditItem = (item) => {
    setEditModalData(item);
    setOpenEditModal(true);
  };

  // Handle edit modal save
  const handleEditModalSave = (editedItem) => {
    setItems(prev => prev.map(item =>
      item.key === editedItem.key ? { ...item, ...editedItem } : item
    ));
    setTotals(calculateTotals(items.map(item =>
      item.key === editedItem.key ? { ...item, ...editedItem } : item
    )));
    setOpenEditModal(false);
  };

  return (
    <Box className="p-4">
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Form content will go here */}
            {/* This will include all the form fields, product table, signature section, etc. */}
            {/* I can provide the complete form implementation if needed */}
          </form>
        </CardContent>
      </Card>

      {/* Snackbar notifications */}
      {snackbars.map(snackbar => (
        <Snackbar
          key={snackbar.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => setSnackbars(prev => prev.filter(s => s.id !== snackbar.id))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbars(prev => prev.filter(s => s.id !== snackbar.id))}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}

      {/* Edit Modal */}
      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        maxWidth="md"
        fullWidth
      >
        {/* Edit modal content will go here */}
        {/* This will include fields to edit item details */}
      </Dialog>

      {/* Signature Dialog */}
      <Dialog
        open={showSignatureDialog}
        onClose={() => setShowSignatureDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {/* Signature dialog content will go here */}
        {/* This will include signature pad or signature selection */}
      </Dialog>
    </Box>
  );
};

export default EditPurchaseReturn;