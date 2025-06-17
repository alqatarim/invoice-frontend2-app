import * as yup from 'yup';

export const VendorSchema = yup.object().shape({
  vendor_name: yup
    .string()
    .required("Vendor name is required")
    .trim()
    .min(2, "Vendor name must be at least 2 characters"),

  vendor_email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .trim(),

  vendor_phone: yup
    .string()
    .required("Phone number is required")
    .trim()
    .matches(
      /^[\d\s\-\+\(\)]+$/,
      "Please enter a valid phone number"
    )
    .min(10, "Phone number must be at least 10 digits"),

  balance: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      // Convert empty string to null
      return originalValue === '' ? null : value;
    })
    .test('optional-positive', 'Balance cannot be negative', function(value) {
      // Only validate if value exists
      if (value === null || value === undefined) return true;
      return value >= 0;
    }),

  balanceType: yup
    .string()
    .when('balance', {
      is: (val) => val && val > 0,
      then: (schema) => schema.required("Balance type is required when balance is provided"),
      otherwise: (schema) => schema.nullable()
    }),

  status: yup
    .boolean()
    .default(true),
});