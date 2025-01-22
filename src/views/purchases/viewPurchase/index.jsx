'use client';

import { useEffect, useState } from 'react';
import { deletePurchase, getPurchaseDetails, getUnits } from '@/app/(dashboard)/purchases/actions';
import ViewPurchase from '@/views/purchases/viewPurchase/ViewPurchase';

const PurchaseViewIndex = ({ id }) => {
  const [purchaseData, setPurchaseData] = useState(null);
  const [unitsList, setUnitsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchaseResponse, unitsResponse] = await Promise.all([
          getPurchaseDetails(id),
          getUnits()
        ]);

        if (purchaseResponse.success) {
          setPurchaseData(purchaseResponse);
          setUnitsList(unitsResponse);
        } else {
          setError('Failed to fetch purchase details');
        }
      } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      unitsList={unitsList}
      onDelete={handleDelete}
    />
  );
};

export default PurchaseViewIndex;