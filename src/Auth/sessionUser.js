export const buildSessionUser = (authData = {}, fallbackEmail = '') => {
  const profileDetails = authData.profileDetails || {}
  const firstName = authData.firstName || profileDetails.firstName || ''
  const lastName = authData.lastName || profileDetails.lastName || ''
  const email = authData.email || fallbackEmail || ''
  const name =
    authData.name ||
    `${firstName} ${lastName}`.trim() ||
    email ||
    'User'

  return {
    id: authData.id || authData._id || profileDetails.id || '',
    email,
    name,
    image: authData.image || profileDetails.image || '',
    firstName,
    lastName,
    gender: authData.gender || profileDetails.gender || '',
    role: authData.role || '',
    authProvider: authData.authProvider || 'credentials',
    hasPassword: Boolean(authData.hasPassword),
    permissionRes: authData.permissionRes || null,
    companyDetails: authData.companyDetails || null,
    companyMembership: authData.companyMembership || null,
    accessibleBranches: authData.accessibleBranches || [],
    currencySymbol: authData.currencySymbol || '',
  }
}

export const buildAuthSession = (authData = {}, fallbackEmail = '') => ({
  token: authData.token || '',
  user: buildSessionUser(authData, fallbackEmail),
})
