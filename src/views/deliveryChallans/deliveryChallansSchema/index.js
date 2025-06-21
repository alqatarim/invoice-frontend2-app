import * as yup from 'yup';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// Extend dayjs with required plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const deliveryChallanSchema = yup.object().shape({
  customerId: yup
    .string()
    .required("Choose a customer"),

  deliveryChallanDate: yup
    .date()
    .required("Delivery challan date is required")
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
    .nullable()
    .typeError("Invalid date format")
    .test(
      'is-after-delivery-challan',
      'Due date must be on or after delivery challan date',
      function(value) {
        const deliveryChallanDate = this.parent.deliveryChallanDate;
        if (!deliveryChallanDate || !value) return true;

        const delivery = dayjs(deliveryChallanDate).startOf('day');
        const due = dayjs(value).startOf('day');

        return due.isSameOrAfter(delivery);
      }
    ),

  referenceNo: yup
    .string()
    .nullable()
    .trim(),

  address: yup
    .string()
    .required("Shipping Address is required")
    .trim(),

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
    .mixed()
    .when('sign_type', {
      is: 'eSignature',
      then: yup.mixed().required('Draw your signature'),
      otherwise: yup.mixed().nullable()
    }),

  signatureId: yup
    .string()
    .when('sign_type', {
      is: 'manualSignature',
      then: yup.string().required('Select a signature'),
      otherwise: yup.string().nullable()
    }),

  items: yup
    .array()
    .required('At least one item is required')
    .min(1, 'At least one item is required')
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
        tax: yup
          .number()
          .min(0, "Tax must be positive")
          .typeError("Tax must be a number"),
        amount: yup
          .number()
          .min(0, "Amount must be positive")
          .typeError("Amount must be a number"),
        units: yup.string().nullable(),
        unit: yup.string().when('productId', {
          is: (productId) => Boolean(productId),
          then: yup.string().required("Unit is required"),
          otherwise: yup.string().nullable()
        }),
        taxInfo: yup.mixed().nullable(),
        // Additional fields that are used in form submission
        key: yup.mixed().nullable(),
        isRateFormUpadted: yup.mixed().nullable(),
        form_updated_rate: yup.mixed().nullable(),
        form_updated_discount: yup.mixed().nullable(),
        form_updated_discounttype: yup.mixed().nullable(),
        form_updated_tax: yup.mixed().nullable()
      })
    ),

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
  ['signatureImage', 'sign_type'],
  ['signatureId', 'sign_type']
]);