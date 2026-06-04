const normalizeText = value => String(value || '').trim();

export const normalizeUserId = value => {
  if (!value) return '';
  if (typeof value === 'object' && value !== null) {
    return normalizeText(value._id || value.id || value.$oid);
  }
  return normalizeText(value);
};

export const normalizeLocationTypeValue = (branch = {}) => {
  const raw = normalizeText(branch?.type || branch?.kind).toUpperCase();
  if (raw === 'STORE' || raw === 'WAREHOUSE') return raw;

  const branchType = normalizeText(branch?.branchType).toLowerCase();
  if (branchType === 'warehouse') return 'WAREHOUSE';
  if (branchType === 'store') return 'STORE';

  return 'STORE';
};

export const resolveProvinceSelectValue = (storedValue, provincesCities = []) => {
  const raw = normalizeText(storedValue);
  if (!raw) return '';

  const list = Array.isArray(provincesCities) ? provincesCities : [];
  const exactProvince = list.find(item => item.province === raw);
  if (exactProvince) return exactProvince.province;

  const byDisplay = list.find(item => item.display_name === raw);
  if (byDisplay) return byDisplay.province;

  const insensitive = list.find(
    item =>
      normalizeText(item.province).toLowerCase() === raw.toLowerCase() ||
      normalizeText(item.display_name).toLowerCase() === raw.toLowerCase()
  );

  return insensitive?.province || raw;
};

export const resolveProvinceDisplayName = (storedValue, provincesCities = []) => {
  const raw = normalizeText(storedValue);
  if (!raw) return '';

  const list = Array.isArray(provincesCities) ? provincesCities : [];
  const exactProvince = list.find(item => item.province === raw);
  if (exactProvince?.display_name) return exactProvince.display_name;

  const byDisplay = list.find(item => item.display_name === raw);
  if (byDisplay?.display_name) return byDisplay.display_name;

  const insensitive = list.find(
    item =>
      normalizeText(item.province).toLowerCase() === raw.toLowerCase() ||
      normalizeText(item.display_name).toLowerCase() === raw.toLowerCase()
  );

  return insensitive?.display_name || raw;
};

export const resolveCitySelectValue = (storedCity, provinceValue, provincesCities = []) => {
  const raw = normalizeText(storedCity);
  if (!raw) return '';

  const list = Array.isArray(provincesCities) ? provincesCities : [];
  const provinceEntry = list.find(item => item.province === provinceValue);
  const cities = provinceEntry?.cities || [];

  const exact = cities.find(city => city.name === raw);
  if (exact) return exact.name;

  const insensitive = cities.find(
    city => normalizeText(city.name).toLowerCase() === raw.toLowerCase()
  );

  return insensitive?.name || raw;
};

export const resolveDefaultAdminFormFields = (branch = {}) => ({
  defaultAdminUserId: normalizeUserId(branch?.defaultAdminUserId),
  defaultAdminFirstName: branch?.defaultAdminFirstName || '',
  defaultAdminLastName: branch?.defaultAdminLastName || '',
  defaultAdminUserName: branch?.defaultAdminUserName || '',
  defaultAdminEmail: branch?.defaultAdminEmail || '',
  defaultAdminMobileNumber: branch?.defaultAdminMobileNumber || '',
  defaultAdminPassword: '',
});

export const getBranchDialogInitialForm = (branch, provincesCities = []) => {
  const province = resolveProvinceSelectValue(branch?.province, provincesCities);
  const city = resolveCitySelectValue(branch?.city, province, provincesCities);
  const adminFields = resolveDefaultAdminFormFields(branch);

  return {
    name: branch?.name || '',
    type: normalizeLocationTypeValue(branch),
    storeCode: branch?.storeCode || '',
    province,
    city,
    district: branch?.district || '',
    address: branch?.address || '',
    phone: branch?.phone || '',
    email: branch?.email || '',
    notes: branch?.notes || '',
    status: branch?.status !== false,
    ...adminFields,
  };
};
