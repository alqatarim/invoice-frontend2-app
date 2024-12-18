'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import EditPurchaseOrder from './EditPurchaseOrder';
import {
  getPurchaseOrderDetails,
  updatePurchaseOrder,
  getVendors,
  getProducts,
  getTaxRates,
  getBanks,
  getSignatures
} from '@/app/(dashboard)/purchase-orders/actions';

const EditPurchaseOrderIndex = ({ orderId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [banks, setBanks] = useState([]);
  const [signatures, setSignatures] = useState([]);

  const [dropdownData, setDropdownData] = useState({
    vendors: [],
    products: [],
    taxRates: [],
    banks: [],
    signatures: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          orderResponse,
          vendorsData,
          productsData,
          taxRatesData,
          banksData,
          signaturesData
        ] = await Promise.all([
          getPurchaseOrderDetails(orderId),
          getVendors(),
          getProducts(),
          getTaxRates(),
          getBanks(),
          getSignatures()
        ]);

        if (!orderResponse.success) {
          throw new Error(orderResponse.message || 'Failed to fetch order details');
        }

        setOrderData(orderResponse.data);
        setVendors(vendorsData);
        setProducts(productsData);
        setTaxRates(taxRatesData);
        setBanks(banksData);
        setSignatures(signaturesData);

        setDropdownData({
          vendors: vendorsData,
          products: productsData,
          taxRates: taxRatesData,
          banks: banksData,
          signatures: signaturesData
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleSave = async (data, signatureURL) => {
    try {
      const response = await updatePurchaseOrder(orderId, data, signatureURL);
      return response;
    } catch (err) {
      console.error('Error updating purchase order:', err);
      return { success: false, message: err.message || 'Failed to update purchase order' };
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !orderData) {
    return (
      <Box className="p-4">
        <div className="text-red-500">
          {error || 'Failed to load purchase order data'}
        </div>
      </Box>
    );
  }

  return (
    <EditPurchaseOrder
      orderData={orderData}
      products={products}
      vendors={vendors}
      taxRates={taxRates}
      banks={banks}
      signatures={signatures}
      onSave={handleSave}
    />
  );
};

export default EditPurchaseOrderIndex;