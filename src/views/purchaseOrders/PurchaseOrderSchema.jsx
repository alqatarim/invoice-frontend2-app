import * as yup from 'yup';

// Schema for individual purchase order item
const purchaseOrderItemSchema = yup.object().shape({
  productId: yup.string().required('Product is required'),
  name: yup.string().required('Product name is required'),
  quantity: yup.number()
    .min(1, 'Quantity must be at least 1')
    .required('Quantity is required')
    .typeError('Quantity must be a number'),
  units: yup.string(),
  unit_id: yup.string(),
  rate: yup.number()
    .min(0, 'Rate cannot be negative')
    .required('Rate is required')
    .typeError('Rate must be a number'),
  discount: yup.number()
    .min(0, 'Discount cannot be negative')
    .typeError('Discount must be a number'),
  discountType: yup.number()
    .oneOf([2, 3], 'Invalid discount type'),
  tax: yup.number()
    .min(0, 'Tax cannot be negative')
    .typeError('Tax must be a number'),
  taxInfo: yup.object().shape({
    taxRate: yup.number().min(0, 'Tax rate cannot be negative')
  }),
  amount: yup.number()
    .min(0, 'Amount cannot be negative')
    .typeError('Amount must be a number'),
  form_updated_rate: yup.number(),
  form_updated_discount: yup.number(),
  form_updated_discounttype: yup.number(),
  form_updated_tax: yup.number(),
  isRateFormUpadted: yup.mixed()
});

// Main purchase order schema for adding new purchase orders
export const purchaseOrderSchema = yup.object().shape({
  purchaseOrderId: yup.string().required('Purchase order number is required'),
  purchaseOrderDate: yup.date()
    .max(new Date(), 'Purchase order date cannot be in the future')
    .required('Purchase order date is required')
    .typeError('Invalid date format'),
  dueDate: yup.date()
    .min(yup.ref('purchaseOrderDate'), 'Due date cannot be before purchase order date')
    .required('Due date is required')
    .typeError('Invalid date format'),
  vendorId: yup.string().required('Vendor is required'),
  bank: yup.string(),
  paymentMode: yup.string(),
  referenceNo: yup.string(),
  taxableAmount: yup.number()
    .min(0, 'Taxable amount cannot be negative')
    .typeError('Taxable amount must be a number'),
  TotalAmount: yup.number()
    .min(0, 'Total amount cannot be negative')
    .typeError('Total amount must be a number'),
  vat: yup.number()
    .min(0, 'VAT cannot be negative')
    .typeError('VAT must be a number'),
  totalDiscount: yup.number()
    .min(0, 'Total discount cannot be negative')
    .typeError('Total discount must be a number'),
  roundOff: yup.boolean(),
  roundOffValue: yup.number(),
  sign_type: yup.string()
    .oneOf(['eSignature', 'manualSignature'], 'Invalid signature type')
    .required('Signature type is required'),
  signatureName: yup.string()
    .when('sign_type', {
      is: 'eSignature',
      then: (schema) => schema.required('Signature name is required'),
      otherwise: (schema) => schema
    }),
  signatureData: yup.string()
    .when('sign_type', {
      is: 'eSignature',
      then: (schema) => schema.test(
        'is-drawn',
        'Please draw your signature',
        (value) => value === 'true'
      ),
      otherwise: (schema) => schema
    }),
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
    .of(purchaseOrderItemSchema)
    .min(1, 'At least one item is required')
    .required('Items are required')
});

// Schema for editing purchase orders (similar but with additional id fields)
export const editPurchaseOrderSchema = purchaseOrderSchema.shape({
  id: yup.string().required('Purchase order ID is required'),
  purchase_order_id: yup.string().required('Purchase order ID is required')
});

// Schema for purchase order view (no validation required, just structure)
export const viewPurchaseOrderSchema = yup.object().shape({
  purchaseOrderId: yup.string(),
  purchaseOrderDate: yup.date(),
  dueDate: yup.date(),
  vendorId: yup.string(),
  bank: yup.string(),
  paymentMode: yup.string(),
  referenceNo: yup.string(),
  taxableAmount: yup.number(),
  TotalAmount: yup.number(),
  vat: yup.number(),
  totalDiscount: yup.number(),
  roundOff: yup.boolean(),
  roundOffValue: yup.number(),
  sign_type: yup.string(),
  signatureName: yup.string(),
  signatureId: yup.string(),
  signatureImage: yup.string(),
  notes: yup.string(),
  termsAndCondition: yup.string(),
  items: yup.array().of(yup.object())
});

// Schema for purchase order filtering
export const purchaseOrderFilterSchema = yup.object().shape({
  vendorId: yup.string(),
  startDate: yup.date().typeError('Invalid start date'),
  endDate: yup.date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .typeError('Invalid end date'),
  minAmount: yup.number()
    .min(0, 'Minimum amount cannot be negative')
    .typeError('Minimum amount must be a number'),
  maxAmount: yup.number()
    .min(yup.ref('minAmount'), 'Maximum amount must be greater than minimum amount')
    .typeError('Maximum amount must be a number'),
  status: yup.string(),
  purchaseOrderId: yup.string()
});

// Schema for converting purchase order to purchase
export const convertToPurchaseSchema = yup.object().shape({
  purchaseOrderId: yup.string().required('Purchase order ID is required'),
  purchaseDate: yup.date()
    .max(new Date(), 'Purchase date cannot be in the future')
    .required('Purchase date is required'),
  supplierInvoiceSerialNumber: yup.string().required('Supplier invoice number is required'),
  notes: yup.string(),
  termsAndCondition: yup.string(),
  items: yup.array()
    .of(purchaseOrderItemSchema)
    .min(1, 'At least one item is required')
    .required('Items are required')
});

// Export all schemas
export {
  purchaseOrderItemSchema,
  purchaseOrderSchema as default
};