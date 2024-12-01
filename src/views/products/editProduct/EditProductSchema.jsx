import * as yup from 'yup';

const EditProductSchema = yup.object().shape({
  name: yup.string()
    .required('Product name is required'),

  type: yup.string()
    .required('Product type is required'),

  sku: yup.string()
    .required('SKU is required'),

  category: yup.object().shape({
    _id: yup.string().required('Category is required'),
  }),

  sellingPrice: yup.number()
    .required('Selling Price is required')
    .positive('Selling Price must be a positive number')
    .typeError('Enter a valid Selling Price')
    .test('is-greater', 'Selling Price must be greater than Purchase Price', function (value) {
      const purchasePrice = this.parent.purchasePrice;
      if (value && purchasePrice) {
        return value > purchasePrice;
      }
      return true;
    }),

  purchasePrice: yup.number()
    .required('Purchase Price is required')
    .positive('Purchase Price must be a positive number')
    .typeError('Enter a valid Purchase Price'),

  discountValue: yup.number()
    .required('Discount Value is required')
    .min(0, 'Discount Value must be non-negative')
    .typeError('Enter a valid Discount Value')
});