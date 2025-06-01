import * as yup from 'yup';

// Schema for individual sales return item
const salesReturnItemSchema = yup.object().shape({
  productId: yup.string().required('Product is required'),
  name: yup.string().required('Product name is required'),
  quantity: yup.number()
    .min(1, 'Quantity must be at least 1')
    .required('Quantity is required'),
  units: yup.string(),
  rate: yup.number()
    .min(0, 'Rate cannot be negative')
    .required('Rate is required'),
  discount: yup.number()
    .min(0, 'Discount cannot be negative'),
  discountType: yup.number(),
  tax: yup.number()
    .min(0, 'Tax cannot be negative'),
  taxInfo: yup.object(),
  amount: yup.number()
    .min(0, 'Amount cannot be negative'),
  form_updated_rate: yup.number(),
  form_updated_discount: yup.number(),
  form_updated_discounttype: yup.number(),
  form_updated_tax: yup.number(),
  isRateFormUpadted: yup.mixed()
});

// Main sales return schema
export const salesReturnSchema = yup.object().shape({
  salesReturnNumber: yup.string().required('Sales return number is required'),
  salesReturnDate: yup.date()
    .max(new Date(), 'Sales return date cannot be in the future')
    .required('Sales return date is required'),
  dueDate: yup.date()
    .min(yup.ref('salesReturnDate'), 'Due date cannot be before sales return date')
    .required('Due date is required'),
  customerId: yup.string().required('Customer is required'),
  bank: yup.string().required('Bank is required'),
  payment_method: yup.string().required('Payment method is required'),
  referenceNo: yup.string(),
  taxableAmount: yup.number()
    .min(0, 'Taxable amount cannot be negative'),
  TotalAmount: yup.number()
    .min(0, 'Total amount cannot be negative'),
  vat: yup.number()
    .min(0, 'VAT cannot be negative'),
  totalDiscount: yup.number()
    .min(0, 'Total discount cannot be negative'),
  roundOff: yup.boolean(),
  roundOffValue: yup.number(),
  sign_type: yup.string().oneOf(['eSignature', 'manualSignature']),
  signatureName: yup.string(),
  signatureId: yup.string()
    .when('sign_type', {
      is: 'manualSignature',
      then: (schema) => schema.required('Signature is required'),
      otherwise: (schema) => schema
    }),
  signatureImage: yup.string(),
  notes: yup.string(),
  termsAndCondition: yup.string(),
  items: yup.array()
    .of(salesReturnItemSchema)
    .min(1, 'At least one item is required')
    .required('Items are required')
});

// Schema for editing sales return (similar but with id field)
export const editSalesReturnSchema = salesReturnSchema.shape({
  id: yup.string().required('Sales return ID is required'),
  credit_note_id: yup.string().required('Credit note ID is required')
});