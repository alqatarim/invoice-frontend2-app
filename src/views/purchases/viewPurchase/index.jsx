'use client';

import { useEffect, useState } from 'react';
import { deletePurchase, getPurchaseDetails } from '@/app/(dashboard)/purchases/actions';
import ViewPurchase from '@/views/purchases/viewPurchase/ViewPurchase';

const PurchaseViewIndex = ({ id }) => {
  const [purchaseData, setPurchaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        const response = await getPurchaseDetails(id);
        if (response.success) {
          setPurchaseData(response);
        } else {
          setError('Failed to fetch purchase details');
        }
      } catch (error) {
        setError('Error fetching purchase details');
        console.error('Error fetching purchase details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseData();
  }, [id]);

  const handleDelete = async (id) => {
    try {
      const response = await deletePurchase(id);
      return response.success;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      return false;
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Consider using a proper loading component
  }

  if (error) {
    return <div>{error}</div>; // Consider using a proper error component
  }

  return (
    <ViewPurchase
      purchaseData={purchaseData}
      onDelete={handleDelete}
    />
  );
};

export default PurchaseViewIndex;