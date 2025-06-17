import * as yup from 'yup'

const CustomerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Customer name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must not exceed 100 characters'),
  
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  
  website: yup
    .string()
    .url('Please enter a valid website URL')
    .nullable(),
  
  notes: yup
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .nullable(),

  // Billing Address
  'billingAddress.name': yup
    .string()
    .required('Billing address name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  'billingAddress.addressLine1': yup
    .string()
    .required('Address line 1 is required')
    .min(5, 'Address must be at least 5 characters')
    .max(100, 'Address must not exceed 100 characters'),
  
  'billingAddress.addressLine2': yup
    .string()
    .max(100, 'Address must not exceed 100 characters')
    .nullable(),
  
  'billingAddress.city': yup
    .string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must not exceed 50 characters'),
  
  'billingAddress.state': yup
    .string()
    .required('State is required')
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must not exceed 50 characters'),
  
  'billingAddress.country': yup
    .string()
    .required('Country is required')
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must not exceed 50 characters'),
  
  'billingAddress.pincode': yup
    .string()
    .required('Pincode is required')
    .matches(/^[0-9]+$/, 'Pincode must contain only digits')
    .min(5, 'Pincode must be at least 5 digits')
    .max(10, 'Pincode must not exceed 10 digits'),

  // Shipping Address (conditional validation)
  'shippingAddress.name': yup
    .string()
    .when('copyBillingToShipping', {
      is: false,
      then: () => yup
        .string()
        .required('Shipping address name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters'),
      otherwise: () => yup.string().nullable()
    }),
  
  'shippingAddress.addressLine1': yup
    .string()
    .when('copyBillingToShipping', {
      is: false,
      then: () => yup
        .string()
        .required('Shipping address line 1 is required')
        .min(5, 'Address must be at least 5 characters')
        .max(100, 'Address must not exceed 100 characters'),
      otherwise: () => yup.string().nullable()
    }),
  
  'shippingAddress.city': yup
    .string()
    .when('copyBillingToShipping', {
      is: false,
      then: () => yup
        .string()
        .required('Shipping city is required')
        .min(2, 'City must be at least 2 characters')
        .max(50, 'City must not exceed 50 characters'),
      otherwise: () => yup.string().nullable()
    }),
  
  'shippingAddress.state': yup
    .string()
    .when('copyBillingToShipping', {
      is: false,
      then: () => yup
        .string()
        .required('Shipping state is required')
        .min(2, 'State must be at least 2 characters')
        .max(50, 'State must not exceed 50 characters'),
      otherwise: () => yup.string().nullable()
    }),
  
  'shippingAddress.country': yup
    .string()
    .when('copyBillingToShipping', {
      is: false,
      then: () => yup
        .string()
        .required('Shipping country is required')
        .min(2, 'Country must be at least 2 characters')
        .max(50, 'Country must not exceed 50 characters'),
      otherwise: () => yup.string().nullable()
    }),
  
  'shippingAddress.pincode': yup
    .string()
    .when('copyBillingToShipping', {
      is: false,
      then: () => yup
        .string()
        .required('Shipping pincode is required')
        .matches(/^[0-9]+$/, 'Pincode must contain only digits')
        .min(5, 'Pincode must be at least 5 digits')
        .max(10, 'Pincode must not exceed 10 digits'),
      otherwise: () => yup.string().nullable()
    }),

  // Bank Details (optional)
  'bankDetails.bankName': yup
    .string()
    .max(100, 'Bank name must not exceed 100 characters')
    .nullable(),
  
  'bankDetails.branch': yup
    .string()
    .max(100, 'Branch must not exceed 100 characters')
    .nullable(),
  
  'bankDetails.accountHolderName': yup
    .string()
    .max(100, 'Account holder name must not exceed 100 characters')
    .nullable(),
  
  'bankDetails.accountNumber': yup
    .string()
    .matches(/^[0-9]*$/, 'Account number must contain only digits')
    .max(20, 'Account number must not exceed 20 digits')
    .nullable(),
  
  'bankDetails.ifscCode': yup
    .string()
    .matches(/^[A-Z0-9]*$/, 'IFSC code must contain only uppercase letters and digits')
    .max(11, 'IFSC code must not exceed 11 characters')
    .nullable(),
})

export default CustomerSchema