import * as yup from 'yup';

export const deliveryChallanSchema = yup.object().shape({
  customerId: yup.object().required("Choose Any Customer"),
  deliveryChallanDate: yup.date().required("Delivery challan date is required"),
  dueDate: yup.date().nullable(),
  referenceNo: yup.string().nullable(),
  address: yup
    .string()
    .required("Shipping Address is required")
    .typeError("Choose delivery address")
    .trim(),
  items: yup.array().of(
    yup.object().shape({
      productId: yup.string().required(),
      name: yup.string().required(),
      quantity: yup.number().positive().required(),
      unit: yup.string().required(),
      rate: yup.number().positive().required(),
      discount: yup.number().min(0).max(100),
      tax: yup.number().min(0),
      amount: yup.number().required(),
    })
  ).min(1, "At least one item is required"),
  bank: yup.string().nullable(),
  notes: yup.string().nullable(),
  termsAndCondition: yup.string().nullable(),
  sign_type: yup.string().required("Choose Signature Type"),
  signatureName: yup.string().when("sign_type", {
    is: "eSignature",
    then: (schema) => schema.required("Enter Signature Name"),
    otherwise: (schema) => schema.notRequired(),
  }),
  signatureData: yup.string().when("sign_type", {
    is: "eSignature",
    then: (schema) => schema.test(
      "is-eSignature",
      "Draw The Signature",
      (value) => value === "true"
    ),
    otherwise: (schema) => schema.notRequired(),
  }),
  signatureId: yup.object().when("sign_type", {
    is: "manualSignature", 
    then: (schema) => schema.shape({
      value: yup.string().required("Choose Signature Name"),
    }),
    otherwise: (schema) => schema.notRequired(),
  }),
});