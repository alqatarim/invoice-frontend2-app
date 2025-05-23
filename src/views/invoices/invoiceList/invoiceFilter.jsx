// app/invoices/components/InvoiceFilter.jsx

import React from 'react';
import CustomFilter from '@/components/custom-components/CustomFilter';
import { statusOptions } from '@/data/dataSets';

/**
 * Stateless InvoiceFilter using CustomFilter
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {Object} props.values - Current filter values
 * @param {(field: string, value: any) => void} props.onChange
 * @param {() => void} props.onApply
 * @param {() => void} props.onReset
 * @param {Array<{ value: string, label: string }>} props.customerOptions
 * @param {Array<{ value: string, label: string }>} props.invoiceOptions
 */
function InvoiceFilter({
  open,
  onClose,
  values,
  onChange,
  onApply,
  onReset,
  customerOptions = [],
  invoiceOptions = [],
}) {
  const fields = [
    {
      name: 'customer',
      label: 'Customer',
      type: 'autocomplete',
      options: customerOptions,
      multiple: true,
      placeholder: 'Search Customer',
    },
    {
      name: 'invoiceNumber',
      label: 'Invoice Number',
      type: 'autocomplete',
      options: invoiceOptions,
      multiple: true,
      placeholder: 'Search Invoice Number',
    },
    {
      name: 'fromDate',
      label: 'From',
      type: 'date',
    },
    {
      name: 'toDate',
      label: 'To',
      type: 'date',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'checkbox',
      options: statusOptions,
      multiple: true,
    },
  ];

  return (
    <CustomFilter
      open={open}
      onClose={onClose}
      title="Filter Invoices"
      fields={fields}
      values={values}
      onChange={onChange}
      onApply={onApply}
      onReset={onReset}
    />
  );
}

export default InvoiceFilter;
