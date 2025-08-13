import * as yup from 'yup';

export const addCustomerSchema = yup.object().shape({
  // Basic Information
  name: yup
    .string()
    .required('Enter Name')
    .max(50, 'Name must be at most 50 characters'),
  email: yup
    .string()
    .email('Enter Valid Email')
    .required('Enter Email'),
  phone: yup
    .string()
    .required('Enter Phone number')
    .max(15, 'Phone Number Must Be At Most 15 Digits')
    .matches(/^\+?[1-9]\d*$/, 'Invalid Phone Number'),
  website: yup.string().url('Enter valid website URL').nullable(),
  notes: yup.string().nullable(),
  status: yup.string().oneOf(['Active', 'Deactive']).default('Active'),
  
  // Billing Address
  billingAddress: yup.object().shape({
    name: yup.string().required('Enter Name'),
    addressLine1: yup.string().required('Enter Address Line 1'),
    addressLine2: yup.string().required('Enter Address Line 2'),
    city: yup.string().required('Enter City'),
    state: yup.string().required('Enter State'),
    country: yup.string().required('Enter Country'),
    pincode: yup.string().required('Enter Pincode'),
  }),

  // Shipping Address
  shippingAddress: yup.object().shape({
    name: yup.string().required('Enter Name'),
    addressLine1: yup.string().required('Enter Address Line 1'),
    addressLine2: yup.string().required('Enter Address Line 2'),
    city: yup.string().required('Enter City'),
    state: yup.string().required('Enter State'),
    country: yup.string().required('Enter Country'),
    pincode: yup.string().required('Enter Pincode'),
  }),

  // Bank Details (optional)
  bankDetails: yup.object().shape({
    bankName: yup.string(),
    branch: yup.string(),
    accountHolderName: yup.string(),
    accountNumber: yup.string(),
    IFSC: yup.string().max(15, 'IFSC must be at most 15 characters'),
  }),
});
