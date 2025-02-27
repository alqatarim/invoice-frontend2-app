'use client';

import EditPayment from './EditPayment';
import { Card } from '@mui/material';

const EditPaymentContainer = ({ paymentData }) => {
  return (
    <Card>
      <EditPayment payment={paymentData} />
    </Card>
  );
};

export default EditPaymentContainer;
