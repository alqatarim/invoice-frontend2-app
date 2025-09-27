import * as yup from 'yup';

export const quotationSchema = yup.object().shape({
  quotationNumber: yup
    .string()
    .required('Quotation number is required'),

  customerId: yup
    .string()
    .required('Customer is required'),

  quotationDate: yup
    .date()
    .typeError('Please enter a valid date')
    .required('Date is required'),

  expiryDate: yup
    .date()
    .typeError('Please enter a valid expiry date')
    .min(
      yup.ref('quotationDate'),
      'Expiry date must be later than or equal to the quotation date'
    )
    .required('Expiry date is required'),

  items: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Item name is required'),
        quantity: yup
          .number()
          .typeError('Quantity must be a number')
          .positive('Quantity must be positive')
          .required('Quantity is required'),
        rate: yup
          .number()
          .typeError('Rate must be a number')
          .min(0, 'Rate cannot be negative')
          .required('Rate is required'),
        tax: yup
          .number()
          .typeError('Tax must be a number')
          .min(0, 'Tax cannot be negative')
          .required('Tax is required'),
        discount: yup
          .number()
          .typeError('Discount must be a number')
          .min(0, 'Discount cannot be negative')
          .required('Discount is required'),
        discountType: yup.string().required('Discount type is required'),
        amount: yup
          .number()
          .typeError('Amount must be a number')
          .min(0, 'Amount cannot be negative')
          .required('Amount is required')
      })
    )
    .min(1, 'At least one item is required'),

  // Optional fields
  subject: yup.string(),
  notes: yup.string(),
  termsAndConditions: yup.string(),

  // Calculated fields (set by component logic)
  taxableAmount: yup
    .number()
    .typeError('Taxable amount must be a number')
    .min(0, 'Taxable amount cannot be negative'),

  totalDiscount: yup
    .number()
    .typeError('Total discount must be a number')
    .min(0, 'Total discount cannot be negative'),

  vat: yup
    .number()
    .typeError('VAT must be a number')
    .min(0, 'VAT cannot be negative'),

  TotalAmount: yup
    .number()
    .typeError('Total amount must be a number')
    .min(0, 'Total amount cannot be negative')
});
