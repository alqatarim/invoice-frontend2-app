import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import DocumentViewPreview, { compactDocumentLines, toDocumentAmount } from '@/components/shared/DocumentViewPreview';
import usePurchaseViewHandlers from './handler';

const getAddress = (...parts) => parts.filter(Boolean).join(', ');

const ViewPurchase = ({ purchaseData, onEdit, onDelete, onClone, onConvert, enqueueSnackbar, closeSnackbar }) => {
  const handlers = usePurchaseViewHandlers({
    purchaseData,
    onEdit,
    onDelete,
    onClone,
    onConvert,
    enqueueSnackbar,
    closeSnackbar,
  });

  const {
    handlePrint,
    handleDownloadPDF,
    handleEdit,
    handleDelete,
    handleClone,
    handleConvert,
    formatCurrency,
    formatDate,
  } = handlers;

  if (!purchaseData) {
    return (
      <Box className="flex items-center justify-center h-96">
        <Typography variant="h6" color="text.secondary">
          Purchase not found
        </Typography>
      </Box>
    );
  }

  const actionButtons = (
    <Box className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Box>
        <Typography variant="h5" className="font-semibold text-primary">
          Purchase Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Purchase: {purchaseData.purchaseId || 'N/A'}
        </Typography>
      </Box>

      <Box className="flex flex-row flex-wrap gap-2">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Icon icon="tabler:edit" width={20} />}
          onClick={handleEdit}
        >
          Edit
        </Button>

        <CustomIconButton
          variant="outlined"
          color="primary"
          onClick={handlePrint}
          size="medium"
        >
          <Icon icon="tabler:printer" width={20} />
        </CustomIconButton>

        <CustomIconButton
          variant="outlined"
          color="primary"
          onClick={handleDownloadPDF}
          size="medium"
        >
          <Icon icon="tabler:download" width={20} />
        </CustomIconButton>

        <CustomIconButton
          variant="outlined"
          color="secondary"
          onClick={handleClone}
          size="medium"
        >
          <Icon icon="tabler:copy" width={20} />
        </CustomIconButton>

        <CustomIconButton
          variant="outlined"
          color="success"
          onClick={handleConvert}
          size="medium"
        >
          <Icon icon="tabler:transform" width={20} />
        </CustomIconButton>

        <CustomIconButton
          variant="outlined"
          color="error"
          onClick={handleDelete}
          size="medium"
        >
          <Icon icon="tabler:trash" width={20} />
        </CustomIconButton>
      </Box>
    </Box>
  );

  const vendor = purchaseData.vendorDetails || {};
  const vendorAddress = vendor.billingAddress || {};

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

  const itemRows = Array.isArray(purchaseData.items)
    ? purchaseData.items.map((item, index) => ({
      key: item._id || `${purchaseData.purchaseId || 'purchase'}-${index}`,
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
      pageClassName="purchase-page"
      documentTitle="PURCHASE"
      documentNumber={purchaseData.purchaseId}
      metaRows={[
        { label: 'Purchase Date', value: formatDate(purchaseData.purchaseDate) },
        { label: 'Due Date', value: formatDate(purchaseData.dueDate) },
        { label: 'Status', value: purchaseData.status || 'Pending' },
      ]}
      leftSectionTitle="Vendor:"
      leftLines={compactDocumentLines([
        vendor.vendor_name,
        getAddress(
          vendorAddress.address_line_1 || vendorAddress.addressLine1,
          vendorAddress.city,
          vendorAddress.state,
          vendorAddress.pincode
        ),
        vendor.email,
        vendor.phone,
      ])}
      rightSectionTitle="Purchase Details:"
      rightRows={[
        { label: 'Payment:', value: purchaseData.payment_method },
        { label: 'Reference:', value: purchaseData.referenceNo },
        { label: 'Supplier Invoice:', value: purchaseData.supplierInvoiceSerialNumber },
      ]}
      itemColumns={itemColumns}
      itemRows={itemRows}
      terms={purchaseData.termsAndCondition}
      notes={purchaseData.notes}
      summaryRows={[
        { label: 'Subtotal:', value: purchaseData.taxableAmount },
        { label: 'Discount:', value: purchaseData.totalDiscount },
        { label: 'VAT:', value: purchaseData.vat },
      ]}
      totalRow={{ label: 'Total:', value: purchaseData.TotalAmount }}
    />
  );
};

export default ViewPurchase;