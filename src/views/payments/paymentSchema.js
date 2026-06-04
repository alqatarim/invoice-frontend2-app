import * as yup from 'yup';

export const paymentSchema = yup.object().shape({
  paymentNumber: yup.string().required('Payment number is required'),
  customerId: yup.string().required('Customer is required'),
  invoiceId: yup.string().required('Invoice number is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .positive('Amount must be positive'),
  paymentMethod: yup.string().required('Payment method is required'),
  date: yup.date().required('Payment date is required').typeError('Invalid date format'),
  reference: yup.string(),
  description: yup.string(),
});
