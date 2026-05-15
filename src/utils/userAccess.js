import { findBranchByIdentifier } from '@/utils/branchAccess';
import { locationTypeIcons } from '@/data/dataSets';

const normalizeValue = value => String(value || '').trim();

export const formatAccessLabel = (value = '', fallback = '') => {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) return fallback;

  return normalizedValue
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, character => character.toUpperCase());
};

export const formatAccessList = (values = [], fallback = '') => {
  const labels = [...new Set(
    (Array.isArray(values) ? values : [])
      .map(value => formatAccessLabel(value))
      .filter(Boolean)
  )];

  return labels.length > 0 ? labels.join(', ') : fallback;
};

export const getAssignedLocationNames = (branches = []) => {
  const seenNames = new Set();

  return (Array.isArray(branches) ? branches : []).reduce((items, branch) => {
    const branchName = normalizeValue(branch?.name);
    const branchKey = branchName.toLowerCase();

    if (!branchName || seenNames.has(branchKey)) return items;

    seenNames.add(branchKey);
    items.push(branchName);

    return items;
  }, []);
};

export const getPrimaryLocationName = ({
  branches = [],
  primaryBranchId = '',
  primaryBranchName = '',
} = {}) => {
  const branchList = Array.isArray(branches) ? branches : [];
  const matchedPrimaryBranch = findBranchByIdentifier(branchList, primaryBranchId);

  if (matchedPrimaryBranch?.name) {
    return matchedPrimaryBranch.name;
  }

  const defaultBranch = branchList.find(branch => branch?.isDefault && normalizeValue(branch?.name));

  if (defaultBranch?.name) {
    return defaultBranch.name;
  }

  const fallbackPrimaryName = normalizeValue(primaryBranchName);

  if (fallbackPrimaryName) {
    return fallbackPrimaryName;
  }

  return getAssignedLocationNames(branchList)[0] || '';
};

export const buildLocationPreview = ({
  branches = [],
  primaryBranchId = '',
  primaryBranchName = '',
  previewCount = 2,
} = {}) => {
  const names = getAssignedLocationNames(branches);
  const primaryLocationName = getPrimaryLocationName({
    branches,
    primaryBranchId,
    primaryBranchName,
  });
  const orderedNames = primaryLocationName
    ? [primaryLocationName, ...names.filter(name => name !== primaryLocationName)]
    : names;
  const safePreviewCount = Math.max(Number(previewCount) || 0, 1);

  return {
    names: orderedNames,
    total: orderedNames.length,
    primaryLocationName,
    preview: orderedNames.slice(0, safePreviewCount).join(', '),
    overflowCount: Math.max(orderedNames.length - safePreviewCount, 0),
  };
};

export const buildLocationDisplayLabel = (
  options = {},
  emptyLabel = 'No assigned locations'
) => {
  const { total, primaryLocationName, names } = buildLocationPreview(options);

  if (!total) {
    return emptyLabel;
  }

  if (primaryLocationName) {
    const remainingCount = Math.max(total - 1, 0);

    return remainingCount > 0
      ? `${primaryLocationName} +${remainingCount} more`
      : primaryLocationName;
  }

  if (total === 1) {
    return names[0];
  }

  return `${total} assigned locations`;
};

export const getLocationTypeIcon = (branchType, filled = false) => {
  const entry = locationTypeIcons[branchType] || locationTypeIcons.Store;
  return filled ? entry.filledIcon : entry.icon;
};
