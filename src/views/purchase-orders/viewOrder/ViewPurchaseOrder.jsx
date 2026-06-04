import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import DocumentViewPreview, { compactDocumentLines, toDocumentAmount } from '@/components/shared/DocumentViewPreview';
import usePurchaseOrderViewHandlers, { getPurchaseOrderStatusOption } from './handler';

const getAddress = (...parts) => parts.filter(Boolean).join(', ');

const ViewPurchaseOrder = ({ purchaseOrderData, onEdit, onDelete, onClone, onConvert, enqueueSnackbar, closeSnackbar }) => {
  const handlers = usePurchaseOrderViewHandlers({
    purchaseOrderData,
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

  if (!purchaseOrderData) {
    return (
      <Box className="flex items-center justify-center h-96">
        <Typography variant="h6" color="text.secondary">
          Purchase order not found
        </Typography>
      </Box>
    );
  }

  const statusOption = getPurchaseOrderStatusOption(purchaseOrderData.status);

  const actionButtons = (
    <Box className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Box>
        <Typography variant="h5" className="font-semibold text-primary">
          Purchase Order Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Purchase Order: {purchaseOrderData.purchaseOrderId || 'N/A'}
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

  const vendor = purchaseOrderData.vendorDetails || {};
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

  const itemRows = Array.isArray(purchaseOrderData.items)
    ? purchaseOrderData.items.map((item, index) => ({
      key: item._id || `${purchaseOrderData.purchaseOrderId || 'purchase-order'}-${index}`,
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
      pageClassName="purchase-order-page"
      documentTitle="PURCHASE ORDER"
      documentNumber={purchaseOrderData.purchaseOrderId}
      metaRows={[
        { label: 'Order Date', value: formatDate(purchaseOrderData.purchaseOrderDate) },
        { label: 'Due Date', value: formatDate(purchaseOrderData.dueDate) },
        { label: 'Status', value: statusOption.label },
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
      rightSectionTitle="Order Details:"
      rightRows={[
        { label: 'Payment:', value: purchaseOrderData.paymentMode || purchaseOrderData.payment_method },
        { label: 'Reference:', value: purchaseOrderData.referenceNo },
        { label: 'Status:', value: statusOption.label },
      ]}
      itemColumns={itemColumns}
      itemRows={itemRows}
      terms={purchaseOrderData.termsAndCondition}
      notes={purchaseOrderData.notes}
      summaryRows={[
        { label: 'Subtotal:', value: purchaseOrderData.taxableAmount },
        { label: 'Discount:', value: purchaseOrderData.totalDiscount },
        { label: 'VAT:', value: purchaseOrderData.vat },
      ]}
      totalRow={{ label: 'Total:', value: purchaseOrderData.TotalAmount }}
    />
  );
};

export default ViewPurchaseOrder;