import * as yup from 'yup';

export const paymentSchema = yup.object().shape({
  date: yup.date().required('Payment date is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be positive')
    .required('Amount is required'),
  customerId: yup.string().required('Customer is required'),
  paymentNumber: yup.string().required('Payment number is required'),
  invoiceId: yup.string().required('Invoice is required'),
  payment_method: yup.string()
    .oneOf(['Cash', 'Cheque', 'Bank', 'Online'], 'Invalid payment mode')
    .required('Payment mode is required'),
  description: yup.string().nullable()
});
