'use client';

import React from 'react';
import DocumentViewPreview, { compactDocumentLines, toDocumentAmount } from '@/components/shared/DocumentViewPreview';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDate } from '@/utils/dateUtils';

const getAddress = (...parts) => parts.filter(Boolean).join(', ');

const ViewInvoice = ({
  invoiceData,
  companyData,
  invoiceLogo,
  previewId,
}) => {
  const customer = invoiceData?.customerId || null;
  const walkInCustomer = invoiceData?.walkInCustomer || null;
  const customerAddress = customer?.billingAddress || {};
  const companyAddress = companyData || {};
  const paidAmount = toDocumentAmount(invoiceData?.paidAmount);
  const totalAmount = toDocumentAmount(invoiceData?.TotalAmount);
  const balanceAmount = Math.max(totalAmount - paidAmount, 0);
  const cashierName =
    invoiceData?.cashierId?.fullname ||
    [invoiceData?.cashierId?.firstName, invoiceData?.cashierId?.lastName].filter(Boolean).join(' ') ||
    invoiceData?.cashierId?.userName ||
    invoiceData?.cashierId?.email ||
    '';

  const itemColumns = [
    { key: 'index', label: '#' },
    { key: 'item', label: 'Item' },
    { key: 'quantity', label: 'Qty' },
    { key: 'price', label: 'Price' },
    { key: 'discount', label: 'Discount' },
    { key: 'tax', label: 'VAT' },
    { key: 'total', label: 'Total' },
  ];

  const itemRows = Array.isArray(invoiceData?.items)
    ? invoiceData.items.map((item, index) => ({
      key: item._id || `${invoiceData?.invoiceNumber || 'invoice'}-${index}`,
      cells: [
        index + 1,
        item.name || 'Item',
        Number(item.quantity || 0),
        formatCurrency(item.rate || 0),
        formatCurrency(item.discount || 0),
        formatCurrency(item.tax || 0),
        formatCurrency(item.amount || 0),
      ],
    }))
    : [];

  return (
    <DocumentViewPreview
      previewId={previewId}
      pageClassName="invoice-page"
      logoSrc={'/images/illustrations/objects/store-2.png'}
      // logoSrc={invoiceLogo || companyData?.companyLogo || '/images/illustrations/objects/store-2.png'}
      logoCaption={companyData?.companyName || 'Store details'}
      documentTitle="Invoice"
      documentNumber={invoiceData?.invoiceNumber}
      metaRows={[
        { label: 'Invoice Date', value: formatDate(invoiceData?.invoiceDate) },
        { label: 'Due Date', value: formatDate(invoiceData?.dueDate) },
        // { label: 'Status', value: invoiceData?.status || 'DRAFTED' },
        { label: 'Payment', value: invoiceData?.payment_method },
        // { label: 'Reference', value: invoiceData?.referenceNo },
        { label: 'Cashier', value: cashierName },
      ]}
      leftSectionTitle="From:"
      leftLines={compactDocumentLines([
        companyData?.companyName || 'Company',
        getAddress(
          companyAddress.addressLine1,
          companyAddress.addressLine2,
          companyAddress.city,
          companyAddress.state,
          companyAddress.country,
          companyAddress.postalCode || companyAddress.pincode
        ),
        companyData?.email,
        companyData?.phone,
      ])}
      rightSectionTitle="Bill To:"
      rightLines={compactDocumentLines([
        customer?.name || walkInCustomer?.name || (invoiceData?.isWalkIn ? 'Walk-in Customer' : ''),
        getAddress(
          customerAddress.addressLine1,
          customerAddress.addressLine2,
          customerAddress.city,
          customerAddress.state,
          customerAddress.country,
          customerAddress.pincode
        ),
        customer?.email || walkInCustomer?.email,
        customer?.phone || walkInCustomer?.phone,
      ])}
      itemColumns={itemColumns}
      itemRows={itemRows}
      emptyItemsMessage="No invoice items found."
      terms={invoiceData?.termsAndCondition}
      notes={invoiceData?.notes}
      summaryRows={[
        { label: 'Subtotal:', value: invoiceData?.taxableAmount },
        { label: 'Discount:', value: invoiceData?.totalDiscount },
        { label: 'VAT:', value: invoiceData?.vat },
      ]}
      totalRow={{ label: 'Total:', value: invoiceData?.TotalAmount }}
      footerSummaryRows={[
        { label: 'Paid:', value: paidAmount },
        { label: 'Balance:', value: balanceAmount, strong: true },
      ]}
    />
  );
};

export default ViewInvoice;
