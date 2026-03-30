const normalizeBranchValue = value => String(value || '').trim();

export const isStoreBranch = branch =>
  normalizeBranchValue(branch?.branchType || branch?.kind).toLowerCase() === 'store';

export const getBranchIdentifiers = branch =>
  [branch?.branchId, branch?._id].map(normalizeBranchValue).filter(Boolean);

export const resolveBranchId = branch => getBranchIdentifiers(branch)[0] || '';

export const findBranchByIdentifier = (branches = [], value = '') => {
  const normalizedValue = normalizeBranchValue(value);
  if (!normalizedValue) return null;

  return (Array.isArray(branches) ? branches : []).find(branch =>
    getBranchIdentifiers(branch).includes(normalizedValue)
  ) || null;
};

export const mergeAccessibleBranches = ({
  companyMembership = {},
  branchesData = [],
  predicate = () => true,
} = {}) => {
  const accessibleBranches = Array.isArray(companyMembership?.accessibleBranches)
    ? companyMembership.accessibleBranches.filter(predicate)
    : [];
  const bootstrapBranches = Array.isArray(branchesData)
    ? branchesData.filter(predicate)
    : [];

  if (accessibleBranches.length === 0) {
    return [];
  }

  const bootstrapBranchMap = new Map();
  bootstrapBranches.forEach(branch => {
    getBranchIdentifiers(branch).forEach(identifier => {
      bootstrapBranchMap.set(identifier, branch);
    });
  });

  const seenBranchIds = new Set();

  return accessibleBranches.reduce((items, accessibleBranch) => {
    const bootstrapMatch = getBranchIdentifiers(accessibleBranch)
      .map(identifier => bootstrapBranchMap.get(identifier))
      .find(Boolean);
    const mergedBranch = bootstrapMatch
      ? { ...accessibleBranch, ...bootstrapMatch }
      : accessibleBranch;
    const canonicalBranchId = resolveBranchId(mergedBranch);

    if (!canonicalBranchId || seenBranchIds.has(canonicalBranchId)) {
      return items;
    }

    seenBranchIds.add(canonicalBranchId);
    items.push(mergedBranch);
    return items;
  }, []);
};

export const mergeAccessibleStoreBranches = ({
  companyMembership = {},
  branchesData = [],
} = {}) =>
  mergeAccessibleBranches({
    companyMembership,
    branchesData,
    predicate: isStoreBranch,
  });

export const getPrimaryStoreBranch = (branches = [], primaryBranchId = '') =>
  findBranchByIdentifier(branches, primaryBranchId);
