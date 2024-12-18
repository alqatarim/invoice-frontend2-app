import * as yup from 'yup';

export const EditPurchaseOrderSchema = yup.object().shape({
//   purchaseId: yup.string().required('Purchase ID is required'),
//   vendorId: yup.object().shape({
//     value: yup.string().required('Vendor is required'),
//     label: yup.string().required()
//   }),
//   purchaseOrderDate: yup.date().required('Purchase order date is required'),
//   dueDate: yup.date().required('Due date is required'),
//   referenceNo: yup.string().nullable(),
//   items: yup.array().of(
//     yup.object().shape({
//       productId: yup.string().required('Product is required'),
//       name: yup.string().required('Product name is required'),
//       quantity: yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1'),
//       rate: yup.number().required('Rate is required').min(0, 'Rate must be positive'),
//       discount: yup.number().min(0, 'Discount must be positive'),
//       tax: yup.number().min(0, 'Tax must be positive'),
//       amount: yup.number().min(0, 'Amount must be positive'),
//       units: yup.string(),
//       unit_id: yup.string(),
//       taxInfo: yup.mixed()
//     })
//   ).min(1, 'At least one item is required'),
//   bank: yup.object().nullable().shape({
//     value: yup.string(),
//     label: yup.string()
//   }),
//   notes: yup.string().nullable(),
//   termsAndCondition: yup.string().nullable(),
//   sign_type: yup.string().required('Signature type is required'),
//   signatureName: yup.string().when('sign_type', {
//     is: 'eSignature',
//     then: yup.string().required('Signature name is required'),
//     otherwise: yup.string().nullable()
//   }),
//   signatureId: yup.object().nullable().when('sign_type', {
//     is: 'manualSignature',
//     then: yup.object().shape({
//       value: yup.string().required('Please select a signature'),
//       label: yup.string().required()
//     }),
//     otherwise: yup.object().nullable()
//   }),
//   roundOff: yup.boolean().default(false),
//   taxableAmount: yup.number().min(0),
//   totalTax: yup.number().min(0),
//   totalDiscount: yup.number().min(0),
//   totalAmount: yup.number().min(0)
});
