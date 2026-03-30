const DEFAULT_PERMISSION_FLAGS = Object.freeze({
  create: false,
  update: false,
  view: false,
  delete: false,
  all: false,
})

export const alwaysEnabledModules = Object.freeze([
  'dashboard',
  'accountSettings',
  'changePassword'
])

export const permissionActionAliases = Object.freeze({
  edit: 'update',
  export: 'view',
  print: 'view',
  read: 'view',
  list: 'view'
})

export const moduleDefinitions = Object.freeze([
  {
    module: 'dashboard',
    label: 'Dashboard',
    defaultPermissions: {
      create: true,
      update: true,
      view: true,
      delete: true,
      all: true
    }
  },
  { module: 'customer', label: 'Customers' },
  { module: 'vendor', label: 'Vendors' },
  { module: 'ledger', label: 'Ledger' },
  {
    module: 'product',
    label: 'Products',
    aliases: ['productsOrServices']
  },
  { module: 'category', label: 'Categories' },
  { module: 'unit', label: 'Units' },
  { module: 'inventory', label: 'Inventory' },
  { module: 'branch', label: 'Stores' },
  { module: 'invoice', label: 'Invoices' },
  {
    module: 'creditNote',
    label: 'Sales Returns',
    aliases: ['salesreturn']
  },
  { module: 'purchase', label: 'Purchases' },
  {
    module: 'purchaseOrder',
    label: 'Purchase Orders',
    aliases: ['purchase_order']
  },
  {
    module: 'debitNote',
    label: 'Purchase Returns',
    aliases: ['purchasereturn']
  },
  { module: 'expense', label: 'Expenses' },
  { module: 'payment', label: 'Payments' },
  { module: 'quotation', label: 'Quotations' },
  { module: 'deliveryChallan', label: 'Delivery Challans' },
  { module: 'quotationReport', label: 'Quotation Report' },
  {
    module: 'paymentSummaryReport',
    label: 'Payment Summary Report',
    aliases: ['paymentSummary']
  },
  { module: 'chartOfAccounts', label: 'Chart Of Accounts' },
  { module: 'journalEntry', label: 'Journal Entries' },
  { module: 'voucher', label: 'Vouchers' },
  { module: 'trialBalanceReport', label: 'Trial Balance Report' },
  { module: 'balanceSheetReport', label: 'Balance Sheet Report' },
  { module: 'incomeStatementReport', label: 'Income Statement Report' },
  { module: 'generalLedgerReport', label: 'General Ledger Report' },
  { module: 'accountingSettings', label: 'Accounting Settings' },
  { module: 'inventoryCosting', label: 'Inventory Costing' },
  { module: 'user', label: 'Users' },
  { module: 'role', label: 'Roles & Permissions' },
  {
    module: 'accountSettings',
    label: 'Account Settings',
    defaultPermissions: {
      create: true,
      update: true,
      view: true,
      delete: true,
      all: true
    }
  },
  { module: 'companySettings', label: 'Company Settings' },
  { module: 'invoiceSettings', label: 'Invoice Settings' },
  {
    module: 'invoiceTemplate',
    label: 'Invoice Templates',
    aliases: ['invoiceTemplates']
  },
  {
    module: 'signature',
    label: 'Signatures',
    aliases: ['signatureLists']
  },
  { module: 'paymentSettings', label: 'Payment Settings' },
  { module: 'bankSettings', label: 'Bank Settings' },
  { module: 'taxSettings', label: 'Tax Settings' },
  { module: 'emailSettings', label: 'Email Settings' },
  { module: 'preferenceSettings', label: 'Preference Settings' },
  { module: 'notificationSettings', label: 'Notification Settings' },
  {
    module: 'changePassword',
    label: 'Change Password',
    defaultPermissions: {
      create: false,
      update: true,
      view: true,
      delete: false,
      all: false
    }
  },
  { module: 'deleteAccountRequest', label: 'Delete Account Requests' },
  { module: 'membership', label: 'Membership' }
])

const normalizeLookupKey = value => String(value || '').trim().toLowerCase()

const moduleLookup = moduleDefinitions.reduce((lookup, definition) => {
  ;[definition.module, ...(definition.aliases || [])].forEach(key => {
    lookup.set(normalizeLookupKey(key), definition)
  })

  return lookup
}, new Map())

