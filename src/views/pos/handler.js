'use client';

import { useMemo } from 'react';
import { useSession } from '@/Auth/SessionContext';
import { usePosAccess } from '@/Auth/usePermission';
import {
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
  const clientPosAccess = usePosAccess();
  const canCreateInvoice = clientPosAccess.isReady
    ? clientPosAccess.canCreatePosSale
    : initialCanCreateInvoice;
  const canAccessPos = clientPosAccess.isReady
    ? clientPosAccess.canAccessPos
    : initialCanAccessPos;

  const companyMembership = session?.user?.companyMembership || {};
  const allowedPosStores = useMemo(() => {
    return mergeAccessibleStoreBranches({
      companyMembership,
      branchesData: initialBranchesData,
    });
  }, [companyMembership, initialBranchesData]);

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
    isPermissionsLoading: clientPosAccess.isLoading && !initialCanAccessPos,
  };
}
