import * as yup from 'yup'


/**
 * 1–2: 10 digits starting with 013 or 05
 * 3–4: 966 + 9 digits starting with 13 or 5 (12 digits total)
 * 5–6: +966 + 9 digits starting with 13 or 5 (13 characters total)
 */
export const COMPANY_PROFILE_PHONE_REGEX =
  /^(013\d{7}|05\d{8}|96613\d{7}|9665\d{8}|\+96613\d{7}|\+9665\d{8})$/

export const COMPANY_PROFILE_PHONE_MESSAGE =
  'Phone must be 10 digits starting with 013 or 05, or 966/+966 followed by 9 digits starting with 13 or 5'

export const companyProfileSchema = yup.object().shape({
  companyName: yup.string().trim().required('Enter Company Name'),
  email: yup
    .string()
    .trim()
    .email('Email must be a valid email')
    .required('Enter Company Email'),
  phone: yup
    .string()
    .trim()
    .required('Enter Phone number')
    .matches(COMPANY_PROFILE_PHONE_REGEX, COMPANY_PROFILE_PHONE_MESSAGE),
  addressLine1: yup
    .string()
    .trim()
    .required('Enter Address Line 1')
    .min(4, 'Address Line 1 Must Be At Least 6 Characters')
    .max(30, 'Address Line 1 Must Be At Most 30 Characters'),
  addressLine2: yup.string().trim(),
  city: yup.string().trim().required('Select City'),
  state: yup.string().trim().required('Select Province'),
  country: yup
    .string()
    .trim()
    .required('Select Country')
    .oneOf(['Saudi Arabia'], 'Country must be Saudi Arabia'),
  postalCode: yup
    .string()
    .trim()
    .required('Enter Postal Code')
    .matches(/^\d+$/, 'Postal code should contain only numbers'),
  googleLocationAddress: yup.string().nullable(),
  googleLocationPlaceId: yup.string().nullable(),
  googleLocationLat: yup.string().nullable(),
  googleLocationLng: yup.string().nullable(),
})
