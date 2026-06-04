import * as yup from 'yup';
import { userValidationRules } from '@/data/dataSets';
import {
  compileAccessRowsForSubmit,
  isCompanyWideOrganizationalRole,
  isStoreScopedOrganizationalRole,
  requiresPermissionProfile,
} from './userAccessCascade';

export const organizationalRoleOptions = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'COMPANY_ADMIN', label: 'Company Admin' },
  { value: 'STORE_ADMIN', label: 'Store Admin' },
  { value: 'STORE_MEMBER', label: 'Store Member' },
];

export const DEFAULT_USER_FORM_VALUES = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  mobileNumber: '',
  organizationalRole: 'STORE_MEMBER',
  accessRows: [
    {
      organizationalRole: 'STORE_MEMBER',
      branchId: '',
      permissionRoleId: '',
      isPrimary: true,
    },
  ],
  password: '',
  confirmPassword: '',
  status: 'Active',
  gender: '',
};

export const getUserSchema = isEdit =>
  yup.object().shape({
    firstName: yup
      .string()
      .required(userValidationRules.firstName.required)
      .min(2, userValidationRules.firstName.minLength.message)
      .max(50, userValidationRules.firstName.maxLength.message),
    lastName: yup
      .string()
      .required(userValidationRules.lastName.required)
      .min(2, userValidationRules.lastName.minLength.message)
      .max(50, userValidationRules.lastName.maxLength.message),
    userName: yup
      .string()
      .required(userValidationRules.userName.required)
      .min(3, userValidationRules.userName.minLength.message)
      .max(30, userValidationRules.userName.maxLength.message)
      .matches(/^[a-zA-Z0-9_]*$/, userValidationRules.userName.pattern.message),
    email: yup
      .string()
      .required(userValidationRules.email.required)
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, userValidationRules.email.pattern.message),
    mobileNumber: yup
      .string()
      .optional()
      .matches(/^[\+]?[0-9\-\(\)\s]*$/, userValidationRules.mobileNumber.pattern.message),
    organizationalRole: yup
      .string()
      .oneOf(['OWNER', 'COMPANY_ADMIN', 'STORE_ADMIN', 'STORE_MEMBER'])
      .required('Organizational role is required'),
    accessRows: yup
      .array()
      .of(
        yup.object({
          organizationalRole: yup
            .string()
            .oneOf(['OWNER', 'COMPANY_ADMIN', 'STORE_ADMIN', 'STORE_MEMBER'])
            .required('Organizational role is required'),
          branchId: yup.string().when('organizationalRole', {
            is: value => isStoreScopedOrganizationalRole(value),
            then: schema => schema.required('Store is required'),
            otherwise: schema => schema.optional().nullable(),
          }),
          permissionRoleId: yup.string().when('organizationalRole', {
            is: value => requiresPermissionProfile(value),
            then: schema => schema.required('Permission profile is required'),
            otherwise: schema => schema.optional().nullable(),
          }),
          isPrimary: yup.boolean().optional(),
        })
      )
      .min(1, 'Add at least one access row')
      .test('access-rows-compile', 'Invalid access configuration', function validateRows(rows) {
        const result = compileAccessRowsForSubmit(rows);
        if (result.error) {
          return this.createError({ message: result.error });
        }
        return true;
      }),
    status: yup.string().required(userValidationRules.status.required),
    gender: yup.string().optional(),
    password: isEdit
      ? yup.string().optional()
      : yup
          .string()
          .required(userValidationRules.password.required)
          .min(8, userValidationRules.password.minLength.message)
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            userValidationRules.password.pattern.message
          ),
    confirmPassword: isEdit
      ? yup.string().optional()
      : yup
          .string()
          .required('Confirm password is required')
          .oneOf([yup.ref('password'), null], 'Passwords must match'),
  });
