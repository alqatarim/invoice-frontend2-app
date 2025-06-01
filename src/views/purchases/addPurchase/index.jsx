'use client';

import { Snackbar, Alert } from '@mui/material';
import AddPurchase from '@/views/purchases/addPurchase/AddPurchase';

const AddPurchaseIndex = ({ vendors = [], products = [], taxRates = [], banks = [], signatures = [], units = [], purchaseNumber = '' }) => {
  return <AddPurchase 
    vendors={vendors} 
    products={products} 
    taxRates={taxRates} 
    banks={banks} 
    signatures={signatures} 
    units={units}
    purchaseNumber={purchaseNumber} 
  />;
};

export default AddPurchaseIndex;