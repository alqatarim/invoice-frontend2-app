import * as yup from 'yup';

const EditCategorySchema = yup.object().shape({
  name: yup
    .string()
    .required('Enter Name')
    .matches(/^[A-Za-z ]+$/, 'Only Alphabets Are Allowed'),
  slug: yup
    .string()
    .required('Enter Slug')
    .matches(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens are allowed'),
});

export default EditCategorySchema;