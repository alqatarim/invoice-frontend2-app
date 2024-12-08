import * as yup from 'yup';

export const PurchaseSchema = yup.object().shape({
  vendorId: yup.object().required('Please select a vendor'),
  purchaseDate: yup.date().required('Please select a date'),
  dueDate: yup.date().required('Please select a due date'),
  referenceNo: yup.string(),
  items: yup.array().of(
    yup.object().shape({
      productId: yup.string().required('Product is required'),
      quantity: yup.number()
        .required('Quantity is required')
        .positive('Quantity must be positive')
        .integer('Quantity must be a whole number'),
      rate: yup.number()
        .required('Rate is required')
        .positive('Rate must be positive'),
      tax: yup.number()
        .min(0, 'Tax cannot be negative'),
      discount: yup.number()
        .min(0, 'Discount cannot be negative')
    })
  ).min(1, 'At least one item is required'),
  bank: yup.object().nullable(),
  notes: yup.string(),
  termsAndCondition: yup.string(),
  sign_type: yup.string().required('Please select signature type'),
  signatureName: yup.string().when('sign_type', {
    is: 'eSignature',
    then: yup.string().required('Signature name is required')
  }),
  signatureData: yup.string().when('sign_type', {
    is: 'eSignature',
    then: yup.string().required('Signature is required')
  }),
  signatureId: yup.object().when('sign_type', {
    is: 'manualSignature',
    then: yup.object().shape({
      value: yup.string().required('Please select a signature')
    })
  })
});