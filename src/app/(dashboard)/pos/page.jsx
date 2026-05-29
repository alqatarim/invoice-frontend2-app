import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/Auth/auth';
import {
  getCanonicalModuleName,
  getCanonicalPermissionAction,
  normalizePermissionFlags,
  normalizePermissionModules,
} from '@/common/allModules';
import PosIndex from '@/views/pos';
import {
  getBanks,
  getCustomers,
  getManualSignatures,
  getPosBootstrap,
  getProducts,
  getTaxRates,
} from '@/app/(dashboard)/pos/actions';

export const metadata = {
  title: 'Point Of Sale | Kanakku',
};

const hasServerPermission = (permissionRes, moduleName, actionName) => {
  if (!permissionRes) return false;
  if (permissionRes.allModules) return true;

  const moduleKey = getCanonicalModuleName(moduleName);
  const actionKey = getCanonicalPermissionAction(actionName);
  const moduleRecord = normalizePermissionModules(permissionRes.modules || [])
    .find(item => item.module === moduleKey);
  const permissions = normalizePermissionFlags(moduleRecord?.permissions);

  return Boolean(permissions.all || permissions[actionKey]);
};

const PosPageRoute = async () => {
  const session = await getServerSession(authOptions);
  const permissionRes = session?.user?.permissionRes;
  const initialCanCreateInvoice = hasServerPermission(permissionRes, 'invoice', 'create');
  const initialCanAccessPos =
    initialCanCreateInvoice || hasServerPermission(permissionRes, 'invoice', 'view');

  let initialCustomersData = [];
  let initialProductData = [];
  let initialTaxRates = [];
  let initialBanks = [];
  let initialSignatures = [];
  let initialBranchesData = [];
  let initialPosSettings = {};
  let initialInvoiceNumber = '';
  let initialPaymentMethods = [];
  let initialCashiers = [];
  let initialCurrentUserId = '';
  let initialErrorMessage = '';

  try {
    if (initialCanAccessPos) {
      const [
        customersData,
        productData,
        taxRates,
        banks,
        signatures,
        posBootstrap,
      ] = await Promise.all([
        getCustomers(),
        getProducts(),
        getTaxRates(),
        getBanks(),
        getManualSignatures(),
        getPosBootstrap(),
      ]);

      initialCustomersData = customersData || [];
      initialProductData = productData || [];
      initialTaxRates = taxRates || [];
      initialBanks = banks || [];
      initialSignatures = signatures || [];
      initialBranchesData = posBootstrap?.branches || [];
      initialPosSettings = posBootstrap?.settings || {};
      initialInvoiceNumber = posBootstrap?.invoiceNumber || '';
      initialPaymentMethods = posBootstrap?.paymentMethods || [];
      initialCashiers = posBootstrap?.cashiers || [];
      initialCurrentUserId = posBootstrap?.currentUserId || '';
    }
  } catch (error) {
    console.error('Error loading POS page data:', error);
    initialErrorMessage = error?.message || 'Failed to load data for POS.';
  }

  return (
    <PosIndex
      initialCustomersData={initialCustomersData}
      initialProductData={initialProductData}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialBranchesData={initialBranchesData}
      initialPosSettings={initialPosSettings}
      initialInvoiceNumber={initialInvoiceNumber}
      initialPaymentMethods={initialPaymentMethods}
      initialCashiers={initialCashiers}
      initialCurrentUserId={initialCurrentUserId}
      initialCanAccessPos={initialCanAccessPos}
      initialCanCreateInvoice={initialCanCreateInvoice}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default PosPageRoute;
