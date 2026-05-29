import * as yup from 'yup';

export const EditPurchaseOrderSchema = yup.object().shape({
  vendorId: yup
    .string()
    .required("Choose any vendor"),

  sign_type: yup
    .string()
    .required("Choose employee type"),

  employeeName: yup
    .string()
    .when('sign_type', {
      is: 'eSignature',
      then: yup.string().required('Enter employee'),
      otherwise: yup.string().nullable()
    }),

  employeeData: yup
    .string()
    .when('sign_type', {
      is: 'eSignature',
      then: yup.string().required('Draw your employee'),
      otherwise: yup.string().nullable()
    }),

  employee: yup
    .string()
    .when('sign_type', {
      is: 'manualSignature',
      then: yup.string().required('Select a employee'),
      otherwise: yup.string().nullable()
    }),

  items: yup
    .array()
    .of(
      yup.object().shape({
        productId: yup.string().required("Product is required"),
        quantity: yup
          .number()
          .required("Quantity is required")
          .positive("Quantity must be positive")
          .typeError("Quantity must be a number"),
        rate: yup
          .number()
          .required("Rate is required")
          .min(0, "Rate cannot be negative")
          .typeError("Rate must be a number"),
        discount: yup
          .number()
          .min(0, "Discount must be positive")
          .typeError("Discount must be a number"),
        tax: yup
          .number()
          .min(0, "Tax must be positive")
          .typeError("Tax must be a number"),
        amount: yup
          .number()
          .min(0, "Amount must be positive")
          .typeError("Amount must be a number"),
        units: yup.string().nullable(),
        unit_id: yup.string().nullable(),
        taxInfo: yup.object().nullable()
      })
    )
    .min(1, "At least one item is required"),

  purchaseOrderDate: yup
    .date()
    .required("Purchase Order Date is required")
    .typeError("Invalid date format"),

  dueDate: yup
    .date()
    .required("Due Date is required")
    .min(yup.ref('purchaseOrderDate'), "Due date cannot be earlier than purchase order date")
    .typeError("Invalid date format"),

  referenceNo: yup
    .string()
    .nullable(),

  bank: yup
    .string()
    .nullable(),

  notes: yup
    .string()
    .nullable(),

  termsAndCondition: yup
    .string()
    .nullable()
}, [
  ['employeeName', 'sign_type'],
  ['employeeData', 'sign_type'],
  ['employee', 'sign_type']
]);
