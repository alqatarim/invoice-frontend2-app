// ** Yup Imports
import * as yup from 'yup'

// Validation schema for quotation form
export const quotationSchema = yup.object().shape({
  quotationNumber: yup.string().required('Quotation number is required'),
  customerId: yup.string().required('Customer is required'),
  date: yup.date().required('Date is required'),
  expiryDate: yup.date().required('Expiry date is required'),
  subject: yup.string().required('Subject is required'),
  items: yup.array().of(
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
        .min(0, 'Rate must be at least 0')
        .required('Rate is required'),
      tax: yup
        .number()
        .typeError('Tax must be a number')
        .min(0, 'Tax must be at least 0')
        .max(100, 'Tax cannot exceed 100%')
        .required('Tax is required'),
      discount: yup
        .number()
        .typeError('Discount must be a number')
        .min(0, 'Discount must be at least 0')
        .required('Discount is required'),
      discountType: yup
        .string()
        .oneOf(['flat', 'percent'], 'Invalid discount type')
        .required('Discount type is required')
    })
  ).min(1, 'At least one item is required'),
  notes: yup.string(),
  termsAndConditions: yup.string(),
  subTotal: yup.number(),
  totalDiscount: yup.number(),
  totalTax: yup.number(),
  totalAmount: yup.number()
})
