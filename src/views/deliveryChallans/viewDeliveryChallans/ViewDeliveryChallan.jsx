'use client';

import React, { useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Print, Download, Edit } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import DocumentViewPreview, { compactDocumentLines, toDocumentAmount } from '@/components/shared/DocumentViewPreview';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDate } from '@/utils/dateUtils';
import { usePermission } from '@/Auth/usePermission';
import { getDeliveryChallanStatusOption } from '@/data/dataSets';

const getAddress = (...parts) => parts.filter(Boolean).join(', ');

const ViewDeliveryChallan = ({ deliveryChallanData, viewHandler }) => {
  const contentRef = useRef(null);
  const router = useRouter();
  const canEdit = usePermission('deliveryChallan', 'update');
  const canUpdate = usePermission('deliveryChallan', 'update');
  const isConverted = viewHandler?.isConverted;

  if (!deliveryChallanData) {
    return (
      <Box className="flex items-center justify-center h-96">
        <Typography variant="h6" color="text.secondary">
          Delivery challan not found
        </Typography>
      </Box>
    );
  }

  const handlePrint = () => viewHandler?.handlePrint?.();
  const handleEdit = () => viewHandler?.handleEdit?.();
  const handleConvert = () => viewHandler?.handleConvert?.();
  const handleDownloadPDF = () => viewHandler?.handleDownloadPDF?.();

  const statusOption = getDeliveryChallanStatusOption(deliveryChallanData?.status);

  const actionButtons = (
    <Box className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Box>
        <Typography variant="h5" className="font-semibold text-primary">
          Delivery Challan Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Delivery Challan: #{deliveryChallanData?.deliveryChallanNumber || 'N/A'}
        </Typography>
      </Box>

      <Box className="flex flex-row flex-wrap gap-2">
        <Button
          variant="outlined"
          onClick={() => router.back()}
          startIcon={<Icon icon="tabler:arrow-left" />}
        >
          Back to List
        </Button>
      {canEdit && !isConverted && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<Edit />}
          onClick={handleEdit}
        >
          Edit
        </Button>
      )}
      {canUpdate && !isConverted && (
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Icon icon="tabler:arrow-right" />}
          onClick={handleConvert}
        >
          Convert to Invoice
        </Button>
      )}
      <Button
        variant="outlined"
        startIcon={<Print />}
        onClick={handlePrint}
      >
        Print
      </Button>
      <Button
        variant="outlined"
        startIcon={<Download />}
        onClick={handleDownloadPDF}
      >
        Download
      </Button>
      </Box>
    </Box>
  );

  const customer = deliveryChallanData?.customerId || {};
  const deliveryAddress = deliveryChallanData?.deliveryAddress || {};

  const itemColumns = [
    { key: 'index', label: '#' },
    { key: 'item', label: 'Item' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit', label: 'Unit' },
    { key: 'price', label: 'Price' },
    { key: 'discount', label: 'Discount' },
    { key: 'tax', label: 'VAT' },
    { key: 'total', label: 'Total' },
  ];

  const itemRows = Array.isArray(deliveryChallanData?.items)
    ? deliveryChallanData.items.map((item, index) => ({
      key: item._id || `${deliveryChallanData?.deliveryChallanNumber || 'delivery-challan'}-${index}`,
      cells: [
        index + 1,
        item.name || 'Item',
        Number(item.quantity || 0),
        item.units || 'N/A',
        formatCurrency(item.rate || 0),
        item.discountType === 2 ? `${toDocumentAmount(item.discount)}%` : formatCurrency(item.discount || 0),
        `${toDocumentAmount(item.tax)}%`,
        formatCurrency(item.amount || 0),
      ],
    }))
    : [];

  return (
    <DocumentViewPreview
      actionBar={actionButtons}
      contentRef={contentRef}
      pageClassName="delivery-challan-page"
      documentTitle="DELIVERY CHALLAN"
      documentNumber={deliveryChallanData?.deliveryChallanNumber}
      metaRows={[
        { label: 'Challan Date', value: formatDate(deliveryChallanData?.deliveryChallanDate) },
        { label: 'Due Date', value: formatDate(deliveryChallanData?.dueDate) },
        { label: 'Reference No', value: deliveryChallanData?.referenceNo },
        { label: 'Status', value: statusOption.label },
      ]}
      leftSectionTitle="Customer:"
      leftLines={compactDocumentLines([
        customer?.name,
        customer?.email,
        customer?.phone,
      ])}
      rightSectionTitle="Deliver To:"
      rightLines={compactDocumentLines([
        getAddress(
          deliveryAddress.addressLine1,
          deliveryAddress.addressLine2,
          deliveryAddress.city,
          deliveryAddress.state,
          deliveryAddress.pincode
        ),
      ])}
      itemColumns={itemColumns}
      itemRows={itemRows}
      terms={deliveryChallanData?.termsAndCondition}
      notes={deliveryChallanData?.notes}
      summaryRows={[
        { label: 'Subtotal:', value: deliveryChallanData?.taxableAmount },
        { label: 'Discount:', value: deliveryChallanData?.totalDiscount },
        { label: 'VAT:', value: deliveryChallanData?.vat },
      ]}
      totalRow={{ label: 'Total:', value: deliveryChallanData?.TotalAmount }}
    />
  );
};

export default ViewDeliveryChallan;