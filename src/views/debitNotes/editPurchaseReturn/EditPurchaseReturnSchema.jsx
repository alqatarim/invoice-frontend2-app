import * as yup from 'yup';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// Extend dayjs with required plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const PurchaseReturnSchema = yup.object().shape({
  vendorId: yup
    .string()
    .required("Choose any vendor"),

  sign_type: yup
    .string()
    .required("Choose signature type")
    .oneOf(['eSignature', 'manualSignature'], 'Invalid signature type'),

  signatureName: yup
    .string()
    .when('sign_type', {
      is: 'eSignature',
      then: yup.string()
        .required('Enter signature name')
        .min(2, 'Signature name must be at least 2 characters')
        .trim(),
      otherwise: yup.string().nullable()
    }),

  signatureImage: yup
    .string()
    .when('sign_type', {
      is: 'eSignature',
      then: yup.string().required('Draw your signature'),
      otherwise: yup.string().nullable()
    }),

  signatureId: yup
    .string()
    .when('sign_type', {
      is: 'manualSignature',
      then: yup.string()
        .required('Select a signature'),
      otherwise: yup.string().nullable()
    }),

  items: yup
    .array()
    .required('Items array is required')
    .min(1, 'At least one return item is required')
    .test(
      'has-valid-items',
      'At least one return item is required',
      function(value) {
        // Add more detailed validation
        if (!value || !Array.isArray(value)) return false;

        // Check if there's at least one valid item
        const hasValidItems = value.some(item =>
          item &&
          item.productId &&
          item.quantity > 0 &&
          item.rate >= 0
        );

        return hasValidItems;
      }
    )
    .of(
      yup.object().shape({
        productId: yup.string().required("Product is required"),
        name: yup.string().required("Product name is required"),
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
        discountType: yup
          .number()
          .oneOf([2, 3], "Invalid discount type")
          .required("Discount type is required"),
        discountValue: yup
          .number()
          .min(0, "Discount value must be positive")
          .typeError("Discount value must be a number"),
        tax: yup
          .number()
          .min(0, "Tax must be positive")
          .typeError("Tax must be a number"),
        amount: yup
          .number()
          .min(0, "Amount must be positive")
          .typeError("Amount must be a number"),
        units: yup.string().nullable(),
        unit: yup.string().nullable(),
        taxInfo: yup.object().nullable()
      })
    ),

  purchaseReturnDate: yup
    .date()
    .required("Purchase return date is required")
    .typeError("Invalid date format")
    .test(
      'not-future',
      'Date cannot be in the future',
      function(value) {
        if (!value) return true;
        const today = dayjs().startOf('day');
        const selectedDate = dayjs(value).startOf('day');
        return selectedDate.isSameOrBefore(today);
      }
    ),

  dueDate: yup
    .date()
    .required("Due date is required")
    .typeError("Invalid date format")
    .test(
      'is-after-purchase-return',
      'Due date must be on or after purchase return date',
      function(value) {
        const purchaseReturnDate = this.parent.purchaseReturnDate;
        if (!purchaseReturnDate || !value) return true;

        const returnDate = dayjs(purchaseReturnDate).startOf('day');
        const due = dayjs(value).startOf('day');

        return due.isSameOrAfter(returnDate);
      }
    ),

  referenceNo: yup
    .string()
    .nullable()
    .trim(),

  bank: yup
    .string()
    .nullable(),

  notes: yup
    .string()
    .nullable()
    .trim(),

  termsAndCondition: yup
    .string()
    .nullable()
    .trim()

}, [
  ['signatureName', 'sign_type'],
  ['signatureData', 'sign_type'],
  ['signatureId', 'sign_type']
]);