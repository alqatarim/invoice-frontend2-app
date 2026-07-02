import * as yup from 'yup';

const optionalNumber = yup
  .number()
  .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value))
  .nullable();

export const policySchema = yup.object().shape({
  name: yup.string().trim().required('Policy name is required'),
  description: yup.string().trim(),
  durationValue: yup
    .number()
    .typeError('Duration must be a number')
    .min(1, 'Duration must be at least 1')
    .required('Duration is required'),
  durationUnit: yup.string().required('Duration unit is required'),
  coverageType: yup.string().required('Coverage is required'),
  returnBehavior: yup.string().required('Return behavior is required'),
  extensionAllowed: yup.boolean(),
  maxExtensionValue: optionalNumber.when('extensionAllowed', {
    is: true,
    then: schema => schema.min(1, 'Max extension must be at least 1'),
    otherwise: schema => schema,
  }),
  maxExtensionUnit: yup.string().required('Max extension unit is required'),
  claimLimitType: yup.string().required('Claim limit is required'),
  claimLimitCount: optionalNumber.when('claimLimitType', {
    is: 'count',
    then: schema => schema
      .typeError('Claim count must be a number')
      .min(1, 'Claim count must be at least 1')
      .required('Claim count is required'),
    otherwise: schema => schema,
  }),
  termsAndConditions: yup.string().trim(),
  exclusions: yup.string().trim(),
  instructions: yup.string().trim(),
  requiresSerialNumber: yup.boolean(),
  isTransferable: yup.boolean(),
  status: yup.string().required('Status is required'),
});

export default policySchema;
