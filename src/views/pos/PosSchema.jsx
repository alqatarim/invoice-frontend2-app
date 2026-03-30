import * as yup from 'yup';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const hasMeaningfulItemInput = (item) => {
  if (!item || typeof item !== 'object') return false;

  return Boolean(item.productId)
    || String(item.name || '').trim() !== ''
    || Number(item.quantity || 0) > 1
    || Number(item.rate || 0) > 0
    || Number(item.discount || 0) > 0
    || Number(item.tax || 0) > 0
    || Number(item.amount || 0) > 0;
};

const posItemSchema = yup
  .object({
    productId: yup.string().nullable(),
    quantity: yup.mixed().nullable(),
    rate: yup.mixed().nullable(),
    discountType: yup.mixed().nullable(),
    amount: yup.mixed().nullable(),
  })
  .test('valid-pos-item', function validatePosItem(value) {
    if (!hasMeaningfulItemInput(value)) {
      return true;
    }

    if (!value?.productId || String(value.productId).trim() === '') {
      return this.createError({
        path: `${this.path}.productId`,
        message: 'Product is required',
      });
    }

    const quantity = toNumber(value.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return this.createError({
        path: `${this.path}.quantity`,
        message: 'Quantity must be greater than 0',
      });
    }

    const rate = toNumber(value.rate);
    if (!Number.isFinite(rate) || rate < 0) {
      return this.createError({
        path: `${this.path}.rate`,
        message: 'Rate must be 0 or more',
      });
    }

    const discountType = Number(value.discountType);
    if (![2, 3].includes(discountType)) {
      return this.createError({
        path: `${this.path}.discountType`,
        message: 'Choose a valid discount type',
      });
    }

    const amount = toNumber(value.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return this.createError({
        path: `${this.path}.amount`,
        message: 'Amount must be 0 or more',
      });
    }

    return true;
  });

export const PosSchema = yup.object().shape({
  isWalkIn: yup
    .boolean()
    .default(true),

  customerId: yup
    .string()
    .when('isWalkIn', {
      is: true,
      then: yup.string().nullable(),
      otherwise: yup.string().required('Choose a customer'),
    }),

  payment_method: yup
    .string()
    .required('Choose payment method'),

  invoiceDate: yup
    .date()
    .required('Invoice date is required')
    .typeError('Invalid date format')
    .test(
      'not-future',
      'Date cannot be in the future',
      function validateInvoiceDate(value) {
        if (!value) return true;
        return dayjs(value).startOf('day').isSameOrBefore(dayjs().startOf('day'));
      }
    ),

  items: yup
    .array()
    .of(posItemSchema)
    .test(
      'at-least-one-product',
      'At least one product is required',
      (items) => Array.isArray(items) && items.some((item) => item?.productId)
    ),
});
