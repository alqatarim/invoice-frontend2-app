export const normalizeCompanyProfile = data => {
  if (!data || typeof data !== 'object') {
    return {}
  }

  if (data.updatedData && typeof data.updatedData === 'object') {
    return data.updatedData
  }

  return data
}
