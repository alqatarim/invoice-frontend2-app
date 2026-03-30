import * as yup from 'yup'

export const DEFAULT_CATEGORY_FORM_VALUES = {
  name: '',
  slug: '',
  parentCategory: '',
  tax: '',
  status: true
}

export const categorySchema = yup.object().shape({
  name: yup.string().required('Category name is required').min(2, 'Category name must be at least 2 characters'),
  slug: yup.string().required('Category slug is required').min(2, 'Category slug must be at least 2 characters'),
  parentCategory: yup.string().nullable(),
  tax: yup.string().nullable(),
  status: yup.boolean()
})
