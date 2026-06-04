export const ORGANIZATIONAL_ROLES = [

  { value: 'OWNER', label: 'Owner', companyWide: true, showInTeamForm: false },

  { value: 'COMPANY_ADMIN', label: 'Company Admin', companyWide: true, showInTeamForm: true },

  { value: 'STORE_ADMIN', label: 'Store Admin', companyWide: false, showInTeamForm: true },

  { value: 'STORE_MEMBER', label: 'Store Member', companyWide: false, showInTeamForm: true },

];

export const isCompanyWideOrganizationalRole = value =>

  value === 'OWNER' || value === 'COMPANY_ADMIN';



export const isStoreScopedOrganizationalRole = value =>

  value === 'STORE_ADMIN' || value === 'STORE_MEMBER';



export const requiresPermissionProfile = value => value === 'STORE_MEMBER';



export const getOrganizationalRoleLabel = value =>

  ORGANIZATIONAL_ROLES.find(role => role.value === value)?.label || value || '—';



export const createEmptyAccessRow = (overrides = {}) => ({

  organizationalRole: 'STORE_MEMBER',

  branchId: '',

  permissionRoleId: '',

  isPrimary: false,

  ...overrides,

});



export const getTeamFormOrganizationalRoles = (isEditingOwner = false) =>

  ORGANIZATIONAL_ROLES.filter(role => {

    if (role.value === 'OWNER') return isEditingOwner;

    return role.showInTeamForm;

  });



export const getAvailableBranchesForRow = (branchOptions, rows, rowIndex) => {

  const usedElsewhere = new Set(

    (rows || [])

      .filter(

        (row, index) =>

          index !== rowIndex &&

          isStoreScopedOrganizationalRole(row.organizationalRole) &&

          row.branchId

      )

      .map(row => row.branchId)

  );



  return (branchOptions || []).filter(branch => !usedElsewhere.has(branch.id));

};



export const userDataToAccessRows = (userData = {}) => {

  const organizationalRole =

    userData.organizationalRole || userData.orgRole || 'STORE_MEMBER';



  const storeAssignments = Array.isArray(userData.storeAssignments)

    ? userData.storeAssignments

    : [];



  if (storeAssignments.length > 0) {

    return storeAssignments.map(assignment => ({

      organizationalRole,

      branchId: assignment.branchId || '',

      permissionRoleId: assignment.permissionRoleId || '',

      isPrimary: Boolean(assignment.isDefault),

    }));

  }



  if (isCompanyWideOrganizationalRole(organizationalRole)) {

    return [

      createEmptyAccessRow({

        organizationalRole,

        isPrimary: true,

      }),

    ];

  }



  return [createEmptyAccessRow({ organizationalRole })];

};



export const compileAccessRowsForSubmit = (rows = []) => {

  const normalizedRows = (rows || []).filter(Boolean);

  if (!normalizedRows.length) {

    return {

      data: {

        organizationalRole: '',

        storeAssignments: [],

      },

    };

  }



  const organizationalRoles = [

    ...new Set(normalizedRows.map(row => row.organizationalRole).filter(Boolean)),

  ];



  if (!organizationalRoles.length) {

    return {

      data: {

        organizationalRole: '',

        storeAssignments: [],

      },

    };

  }



  if (organizationalRoles.length !== 1) {

    return { error: 'Use the same organizational role on every row.' };

  }



  const organizationalRole = organizationalRoles[0];



  if (isCompanyWideOrganizationalRole(organizationalRole) && normalizedRows.length > 1) {

    return { error: 'Company-wide roles use a single row without store assignments.' };

  }



  const storeRows = normalizedRows.filter(row =>

    isStoreScopedOrganizationalRole(organizationalRole)

  );



  if (isStoreScopedOrganizationalRole(organizationalRole)) {

    const rowsWithStore = storeRows.filter(row => row.branchId);



    const duplicateStore = rowsWithStore.find(

      (row, index) =>

        rowsWithStore.findIndex(other => other.branchId === row.branchId) !== index

    );

    if (duplicateStore) {

      return { error: 'Each store can only appear on one row.' };

    }

  }



  const storeAssignments = isCompanyWideOrganizationalRole(organizationalRole)

    ? []

    : storeRows.map(row => ({

        branchId: row.branchId,

        permissionRoleId: row.permissionRoleId || '',

        isDefault: Boolean(row.isPrimary),

      }));



  return {

    data: {

      organizationalRole,

      storeAssignments,

    },

  };

};

