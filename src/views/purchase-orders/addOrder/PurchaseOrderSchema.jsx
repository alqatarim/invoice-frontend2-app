export const PurchaseOrderSchema = yup
.object({
  vendorId: yup.object().required("Choose Any Vendor"),
  sign_type: yup.string().typeError("Choose Signature Type"),
  signatureName: yup.string().when("sign_type", (sign_type) => {
    if (sign_type === "eSignature") {
      return yup.string().nullable().required("Enter Signature Name");
    } else {
      return yup.string().notRequired();
    }
  }),
  signatureData: yup.string().when("sign_type", (sign_type) => {
    if (sign_type === "eSignature") {
      return yup
        .string()
        .test(
          "is-eSignature",
          `Draw The Signature`,
          async (value) => value === "true"
        );
    } else {
      return yup.string().notRequired();
    }
  }),
  signatureId: yup.string().when("sign_type", (sign_type) => {
    if (sign_type === "manualSignature") {
      return yup.object().shape({
        value: yup.string().required("Choose Signature Name"),
      });
    } else {
      return yup.object().notRequired();
    }
  }),
  items: yup.array().min(1, "At least one item is required"),
  purchaseOrderDate: yup.date().required("Purchase Order Date is required"),
  dueDate: yup.date().required("Due Date is required"),
  referenceNo: yup.string(),
  bank: yup.object().nullable(),
  notes: yup.string(),
  termsAndCondition: yup.string()
})
.required();

export const discountEditSchema = yup
.object({
  discount: yup
    .number()
    .test(
      "valid-number",
      "Enter Valid Discount Price",
      (value) => typeof value === "number" && !/[eE+-]/.test(value.toString())
    )
    .typeError("Enter Valid Discount Price"),
  rate: yup
    .number()
    .test(
      "valid-number",
      "Enter Valid Rate",
      (value) => typeof value === "number" && !/[eE+-]/.test(value.toString())
    )
    .typeError("Enter Valid Rate")
})
.required();