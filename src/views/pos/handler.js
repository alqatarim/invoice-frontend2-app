'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import usePosPageHandlers from '@/handlers/pos/usePosPageHandlers';

const isStoreBranch = (branch) =>
  String(branch?.branchType || branch?.kind || '').trim().toLowerCase() === 'store';

const getBranchIdentifiers = (branch) =>
  [branch?.branchId, branch?._id]
    .map((entry) => String(entry || '').trim())
    .filter(Boolean);

const findBranchByIdentifier = (branches = [], value = '') =>
  (Array.isArray(branches) ? branches : []).find((branch) =>
    getBranchIdentifiers(branch).includes(String(value || '').trim())
  ) || null;

export function usePosViewHandler({
  initialCustomersData = [],
  initialProductData = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialBranchesData = [],
  initialPosSettings = {},
  initialInvoiceNumber = '',
  initialPaymentMethods = [],
  initialErrorMessage = '',
  onSave,
  enqueueSnackbar,
  closeSnackbar,
}) {
  const { data: session } = useSession();
  const canViewInvoice = usePermission('invoice', 'view');
  const canCreateInvoice = usePermission('invoice', 'create');
  const canAccessPos = canViewInvoice || canCreateInvoice;

  const companyMembership = session?.user?.companyMembership || {};
  const accessibleStores = Array.isArray(companyMembership?.accessibleBranches)
    ? companyMembership.accessibleBranches.filter(isStoreBranch)
    : [];
  const bootstrapStores = useMemo(
    () => (Array.isArray(initialBranchesData) ? initialBranchesData : []).filter(isStoreBranch),
    [initialBranchesData]
  );
  const allowedPosStores = useMemo(() => {
    if (accessibleStores.length === 0) {
      return [];
    }

    const bootstrapStoreMap = new Map();
    bootstrapStores.forEach((branch) => {
      getBranchIdentifiers(branch).forEach((identifier) => {
        bootstrapStoreMap.set(identifier, branch);
      });
    });

    const seenBranchIds = new Set();

    return accessibleStores.reduce((stores, accessibleBranch) => {
      const bootstrapMatch = getBranchIdentifiers(accessibleBranch)
        .map((identifier) => bootstrapStoreMap.get(identifier))
        .find(Boolean);
      const mergedBranch = bootstrapMatch
        ? { ...accessibleBranch, ...bootstrapMatch }
        : accessibleBranch;
      const canonicalBranchId = getBranchIdentifiers(mergedBranch)[0] || '';

      if (!canonicalBranchId || seenBranchIds.has(canonicalBranchId)) {
        return stores;
      }

      seenBranchIds.add(canonicalBranchId);
      stores.push(mergedBranch);
      return stores;
    }, []);
  }, [accessibleStores, bootstrapStores]);

  const primaryStore = findBranchByIdentifier(
    allowedPosStores,
    companyMembership?.primaryBranchId
  );

  const controller = usePosPageHandlers({
    customersData: initialCustomersData,
    productData: initialProductData,
    initialBanks,
    signatures: initialSignatures,
    invoiceNumber: initialInvoiceNumber,
    allowedBranchesData: allowedPosStores,
    posSettings: initialPosSettings,
    bootstrapPaymentMethods: initialPaymentMethods,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    preferredBranchId: primaryStore?.branchId || primaryStore?._id || '',
    initialErrorMessage,
  });

  return {
    controller,
    canAccessPos,
    canCreateInvoice,
    primaryStore,
  };
}
