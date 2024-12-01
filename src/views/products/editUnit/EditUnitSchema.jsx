import * as yup from 'yup';

const EditUnitSchema = yup.object().shape({
  name: yup
    .string()
    .required('Enter Name')
    .matches(/^[A-Za-z ]+$/, 'Only Alphabets Are Allowed'),
  symbol: yup
    .string()
    .required('Enter Symbol')
    .matches(/^[A-Za-z ]+$/, 'Only Alphabets Are Allowed'),
});

export default EditUnitSchema;
