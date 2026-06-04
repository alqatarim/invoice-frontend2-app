import * as yup from 'yup';

const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const hasMeaningfulItemInput = item => {
  if (!item || typeof item !== 'object') return false;

  return (
    Boolean(item.productId)
    || String(item.name || '').trim() !== ''
    || Number(item.quantity || 0) > 1
    || Number(item.rate || 0) > 0
    || Number(item.discount || 0) > 0
    || Number(item.tax || 0) > 0
    || Number(item.amount || 0) > 0
  );
};

const quotationItemSchema = yup
  .object({
    productId: yup.string().nullable(),
    name: yup.string().nullable(),
    quantity: yup.mixed().nullable(),
    rate: yup.mixed().nullable(),
    discount: yup.mixed().nullable(),
    discountType: yup.mixed().nullable(),
    tax: yup.mixed().nullable(),
    amount: yup.mixed().nullable(),
  })
  .test('valid-quotation-item', function validateQuotationItem(value) {
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
        message: 'Quantity is required',
      });
    }

    const rate = toNumber(value.rate);
    if (!Number.isFinite(rate) || rate < 0) {
      return this.createError({
        path: `${this.path}.rate`,
        message: 'Rate is required',
      });
    }

    return true;
  });

export const quotationSchema = yup.object().shape({
  quotationNumber: yup.string().required('Quotation number is required'),
  customerId: yup.string().required('Customer is required'),
  quotationDate: yup
    .date()
    .typeError('Please enter a valid date')
    .required('Date is required'),
  expiryDate: yup
    .date()
    .typeError('Please enter a valid expiry date')
    .min(yup.ref('quotationDate'), 'Expiry date must be later than or equal to the quotation date')
    .required('Expiry date is required'),
  items: yup
    .array()
    .of(quotationItemSchema)
    .test('at-least-one-item', 'At least one item is required', items => {
      const meaningfulItems = (items || []).filter(hasMeaningfulItemInput);
      return meaningfulItems.length > 0;
    }),
  employee: yup.string().nullable(),
  notes: yup.string().nullable(),
  termsAndConditions: yup.string().nullable(),
  taxableAmount: yup.number().nullable(),
  totalDiscount: yup.number().nullable(),
  vat: yup.number().nullable(),
  TotalAmount: yup.number().nullable(),
});
