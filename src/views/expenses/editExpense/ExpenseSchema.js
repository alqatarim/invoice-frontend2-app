import * as yup from 'yup';


export const expenseSchema = yup.object().shape({
  expenseId: yup.string().required('Expense ID is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .positive('Amount must be positive'),
  paymentMode: yup.string().required('Payment mode is required'),
  expenseDate: yup
    .date()
    .required('Expense date is required')
    .typeError('Invalid date format'),
  status: yup.string().required('Payment status is required'),
//   notes: yup.string().nullable().trim(),
  attachment: yup.mixed().nullable()
});
