'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import {
  getPrimaryStoreBranch,
  mergeAccessibleStoreBranches,
} from '@/utils/branchAccess';
import usePosPageController from './posPageController';

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
  const allowedPosStores = useMemo(() => {
    return mergeAccessibleStoreBranches({
      companyMembership,
      branchesData: initialBranchesData,
    });
  }, [companyMembership, initialBranchesData]);
  const primaryStore = useMemo(
    () => getPrimaryStoreBranch(allowedPosStores, companyMembership?.primaryBranchId),
    [allowedPosStores, companyMembership?.primaryBranchId]
  );

  const controller = usePosPageController({
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
    initialErrorMessage,
  });

  return {
    controller,
    canAccessPos,
    canCreateInvoice,
    primaryStore,
  };
}
