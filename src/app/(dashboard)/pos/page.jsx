import React from 'react';
import PosIndex from '@/views/pos';
import { getPosAccess } from '@/Auth/permissions';
import { getServerSessionUser } from '@/Auth/serverAuth';
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

const getSettledValue = (result, fallback) =>
  result?.status === 'fulfilled' ? result.value || fallback : fallback;

const PosPageRoute = async () => {
  const sessionUser = getServerSessionUser();
  const { canAccessPos: initialCanAccessPos, canCreatePosSale: initialCanCreateInvoice } =
    getPosAccess(sessionUser?.permissionRes);

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
    if (sessionUser?.token) {
      const [
        customersResult,
        productsResult,
        taxRatesResult,
        banksResult,
        signaturesResult,
        posBootstrapResult,
      ] = await Promise.allSettled([
        getCustomers(),
        getProducts(),
        getTaxRates(),
        getBanks(),
        getManualSignatures(),
        getPosBootstrap(),
      ]);

      const customersData = getSettledValue(customersResult, []);
      const productData = getSettledValue(productsResult, []);
      const taxRates = getSettledValue(taxRatesResult, []);
      const banks = getSettledValue(banksResult, []);
      const signatures = getSettledValue(signaturesResult, []);
      const posBootstrap = getSettledValue(posBootstrapResult, {});

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

      const failedRequest = [
        customersResult,
        productsResult,
        taxRatesResult,
        banksResult,
        signaturesResult,
        posBootstrapResult,
      ].find(result => result.status === 'rejected');

      if (failedRequest) {
        initialErrorMessage = failedRequest.reason?.message || 'Some POS data could not be loaded.';
      }
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
