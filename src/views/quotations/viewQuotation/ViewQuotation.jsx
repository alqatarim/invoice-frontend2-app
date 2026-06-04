'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import DocumentViewPreview, { compactDocumentLines, toDocumentAmount } from '@/components/shared/DocumentViewPreview';
import { getQuotationStatusOption, quotationStatusOptions, quotationStatusValues } from '@/data/dataSets';
import useQuotationViewHandlers from './handler';

const getAddress = (...parts) => parts.filter(Boolean).join(', ');

const ViewQuotation = ({
  quotationData,
  unitsList,
  productsList,
  onEdit,
  onDelete,
  onClone,
  onConvert,
  onStatusChange,
  enqueueSnackbar,
}) => {
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState(null);

  const handlers = useQuotationViewHandlers({
    quotationData,
    onEdit,
    onDelete,
    onClone,
    onConvert,
    onStatusChange,
    enqueueSnackbar,
  });

  const {
    handleEdit,
    handleDelete,
    handleClone,
    handleConvert,
    handleStatusChange,
    handlePrint,
    handleDownloadPDF,
    formatDate,
    formatCurrency,
  } = handlers;

  if (!quotationData) {
    return (
      <Box className="flex items-center justify-center h-96">
        <Typography variant="h6" color="text.secondary">
          Quotation not found
        </Typography>
      </Box>
    );
  }

  const statusOption = getQuotationStatusOption(quotationData.status);

  const getProductName = productId => {
    if (productId && typeof productId === 'object') {
      return productId.name || productId.productName || 'Item';
    }

    const product = productsList?.find(item => item._id === productId);
    return product?.name || productId;
  };

  const getUnitName = unitId => {
    if (unitId && typeof unitId === 'object') {
      return unitId.name || unitId.unitName || 'N/A';
    }

    const unit = unitsList?.find(item => item._id === unitId);
    return unit?.name || unitId;
  };

  const actionButtons = (
    <Box className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Box>
        <Typography variant="h5" className="font-semibold text-primary">
          Quotation Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quotation: #{quotationData.quotation_id || 'N/A'}
        </Typography>
      </Box>

      <Box className="flex flex-row flex-wrap gap-2">
        <Button component={Link} href="/quotations/quotation-list" variant="outlined" startIcon={<Icon icon="tabler:arrow-left" />}>
          Back to List
        </Button>
        <Button variant="contained" color="primary" startIcon={<Icon icon="tabler:edit" width={20} />} onClick={handleEdit}>
          Edit
        </Button>
        <Button variant="outlined" startIcon={<Icon icon="tabler:copy" width={20} />} onClick={handleClone}>
          Clone
        </Button>
        <Button variant="outlined" color="success" startIcon={<Icon icon="tabler:transform" width={20} />} onClick={handleConvert}>
          Convert
        </Button>
        <Button
          variant="outlined"
          startIcon={<Icon icon="tabler:status-change" width={20} />}
          onClick={event => setStatusMenuAnchorEl(event.currentTarget)}
        >
          Status
        </Button>
        <CustomIconButton variant="outlined" color="primary" onClick={handlePrint} size="medium">
          <Icon icon="tabler:printer" width={20} />
        </CustomIconButton>
        <CustomIconButton variant="outlined" color="primary" onClick={handleDownloadPDF} size="medium">
          <Icon icon="tabler:download" width={20} />
        </CustomIconButton>
        <CustomIconButton variant="outlined" color="error" onClick={handleDelete} size="medium">
          <Icon icon="tabler:trash" width={20} />
        </CustomIconButton>
      </Box>
    </Box>
  );

  const customer = quotationData.customerId || {};
  const customerAddress = customer.billingAddress || {};

  const itemColumns = [
    { key: 'index', label: '#' },
    { key: 'item', label: 'Item' },
    { key: 'unit', label: 'Unit' },
    { key: 'quantity', label: 'Qty' },
    { key: 'price', label: 'Price' },
    { key: 'discount', label: 'Discount' },
    { key: 'tax', label: 'VAT' },
    { key: 'total', label: 'Total' },
  ];

  const itemRows = Array.isArray(quotationData.items)
    ? quotationData.items.map((item, index) => ({
      key: item._id || `${quotationData.quotation_id || 'quotation'}-${index}`,
      cells: [
        index + 1,
        getProductName(item.productId) || item.name || 'Item',
        getUnitName(item.unit) || 'N/A',
        Number(item.quantity || 0),
        formatCurrency(item.rate || 0),
        formatCurrency(item.discount || 0),
        `${toDocumentAmount(item.tax)}%`,
        formatCurrency(item.amount || 0),
      ],
    }))
    : [];

  return (
    <>
      <Menu anchorEl={statusMenuAnchorEl} open={Boolean(statusMenuAnchorEl)} onClose={() => setStatusMenuAnchorEl(null)}>
        {quotationStatusOptions
          .filter(option => option.value !== quotationStatusValues.CONVERTED)
          .map(option => (
            <MenuItem
              key={option.value}
              onClick={() => {
                handleStatusChange(option.value);
                setStatusMenuAnchorEl(null);
              }}
            >
              {option.label}
            </MenuItem>
          ))}
      </Menu>

      <DocumentViewPreview
        actionBar={actionButtons}
        pageClassName="quotation-page"
        documentTitle="QUOTATION"
        documentNumber={quotationData.quotation_id}
        metaRows={[
          { label: 'Creation Date', value: formatDate(quotationData.quotation_date) },
          { label: 'Expiry Date', value: formatDate(quotationData.due_date) },
          { label: 'Status', value: statusOption.label },
        ]}
        leftSectionTitle="Quote To:"
        leftLines={compactDocumentLines([
          customer.name,
          getAddress(
            customerAddress.addressLine1,
            customerAddress.addressLine2,
            customerAddress.city,
            customerAddress.state,
            customerAddress.pincode
          ),
          customer.email,
          customer.phone,
        ])}
        rightSectionTitle="Quotation Details:"
        rightRows={[
          { label: 'Status:', value: statusOption.label },
          { label: 'Total:', value: formatCurrency(quotationData.TotalAmount || 0) },
        ]}
        itemColumns={itemColumns}
        itemRows={itemRows}
        terms={quotationData.termsAndCondition}
        notes={quotationData.notes}
        summaryRows={[
          { label: 'Subtotal:', value: quotationData.taxableAmount },
          { label: 'Discount:', value: quotationData.totalDiscount },
          { label: 'VAT:', value: quotationData.vat },
        ]}
        totalRow={{ label: 'Total:', value: quotationData.TotalAmount }}
      />
    </>
  );
};

export default ViewQuotation;