const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)

export const getCanonicalPermissionAction = action => {
  const normalized = normalizeLookupKey(action)

  return permissionActionAliases[normalized] || normalized
}

export const getPermissionModuleDefinition = moduleName => {
  return moduleLookup.get(normalizeLookupKey(moduleName)) || null
}

export const getCanonicalModuleName = moduleName => {
  const definition = getPermissionModuleDefinition(moduleName)

  if (definition?.module) return definition.module

  return String(moduleName || '').trim()
}

export const normalizePermissionFlags = (permissions = {}, fallback = DEFAULT_PERMISSION_FLAGS) => {
  const source = isPlainObject(permissions) ? permissions : {}
  const base = isPlainObject(fallback)
    ? { ...DEFAULT_PERMISSION_FLAGS, ...fallback }
    : { ...DEFAULT_PERMISSION_FLAGS }

  const hasAllPermission = Boolean(source.all ?? base.all)

  const next = {
    create: hasAllPermission || Boolean(source.create ?? base.create),
    update: hasAllPermission || Boolean(source.update ?? source.edit ?? base.update),
    view: hasAllPermission || Boolean(source.view ?? source.read ?? base.view),
    delete: hasAllPermission || Boolean(source.delete ?? base.delete)
  }

  next.all =
    hasAllPermission ||
    Boolean(base.all) ||
    (next.create && next.update && next.view && next.delete)

  return next
}

export const mergePermissionFlags = (existing = {}, incoming = {}) => {
  const left = normalizePermissionFlags(existing)
  const right = normalizePermissionFlags(incoming)

  const merged = {
    create: left.create || right.create,
    update: left.update || right.update,
    view: left.view || right.view,
    delete: left.delete || right.delete
  }

  merged.all =
    left.all ||
    right.all ||
    (merged.create && merged.update && merged.view && merged.delete)

  return merged
}

export const buildDefaultPermissionModules = () => {
  return moduleDefinitions.map(definition => ({
    label: definition.label,
    module: definition.module,
    permissions: normalizePermissionFlags(definition.defaultPermissions)
  }))
}

export const normalizePermissionModules = modules => {
  const merged = new Map()

  ;(Array.isArray(modules) ? modules : []).forEach(item => {
    const rawModule = String(item?.module || '').trim()
    if (!rawModule) return

    const canonicalModule = getCanonicalModuleName(rawModule)
    const definition = getPermissionModuleDefinition(canonicalModule)
    const existingRecord = merged.get(canonicalModule)
    const baseRecord =
      existingRecord ||
      (definition
        ? {
            label: definition.label,
            module: definition.module,
            permissions: normalizePermissionFlags(definition.defaultPermissions)
          }
        : {
            label: item?.label || canonicalModule,
            module: canonicalModule,
            permissions: normalizePermissionFlags()
          })

    merged.set(canonicalModule, {
      label: definition?.label || item?.label || baseRecord.label,
      module: canonicalModule,
      permissions: mergePermissionFlags(baseRecord.permissions, item?.permissions)
    })
  })

  const normalizedModules = buildDefaultPermissionModules().map(defaultRecord => {
    const mergedRecord = merged.get(defaultRecord.module)
    if (!mergedRecord) return defaultRecord

    return {
      ...defaultRecord,
      ...mergedRecord,
      permissions: mergePermissionFlags(defaultRecord.permissions, mergedRecord.permissions)
    }
  })

  const knownModules = new Set(moduleDefinitions.map(definition => definition.module))

  merged.forEach((record, moduleName) => {
    if (!knownModules.has(moduleName)) {
      normalizedModules.push(record)
    }
  })

  return normalizedModules
}

export const isAlwaysEnabledModule = moduleName => {
  return alwaysEnabledModules.includes(getCanonicalModuleName(moduleName))
}

export const allnames = moduleDefinitions.map((definition, index) => ({
  id: index + 1,
  name: definition.module,
  label: definition.label
}))

export const settingsModules = [
  'accountSettings',
  'companySettings',
  'invoiceSettings',
  'invoiceTemplate',
  'signature',
  'paymentSettings',
  'bankSettings',
  'taxSettings',
  'emailSettings',
  'preferenceSettings',
  'notificationSettings',
  'changePassword'
]
