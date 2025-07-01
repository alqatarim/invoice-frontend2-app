import * as yup from 'yup'

// Schema matching the old implementation with enhanced validation
export const profileSchema = yup.object({
  firstName: yup
    .string()
    .required('Enter First name')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .matches(/^[A-Za-z\s]+$/, 'First name should only contain letters and spaces'),
  lastName: yup
    .string()
    .required('Enter Last name')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .matches(/^[A-Za-z\s]+$/, 'Last name should only contain letters and spaces'),
  email: yup
    .string()
    .email('Email Must Be a Valid Email')
    .required('Enter Email Address')
    .max(100, 'Email must not exceed 100 characters'),
  mobileNumber: yup
    .string()
    .required('Enter Mobile Number')
    .min(10, 'Mobile Number Must Be At Least 10 Digits')
    .max(15, 'Mobile Number Must Be At Most 15 Digits')
    .matches(/^\+?[1-9]\d*$/, 'Invalid phone number'),
  gender: yup.string().nullable(),
  DOB: yup
    .date()
    .nullable()
    .max(new Date(), 'Date of birth cannot be in the future')
    .test('age', 'You must be at least 18 years old', function(value) {
      if (!value) return true; // Allow empty dates
      const today = new Date();
      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      return value <= eighteenYearsAgo;
    })
})

// Export validation patterns for input restrictions
export const validationPatterns = {
  namePattern: /^[A-Za-z\s]+$/,
  phonePattern: /^\+?[1-9]\d*$/,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}

// Export validation functions that can be used for real-time validation
export const validationHelpers = {
  isValidNameCharacter: (char) => /^[A-Za-z\s]$/.test(char),
  isValidPhoneCharacter: (char) => /^[\d+]$/.test(char),
  isValidEmailCharacter: (char) => /^[^\s]$/.test(char)
}
