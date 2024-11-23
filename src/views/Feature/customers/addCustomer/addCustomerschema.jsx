import * as yup from "yup";

export const addCustomerschema = yup.object().shape({
    name: yup.string().required("Enter Name"),
    phone: yup
      .string()
      .required("Enter Phone number")
      // .min(10, "Phone Number Must Be At Least 10 Digits")
       .max(15, "Phone Number Must Be At Most 15 Digits")
      .matches(/^\+?[1-9]\d*$/, "Invalid Phone Number"),
    email: yup.string().email("Enter Valid Email").required("Enter Email"),
     billingAddress: yup.object().shape({
      name: yup.string().required("Enter Name"),
      addressLine1: yup.string().required("Enter Address Line 1"),
      addressLine2: yup.string().required("Enter Address Line 2"),
      country: yup.string().required("Enter Country"),
      city: yup.string().required("Enter City"),
      state: yup.string().required("Enter State"),
      pincode: yup.string().required("Enter Pincode"),
    }),
  
    shippingAddress: yup.object().shape({
      name: yup.string().required("Enter Name"),
      addressLine1: yup.string().required("Enter Address Line 1"),
      addressLine2: yup.string().required("Enter Address Line 2"),
      country: yup.string().required("Enter Country"),
      city: yup.string().required("Enter City"),
      state: yup.string().required("Enter State"),
      pincode: yup.string().required("Enter Pincode"),
    }),
  });