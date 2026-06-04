'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import DocumentViewPreview, { compactDocumentLines, toDocumentAmount } from '@/components/shared/DocumentViewPreview';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDate } from '@/utils/dateUtils';
import useDebitNoteViewHandlers from './handler';

const getAddress = (...parts) => parts.filter(Boolean).join(', ');

const ViewDebitNote = ({ debitNoteData, loading, onEdit, onDelete, onClone, enqueueSnackbar, closeSnackbar }) => {
  const contentRef = useRef(null);

  const handlers = useDebitNoteViewHandlers({
    debitNoteData,
    onEdit,
    onDelete,
    onClone,
    enqueueSnackbar,
    closeSnackbar,
  });

  const { handleEdit, handleDelete, handleClone, handlePrint, handleDownloadPDF } = handlers;

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      const pages = contentElement.querySelectorAll('.debit-note-page');
      pages.forEach((page) => {
        const pageHeight = page.offsetHeight;
        if (pageHeight > 1123) {
          // Handle content overflow if needed
        }
      });
    }
  }, []);

  const vendor = debitNoteData?.vendorId || debitNoteData?.vendorDetails || {};
  const vendorAddress = vendor?.billingAddress || {};
  const bank = debitNoteData?.bank && typeof debitNoteData.bank === 'object' ? debitNoteData.bank : null;

  const itemColumns = [
    { key: 'index', label: '#' },
    { key: 'item', label: 'Item' },
    { key: 'quantity', label: 'Qty' },
    { key: 'price', label: 'Price' },
    { key: 'discount', label: 'Discount' },
    { key: 'tax', label: 'VAT' },
    { key: 'total', label: 'Total' },
  ];

  const itemRows = Array.isArray(debitNoteData?.items)
    ? debitNoteData.items.map((item, index) => ({
      key: item._id || `${item.productId?._id || item.productId || 'debit-note-item'}-${index}`,
      cells: [
        index + 1,
        item.name || item.productId?.name || 'Item',
        Number(item.quantity || 0),
        formatCurrency(item.rate || 0),
        formatCurrency(item.discountValue ?? item.discount ?? 0),
        item.taxInfo?.taxRate !== undefined
          ? `${toDocumentAmount(item.taxInfo.taxRate)}%`
          : `${toDocumentAmount(item.tax)}%`,
        formatCurrency(item.amount || 0),
      ],
    }))
    : [];

  const actionBar = (
    <Box className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Box className="flex items-center gap-3">
        <Box className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
          <Icon icon="tabler:file-minus" className="text-2xl text-white" />
        </Box>
        <Box>
          <Typography variant="h5" className="font-semibold text-primary">
            Debit Note Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Debit Note: {debitNoteData?.debit_note_id || 'N/A'}
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-wrap gap-2">
        <Button
          component={Link}
          href="/debitNotes/purchaseReturn-list"
          variant="outlined"
          startIcon={<ArrowBack />}
        >
          Back to List
        </Button>
        <Button variant="contained" color="primary" startIcon={<Icon icon="tabler:edit" width={20} />} onClick={handleEdit}>
          Edit
        </Button>
        <CustomIconButton variant="outlined" color="primary" onClick={handlePrint} size="medium">
          <Icon icon="tabler:printer" width={20} />
        </CustomIconButton>
        <CustomIconButton variant="outlined" color="primary" onClick={handleDownloadPDF} size="medium">
          <Icon icon="tabler:download" width={20} />
        </CustomIconButton>
        <CustomIconButton variant="outlined" color="secondary" onClick={handleClone} size="medium">
          <Icon icon="tabler:copy" width={20} />
        </CustomIconButton>
        <CustomIconButton variant="outlined" color="error" onClick={handleDelete} size="medium">
          <Icon icon="tabler:trash" width={20} />
        </CustomIconButton>
      </Box>
    </Box>
  );

  return (
    <DocumentViewPreview
      actionBar={actionBar}
      contentRef={contentRef}
      loading={loading}
      pageClassName="debit-note-page"
      logoCaption="Store details"
      documentTitle="DEBIT NOTE"
      documentNumber={debitNoteData?.debit_note_id}
      metaRows={[
        { label: 'Debit Note Date', value: formatDate(debitNoteData?.purchaseOrderDate) },
        { label: 'Due Date', value: formatDate(debitNoteData?.dueDate) },
        { label: 'Status', value: debitNoteData?.status || 'Draft' },
      ]}
      leftSectionTitle="Return To:"
      leftLines={compactDocumentLines([
        vendor?.vendor_name || vendor?.name,
        getAddress(
          vendorAddress.street || vendorAddress.address_line_1 || vendorAddress.addressLine1,
          vendorAddress.city,
          vendorAddress.state,
          vendorAddress.pincode || vendorAddress.postalCode
        ),
        vendor?.vendor_email || vendor?.email,
        vendor?.vendor_phone || vendor?.phone,
      ])}
      rightSectionTitle="Pay From:"
      rightRows={[
        { label: 'Name:', value: bank?.name },
        { label: 'Bank Name:', value: bank?.bankName },
        { label: 'Account No:', value: bank?.accountNumber },
        { label: 'Branch:', value: bank?.branch },
      ]}
      itemColumns={itemColumns}
      itemRows={itemRows}
      terms={debitNoteData?.termsAndCondition}
      notes={debitNoteData?.notes}
      summaryRows={[
        { label: 'Subtotal:', value: debitNoteData?.taxableAmount },
        { label: 'Discount:', value: debitNoteData?.totalDiscount },
        { label: 'VAT:', value: debitNoteData?.vat },
        { label: 'Round Off:', value: debitNoteData?.roundOffValue },
      ]}
      totalRow={{ label: 'Total:', value: debitNoteData?.TotalAmount }}
    />
  );
};

export default ViewDebitNote;