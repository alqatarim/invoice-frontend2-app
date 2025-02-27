'use client';

import { useEffect, useState } from 'react';
import ViewPayment from '@/views/payments/viewPayment/ViewPayment';
import { Card, CardContent, CircularProgress, Typography } from '@mui/material';

const ViewPaymentIndex = ({ paymentData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (paymentData) {
      if (paymentData.success) {
        setPayment(paymentData.data);
      } else {
        setError(paymentData.message || 'Failed to load payment details');
      }
    }
    setLoading(false);
  }, [paymentData]);

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant='body1' color='error'>
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return <ViewPayment payment={payment} />;
};

export default ViewPaymentIndex;
