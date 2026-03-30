'use client';

import { Box, Container, Paper } from '@mui/material';
import ViewDeliveryChallan from './ViewDeliveryChallan.jsx';

export default function ViewDeliveryChallanComponent({
  initialDeliveryChallanData = null,
  initialErrorMessage = '',
}) {
  if (initialErrorMessage) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3, textAlign: 'center', color: 'error.main' }}>
          {initialErrorMessage}
        </Paper>
      </Container>
    );
  }

  return (
    <Box>
      <ViewDeliveryChallan
        deliveryChallanData={initialDeliveryChallanData}
        isLoading={false}
      />
    </Box>
  );
}