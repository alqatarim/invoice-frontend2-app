import * as yup from "yup";

const AddCategorySchema = yup.object().shape({
  name: yup
    .string()
    .required("Enter Name")
    .matches(/^[A-Za-z ]+$/, "Only Alphabets Are Allowed"),
  slug: yup
    .string()
    .max(20, "Maximum length exceeded")
    .required("Enter Slug")
    .matches(/^[A-Za-z ]+$/, "Only Alphabets Are Allowed"),
});

export default AddCategorySchema;