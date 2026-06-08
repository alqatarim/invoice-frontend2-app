'use client';

import { useMemo } from 'react';
import { useSession } from '@/Auth/SessionContext';
import { usePermission } from '@/Auth/usePermission';
import { usePermissions } from '@/Auth/PermissionsContext';
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
  initialCashiers = [],
  initialCurrentUserId = '',
  initialCanAccessPos = false,
  initialCanCreateInvoice = false,
  initialErrorMessage = '',
  onSave,
  enqueueSnackbar,
  closeSnackbar,
}) {
  const { data: session } = useSession();
  const permissions = usePermissions();
  const isPermissionsLoading = Boolean(permissions?.isLoading);
  const clientCanViewInvoice = usePermission('invoice', 'view');
  const clientCanCreateInvoice = usePermission('invoice', 'create');
  const canCreateInvoice = permissions?.isReady
    ? clientCanCreateInvoice
    : initialCanCreateInvoice;
  const canAccessPos = permissions?.isReady
    ? clientCanViewInvoice || clientCanCreateInvoice
    : initialCanAccessPos;

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
    cashiersData: initialCashiers,
    currentUserId: initialCurrentUserId || session?.user?.id || '',
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    initialErrorMessage,
  });

  return {
    controller,
    canAccessPos,
    canCreateInvoice,
    isPermissionsLoading: isPermissionsLoading && !initialCanAccessPos,
    primaryStore,
  };
}
