import * as yup from 'yup';

const optionalObjectId = yup
  .string()
  .trim()
  .nullable()
  .transform(value => (value ? value : ''));

export const warrantySchema = yup.object().shape({
  productId: yup.string().trim().required('Product is required'),
  policyId: yup.string().trim().required('Warranty policy is required'),
  customerId: optionalObjectId,
  requiresSerialNumber: yup.boolean(),
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .integer('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .when('requiresSerialNumber', {
      is: true,
      then: schema => schema.max(1, 'Serialized warranties are issued one unit at a time'),
      otherwise: schema => schema,
    })
    .required('Quantity is required'),
  serialNumber: yup.string().trim().when('requiresSerialNumber', {
    is: true,
    then: schema => schema.required('Serial number is required by selected warranty policy'),
    otherwise: schema => schema,
  }),
  startDate: yup.string().trim(),
  notes: yup.string().trim(),
});

export default warrantySchema;
