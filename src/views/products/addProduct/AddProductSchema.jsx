import * as yup from 'yup';

const AddProductSchema = yup.object().shape({
  name: yup.string()
    .required('Please enter a product name')
    .min(2, 'Product name must be at least 2 characters'),

  type: yup.string()
    .required('Please select a product type'),

  sku: yup.string()
    .required('Please enter or generate a SKU'),

  category: yup.object().shape({
    _id: yup.string().required('Please select a category'),
  }),

  sellingPrice: yup.number()
    .required('Please enter a selling price')
    .positive('Selling price must be greater than 0')
    .moreThan(yup.ref('purchasePrice'), 'Selling price must be higher than purchase price'),

  purchasePrice: yup.number()
    .required('Please enter a purchase price')
    .positive('Purchase price must be greater than 0'),

  units: yup.object().shape({
    _id: yup.string().required('Please select a unit'),
  }),

  discountType: yup.string()
    .required('Please select a discount type'),

  discountValue: yup.number()
    .required('Please enter a discount value')
    .min(0, 'Discount cannot be negative'),

  alertQuantity: yup.number()
    .required('Please enter an alert quantity')
    .positive('Alert quantity must be greater than 0')
    .integer('Alert quantity must be a whole number'),

  tax: yup.object().shape({
    _id: yup.string().required('Please select a tax rate'),
  }),
});

export default AddProductSchema;